"use server";

import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { MockOptionInput } from "@/types/mock";

// ── Types ────────────────────────────────────────────────────────────────────

export type CustomTopic = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  question_count: number;
  mock_question_count: number;
};

/** @deprecated Use MockOptionInput from @/types/mock */
export type MockOption = MockOptionInput;

export type CustomQuestion = {
  id: string;
  topic_id: string;
  question: string;
  answer: string;          // maps to answer_general in DB
  level: number;           // 1–5
  answer_personal: string | null;
  mock_options: MockOption[] | null;
  position: number;
  created_at: string;
  updated_at: string;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

// ── Topic actions ─────────────────────────────────────────────────────────────

export async function listCustomTopics(overrideUserId?: string): Promise<CustomTopic[]> {
  const userId = overrideUserId ?? (await requireUser());
  const sb = createAdminClient();

  const { data, error } = await sb
    .from("custom_topics")
    .select("id, name, slug, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[listCustomTopics]", error.message);
    return [];
  }

  // Count questions and mock-ready questions per topic
  const topicIds = (data ?? []).map((t) => t.id);
  if (topicIds.length === 0) return [];

  const { data: counts } = await sb
    .from("custom_questions")
    .select("topic_id, mock_options")
    .in("topic_id", topicIds);

  const countMap: Record<string, number> = {};
  const mockCountMap: Record<string, number> = {};
  for (const row of counts ?? []) {
    countMap[row.topic_id] = (countMap[row.topic_id] ?? 0) + 1;
    const opts = Array.isArray(row.mock_options) ? (row.mock_options as MockOption[]) : [];
    const correctCount = opts.filter((o) => o.isCorrect).length;
    if (opts.length === 4 && correctCount === 1) {
      mockCountMap[row.topic_id] = (mockCountMap[row.topic_id] ?? 0) + 1;
    }
  }

  return (data ?? []).map((t) => ({
    ...t,
    question_count: countMap[t.id] ?? 0,
    mock_question_count: mockCountMap[t.id] ?? 0,
  }));
}

// Fetch all topics + their questions in two queries — used by dashboard
export async function listTopicsWithQuestions(): Promise<{
  topics: CustomTopic[];
  questionsMap: Record<string, CustomQuestion[]>;
}> {
  const userId = await requireUser();
  const sb = createAdminClient();

  const { data: topicsData } = await sb
    .from("custom_topics")
    .select("id, name, slug, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const topics = topicsData ?? [];
  if (topics.length === 0) return { topics: [], questionsMap: {} };

  const topicIds = topics.map((t) => t.id);

  const { data: questionsData } = await sb
    .from("custom_questions")
    .select("id, topic_id, question, answer, level, answer_personal, mock_options, position, created_at, updated_at")
    .in("topic_id", topicIds)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  const questionsMap: Record<string, CustomQuestion[]> = {};
  for (const q of questionsData ?? []) {
    if (!questionsMap[q.topic_id]) questionsMap[q.topic_id] = [];
    questionsMap[q.topic_id]!.push(q);
  }

  const topicsWithCount: CustomTopic[] = topics.map((t) => {
    const qs = questionsMap[t.id] ?? [];
    const mock_question_count = qs.filter((q) => {
      const opts = Array.isArray(q.mock_options) ? q.mock_options : [];
      return opts.length === 4 && opts.filter((o) => o.isCorrect).length === 1;
    }).length;
    return { ...t, question_count: qs.length, mock_question_count };
  });

  return { topics: topicsWithCount, questionsMap };
}

export async function getCustomTopic(
  slug: string,
  overrideUserId?: string,
): Promise<{ topic: CustomTopic; questions: CustomQuestion[] } | null> {
  const userId = overrideUserId ?? (await requireUser());
  const sb = createAdminClient();

  const { data: topic, error } = await sb
    .from("custom_topics")
    .select("id, name, slug, created_at")
    .eq("user_id", userId)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !topic) return null;

  const { data: questions } = await sb
    .from("custom_questions")
    .select("id, topic_id, question, answer, level, answer_personal, mock_options, position, created_at, updated_at")
    .eq("topic_id", topic.id)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  const qs = questions ?? [];
  const mock_question_count = qs.filter((q) => {
    const opts = Array.isArray(q.mock_options) ? q.mock_options : [];
    return opts.length === 4 && opts.filter((o) => o.isCorrect).length === 1;
  }).length;

  return {
    topic: { ...topic, question_count: qs.length, mock_question_count },
    questions: qs,
  };
}

export async function createCustomTopic(
  name: string,
): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Name cannot be empty" };
  if (trimmed.length > 80) return { ok: false, error: "Name too long (max 80 chars)" };

  const userId = await requireUser();
  const sb = createAdminClient();

  let slug = toSlug(trimmed);
  if (!slug) slug = "topic";

  // Ensure slug is unique for this user by appending a suffix if needed
  const { data: existing } = await sb
    .from("custom_topics")
    .select("slug")
    .eq("user_id", userId)
    .like("slug", `${slug}%`);

  const usedSlugs = new Set((existing ?? []).map((r) => r.slug));
  let finalSlug = slug;
  let counter = 2;
  while (usedSlugs.has(finalSlug)) {
    finalSlug = `${slug}-${counter++}`;
  }

  const { error } = await sb.from("custom_topics").insert({
    user_id: userId,
    name: trimmed,
    slug: finalSlug,
  });

  if (error) {
    console.error("[createCustomTopic]", error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true, slug: finalSlug };
}

export async function deleteCustomTopic(
  id: string,
): Promise<{ ok: boolean }> {
  const userId = await requireUser();
  const sb = createAdminClient();

  const { error } = await sb
    .from("custom_topics")
    .delete()
    .eq("id", id)
    .eq("user_id", userId); // ownership check

  if (error) {
    console.error("[deleteCustomTopic]", error.message);
    return { ok: false };
  }
  return { ok: true };
}

// ── Question actions ──────────────────────────────────────────────────────────

export async function createCustomQuestion(
  topicId: string,
  question: string,
  answer: string,
  level: number = 1,
  answer_personal?: string,
  mock_options?: MockOption[],
): Promise<{ ok: boolean; question?: CustomQuestion }> {
  const trimmedQ = question.trim();
  if (!trimmedQ) return { ok: false };

  const userId = await requireUser();
  const sb = createAdminClient();

  // Verify ownership
  const { data: topic } = await sb
    .from("custom_topics")
    .select("id")
    .eq("id", topicId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!topic) return { ok: false };

  // Set position to end
  const { count } = await sb
    .from("custom_questions")
    .select("*", { count: "exact", head: true })
    .eq("topic_id", topicId);

  const validMockOptions =
    Array.isArray(mock_options) && mock_options.length === 4 ? mock_options : null;

  const { data, error } = await sb
    .from("custom_questions")
    .insert({
      user_id: userId,
      topic_id: topicId,
      question: trimmedQ,
      answer: answer.trim(),
      level: Math.min(5, Math.max(1, level)),
      answer_personal: answer_personal?.trim() || null,
      mock_options: validMockOptions,
      position: count ?? 0,
    })
    .select("id, topic_id, question, answer, level, answer_personal, mock_options, position, created_at, updated_at")
    .single();

  if (error || !data) {
    console.error("[createCustomQuestion]", error?.message);
    return { ok: false };
  }

  return { ok: true, question: data as CustomQuestion };
}

export async function updateCustomQuestion(
  id: string,
  question: string,
  answer: string,
  level: number = 1,
  answer_personal?: string,
  mock_options?: MockOption[],
): Promise<{ ok: boolean }> {
  const trimmedQ = question.trim();
  if (!trimmedQ) return { ok: false };

  const validMockOptions =
    Array.isArray(mock_options) && mock_options.length === 4 ? mock_options : null;

  const userId = await requireUser();
  const sb = createAdminClient();

  const { error } = await sb
    .from("custom_questions")
    .update({
      question: trimmedQ,
      answer: answer.trim(),
      level: Math.min(5, Math.max(1, level)),
      answer_personal: answer_personal?.trim() || null,
      mock_options: validMockOptions,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("[updateCustomQuestion]", error.message);
    return { ok: false };
  }
  return { ok: true };
}

export async function deleteCustomQuestion(
  id: string,
): Promise<{ ok: boolean }> {
  const userId = await requireUser();
  const sb = createAdminClient();

  const { error } = await sb
    .from("custom_questions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("[deleteCustomQuestion]", error.message);
    return { ok: false };
  }
  return { ok: true };
}

// ── Mock integration helpers ──────────────────────────────────────────────────

/**
 * Returns MockReadyMeta-compatible entries for all custom questions that have
 * valid mock_options (exactly 4 with exactly 1 correct). The topic field uses
 * the "custom:<slug>" prefix convention so MockConfig can track them.
 */
export async function getCustomMockReadyMeta(
  userId: string,
): Promise<Array<{ topic: string; level: number }>> {
  const sb = createAdminClient();

  // Get all topics for this user first
  const { data: topicsData } = await sb
    .from("custom_topics")
    .select("id, slug")
    .eq("user_id", userId);

  if (!topicsData || topicsData.length === 0) return [];

  const topicSlugMap: Record<string, string> = {};
  for (const t of topicsData) topicSlugMap[t.id] = t.slug;

  const topicIds = topicsData.map((t) => t.id);

  const { data: questions } = await sb
    .from("custom_questions")
    .select("topic_id, level, mock_options")
    .in("topic_id", topicIds);

  const result: Array<{ topic: string; level: number }> = [];
  for (const q of questions ?? []) {
    const opts = Array.isArray(q.mock_options) ? (q.mock_options as MockOption[]) : [];
    if (opts.length !== 4 || opts.filter((o) => o.isCorrect).length !== 1) continue;
    const slug = topicSlugMap[q.topic_id];
    if (slug) {
      result.push({ topic: `custom:${slug}`, level: q.level ?? 1 });
    }
  }
  return result;
}

/**
 * Fetches mock-ready custom questions for the given slugs (without "custom:" prefix).
 * Returns them shaped for MockSession consumption.
 */
export async function getCustomMockQuestions(
  userId: string,
  slugs: string[],
): Promise<CustomQuestion[]> {
  if (slugs.length === 0) return [];
  const sb = createAdminClient();

  const { data: topicsData } = await sb
    .from("custom_topics")
    .select("id, slug")
    .eq("user_id", userId)
    .in("slug", slugs);

  if (!topicsData || topicsData.length === 0) return [];

  const topicIds = topicsData.map((t) => t.id);

  const { data: questions } = await sb
    .from("custom_questions")
    .select("id, topic_id, question, answer, level, answer_personal, mock_options, position, created_at, updated_at")
    .in("topic_id", topicIds);

  // Only return mock-ready questions
  return (questions ?? []).filter((q) => {
    const opts = Array.isArray(q.mock_options) ? (q.mock_options as MockOption[]) : [];
    return opts.length === 4 && opts.filter((o) => o.isCorrect).length === 1;
  }) as CustomQuestion[];
}

// ── Custom question bookmarks ─────────────────────────────────────────────────

export async function toggleCustomBookmark(
  customQuestionId: string,
): Promise<{ bookmarked: boolean } | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;
  const sb = createAdminClient();

  const { data: existing } = await sb
    .from("custom_question_bookmarks")
    .select("custom_question_id")
    .eq("user_id", userId)
    .eq("custom_question_id", customQuestionId)
    .maybeSingle();

  if (existing) {
    await sb
      .from("custom_question_bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("custom_question_id", customQuestionId);
    return { bookmarked: false };
  } else {
    await sb
      .from("custom_question_bookmarks")
      .insert({ user_id: userId, custom_question_id: customQuestionId });
    return { bookmarked: true };
  }
}

export async function getCustomBookmarkIds(overrideUserId?: string): Promise<string[]> {
  const userId = overrideUserId ?? (await auth())?.user?.id;
  if (!userId) return [];

  const sb = createAdminClient();
  const { data } = await sb
    .from("custom_question_bookmarks")
    .select("custom_question_id")
    .eq("user_id", userId);

  return (data ?? []).map((r) => r.custom_question_id as string);
}

/**
 * Returns the full CustomQuestion objects that the user has bookmarked,
 * across all of their custom topics. Used by the "Bookmarked" tab to
 * surface custom questions alongside system questions.
 */
export type BookmarkedCustomQuestion = CustomQuestion & { topicName: string };

export async function getBookmarkedCustomQuestions(
  overrideUserId?: string,
): Promise<BookmarkedCustomQuestion[]> {
  const userId = overrideUserId ?? (await auth())?.user?.id;
  if (!userId) return [];

  const sb = createAdminClient();

  // Step 1: get bookmarked IDs
  const { data: bookmarks } = await sb
    .from("custom_question_bookmarks")
    .select("custom_question_id")
    .eq("user_id", userId);

  if (!bookmarks || bookmarks.length === 0) return [];

  const ids = bookmarks.map((b) => b.custom_question_id as string);

  // Step 2: fetch questions + their topic name in one query
  const { data: questions } = await sb
    .from("custom_questions")
    .select("id, topic_id, question, answer, level, answer_personal, position, created_at, custom_topics(name)")
    .in("id", ids);

  if (!questions) return [];

  return questions.map((q) => ({
    id: q.id as string,
    topic_id: q.topic_id as string,
    question: q.question as string,
    answer: (q.answer as string) ?? "",
    level: (q.level as number) ?? 1,
    answer_personal: (q.answer_personal as string | null) ?? null,
    mock_options: null,
    position: (q.position as number) ?? 0,
    created_at: q.created_at as string,
    topicName: (q.custom_topics as { name: string } | null)?.name ?? "",
  }));
}
