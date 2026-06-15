// Server-side course queries. Service-role client (RLS deny-direct tables).
// Client Components must never import this — pure data shaping for pages.

import { createAdminClient } from "@/lib/supabase/admin";
import { deriveCoursePath } from "@/lib/course/path-state";
import { validateSteps, type ChallengeStep, type Step } from "@/lib/course/step-schema";
import type { MockOption } from "@/lib/mock-shared";
import type { UnitSection } from "@/lib/supabase/types";

export type CourseLessonMeta = {
  id: string;
  slug: string;
  title: string;
  titleTr: string;
  position: number;
};

export type CourseUnitMeta = {
  id: string;
  slug: string;
  title: string;
  titleTr: string;
  section: UnitSection;
  position: number;
  lessons: CourseLessonMeta[];
};

/** All units + lesson metadata for a topic's course, ordered by position. */
export async function getCourseUnits(
  topicSlug: string,
): Promise<CourseUnitMeta[]> {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("units")
    .select("id, slug, title, title_tr, section, position, lessons(id, slug, title, title_tr, position)")
    .eq("topic_slug", topicSlug)
    .order("position", { ascending: true });

  if (error) {
    console.error("[getCourseUnits]", error.message);
    return [];
  }

  return (data ?? []).map((u) => ({
    id: u.id as string,
    slug: u.slug as string,
    title: u.title as string,
    titleTr: u.title_tr as string,
    section: u.section as UnitSection,
    position: u.position as number,
    lessons: (
      (u.lessons ?? []) as Array<{
        id: string;
        slug: string;
        title: string;
        title_tr: string;
        position: number;
      }>
    )
      .map((l) => ({
        id: l.id,
        slug: l.slug,
        title: l.title,
        titleTr: l.title_tr,
        position: l.position,
      }))
      .sort((a, b) => a.position - b.position),
  }));
}

/** Lesson ids the user has completed (completed_at set). */
export async function getCompletedLessonIds(
  userId: string,
): Promise<Set<string>> {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("user_lesson_progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .not("completed_at", "is", null);

  if (error) {
    console.error("[getCompletedLessonIds]", error.message);
    return new Set();
  }
  return new Set((data ?? []).map((r) => r.lesson_id as string));
}

/**
 * Latest activity timestamp per topic for a user, derived from
 * `user_lesson_progress`. A topic only appears here once the user has *saved*
 * progress (a row exists — written by `recordLessonResult`); merely opening
 * and leaving a course without finishing a lesson writes nothing, so it won't
 * show up. Used to float recently-worked topics to the top of the /learn grid.
 */
async function getLastActivityByTopic(
  userId: string,
): Promise<Map<string, string>> {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("user_lesson_progress")
    .select("updated_at, lessons(units(topic_slug))")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[getLastActivityByTopic]", error.message);
    return new Map();
  }

  // Rows arrive newest-first, so the first time we see a topic is its latest.
  const latest = new Map<string, string>();
  for (const row of data ?? []) {
    const slug = (
      row.lessons as unknown as {
        units: { topic_slug: string } | null;
      } | null
    )?.units?.topic_slug;
    const ts = row.updated_at as string | null;
    if (slug && ts && !latest.has(slug)) latest.set(slug, ts);
  }
  return latest;
}

// ---------------------------------------------------------------------------
// Course summaries — the /learn grid + dashboard card.
// ---------------------------------------------------------------------------

export type CourseSummary = {
  topicSlug: string;
  unitCount: number;
  lessonCount: number;
  /** Lessons the user completed in this course (0 for guests). */
  completedCount: number;
};

/** Every topic that has a course, with the user's completion counts. */
export async function listCourseSummaries(
  userId?: string,
): Promise<CourseSummary[]> {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("units")
    .select("topic_slug, lessons(id)")
    .order("topic_slug", { ascending: true });

  if (error) {
    console.error("[listCourseSummaries]", error.message);
    return [];
  }

  const [completed, lastActivity] = userId
    ? await Promise.all([
        getCompletedLessonIds(userId),
        getLastActivityByTopic(userId),
      ])
    : [new Set<string>(), new Map<string, string>()];

  const byTopic = new Map<string, CourseSummary>();
  for (const u of data ?? []) {
    const slug = u.topic_slug as string;
    const lessons = (u.lessons ?? []) as Array<{ id: string }>;
    const entry =
      byTopic.get(slug) ??
      ({ topicSlug: slug, unitCount: 0, lessonCount: 0, completedCount: 0 } satisfies CourseSummary);
    entry.unitCount += 1;
    entry.lessonCount += lessons.length;
    entry.completedCount += lessons.filter((l) => completed.has(l.id)).length;
    byTopic.set(slug, entry);
  }

  // `data` is ordered by topic_slug, so the values start alphabetical.
  // Float topics with saved progress to the top, most-recently-worked first;
  // topics with no progress keep their alphabetical order (stable sort).
  const summaries = [...byTopic.values()];
  summaries.sort((a, b) => {
    const ta = lastActivity.get(a.topicSlug);
    const tb = lastActivity.get(b.topicSlug);
    if (ta && tb) return tb.localeCompare(ta); // ISO timestamps → newest first
    if (ta) return -1; // a has progress, b doesn't → a first
    if (tb) return 1;
    return 0; // neither touched → keep alphabetical
  });
  return summaries;
}

/**
 * Up to `count` courses for the home page "dashboard" strip:
 * in-progress courses first (most-recently-worked, since listCourseSummaries
 * already sorts that way), then the remaining slots filled with random
 * untouched courses. Guests / no-progress users just get a random selection,
 * reshuffled on every load (the page is force-dynamic).
 */
export async function getFeaturedCourses(
  userId?: string,
  count = 3,
): Promise<CourseSummary[]> {
  const summaries = await listCourseSummaries(userId);

  const inProgress = summaries.filter((c) => c.completedCount > 0);
  const rest = summaries.filter((c) => c.completedCount === 0);

  // Fisher–Yates shuffle for the untouched pool.
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = rest[i];
    const b = rest[j];
    if (a && b) {
      rest[i] = b;
      rest[j] = a;
    }
  }

  return [...inProgress, ...rest].slice(0, count);
}

export type ContinueLearning = {
  topicSlug: string;
  /** Active lesson to jump into; null when the course is finished. */
  lessonId: string | null;
  lessonTitle: string;
  lessonTitleTr: string;
  unitTitle: string;
  unitTitleTr: string;
  completedCount: number;
  lessonCount: number;
};

/** The user's most recent course + its next (active) lesson. */
export async function getContinueLearning(
  userId: string,
): Promise<ContinueLearning | null> {
  const sb = createAdminClient();

  const { data: latest } = await sb
    .from("user_lesson_progress")
    .select("lesson_id, updated_at, lessons(unit_id, units(topic_slug))")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const topicSlug = (
    latest?.lessons as unknown as { units?: { topic_slug?: string } } | null
  )?.units?.topic_slug;
  if (!topicSlug) return null;

  const [units, completed] = await Promise.all([
    getCourseUnits(topicSlug),
    getCompletedLessonIds(userId),
  ]);
  if (units.length === 0) return null;

  // Single source of truth for unlock rules — path-state is pure/server-safe.
  const state = deriveCoursePath(
    units.map((u) => ({
      id: u.id,
      position: u.position,
      lessons: u.lessons.map((l) => ({ id: l.id, position: l.position })),
    })),
    completed,
  );
  const activeUnit =
    units.find((u) =>
      u.lessons.some((l) => l.id === state.activeLessonId),
    ) ?? null;
  const activeLesson =
    activeUnit?.lessons.find((l) => l.id === state.activeLessonId) ?? null;

  const lessonCount = units.reduce((s, u) => s + u.lessons.length, 0);
  const completedCount = units.reduce(
    (s, u) => s + u.lessons.filter((l) => completed.has(l.id)).length,
    0,
  );

  return {
    topicSlug,
    lessonId: activeLesson?.id ?? null,
    lessonTitle: activeLesson?.title ?? "",
    lessonTitleTr: activeLesson?.titleTr ?? "",
    unitTitle: activeUnit?.title ?? "",
    unitTitleTr: activeUnit?.titleTr ?? "",
    completedCount,
    lessonCount,
  };
}

// ---------------------------------------------------------------------------
// Lesson bundle — everything the player needs in one fetch.
// ---------------------------------------------------------------------------

export type ChallengeData = {
  question: string;
  questionTr: string;
  options: MockOption[];
};

export type LessonBundle = {
  id: string;
  slug: string;
  title: string;
  titleTr: string;
  position: number;
  unit: {
    id: string;
    slug: string;
    title: string;
    titleTr: string;
    topicSlug: string;
  };
  steps: Step[];
  /** Challenge payloads keyed by question UUID. */
  challenges: Record<string, ChallengeData>;
  /** Next lesson in the same unit, if any. */
  nextLessonId: string | null;
};

export async function getLessonBundle(
  lessonId: string,
): Promise<LessonBundle | null> {
  const sb = createAdminClient();

  const { data, error } = await sb
    .from("lessons")
    .select(
      "id, slug, title, title_tr, position, steps, units(id, slug, title, title_tr, topic_slug)",
    )
    .eq("id", lessonId)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[getLessonBundle]", error.message);
    return null;
  }

  const unit = data.units as unknown as {
    id: string;
    slug: string;
    title: string;
    title_tr: string;
    topic_slug: string;
  } | null;
  if (!unit) return null;

  const parsed = validateSteps(data.steps);
  if (!parsed.ok) {
    console.error(
      `[getLessonBundle] invalid steps for lesson ${lessonId}:`,
      parsed.errors.join("; "),
    );
    return null;
  }
  const steps = parsed.value;

  // Hydrate challenge steps with question text + mock options
  const challengeIds = steps
    .filter((s): s is ChallengeStep => s.type === "challenge")
    .map((s) => s.questionId)
    .filter((id): id is string => typeof id === "string");

  const challenges: Record<string, ChallengeData> = {};
  if (challengeIds.length > 0) {
    const [questionsResult, optionsResult] = await Promise.all([
      sb
        .from("questions")
        .select("id, question, question_tr")
        .in("id", challengeIds),
      sb
        .from("mock_options")
        .select("id, question_id, option_text, option_text_tr, is_correct, explanation, explanation_tr")
        .in("question_id", challengeIds),
    ]);

    const optionsByQuestion = new Map<string, MockOption[]>();
    for (const o of optionsResult.data ?? []) {
      const list = optionsByQuestion.get(o.question_id as string) ?? [];
      list.push({
        id: o.id as string,
        text: o.option_text as string,
        textTr: o.option_text_tr as string,
        isCorrect: o.is_correct as boolean,
        explanation: o.explanation as string,
        explanationTr: o.explanation_tr as string,
      });
      optionsByQuestion.set(o.question_id as string, list);
    }

    for (const q of questionsResult.data ?? []) {
      challenges[q.id as string] = {
        question: q.question as string,
        questionTr: q.question_tr as string,
        options: optionsByQuestion.get(q.id as string) ?? [],
      };
    }
  }

  const { data: next } = await sb
    .from("lessons")
    .select("id")
    .eq("unit_id", unit.id)
    .gt("position", data.position as number)
    .order("position", { ascending: true })
    .limit(1)
    .maybeSingle();

  return {
    id: data.id as string,
    slug: data.slug as string,
    title: data.title as string,
    titleTr: data.title_tr as string,
    position: data.position as number,
    unit: {
      id: unit.id,
      slug: unit.slug,
      title: unit.title,
      titleTr: unit.title_tr,
      topicSlug: unit.topic_slug,
    },
    steps,
    challenges,
    nextLessonId: (next?.id as string | undefined) ?? null,
  };
}
