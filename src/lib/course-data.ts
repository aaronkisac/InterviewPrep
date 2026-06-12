// Server-side course queries. Service-role client (RLS deny-direct tables).
// Client Components must never import this — pure data shaping for pages.

import { createAdminClient } from "@/lib/supabase/admin";
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
