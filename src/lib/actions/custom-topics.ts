"use server";

import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

// ── Types ────────────────────────────────────────────────────────────────────

export type CustomTopic = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  question_count: number;
};

export type CustomQuestion = {
  id: string;
  topic_id: string;
  question: string;
  answer: string;
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

  // Count questions per topic
  const topicIds = (data ?? []).map((t) => t.id);
  if (topicIds.length === 0) return [];

  const { data: counts } = await sb
    .from("custom_questions")
    .select("topic_id")
    .in("topic_id", topicIds);

  const countMap: Record<string, number> = {};
  for (const row of counts ?? []) {
    countMap[row.topic_id] = (countMap[row.topic_id] ?? 0) + 1;
  }

  return (data ?? []).map((t) => ({
    ...t,
    question_count: countMap[t.id] ?? 0,
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
    .select("id, topic_id, question, answer, position, created_at, updated_at")
    .in("topic_id", topicIds)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  const questionsMap: Record<string, CustomQuestion[]> = {};
  for (const q of questionsData ?? []) {
    if (!questionsMap[q.topic_id]) questionsMap[q.topic_id] = [];
    questionsMap[q.topic_id].push(q);
  }

  const topicsWithCount: CustomTopic[] = topics.map((t) => ({
    ...t,
    question_count: (questionsMap[t.id] ?? []).length,
  }));

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
    .select("id, topic_id, question, answer, position, created_at, updated_at")
    .eq("topic_id", topic.id)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  return {
    topic: { ...topic, question_count: (questions ?? []).length },
    questions: questions ?? [],
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

  const { data, error } = await sb
    .from("custom_questions")
    .insert({
      user_id: userId,
      topic_id: topicId,
      question: trimmedQ,
      answer: answer.trim(),
      position: count ?? 0,
    })
    .select("id, topic_id, question, answer, position, created_at, updated_at")
    .single();

  if (error || !data) {
    console.error("[createCustomQuestion]", error?.message);
    return { ok: false };
  }

  return { ok: true, question: data };
}

export async function updateCustomQuestion(
  id: string,
  question: string,
  answer: string,
): Promise<{ ok: boolean }> {
  const trimmedQ = question.trim();
  if (!trimmedQ) return { ok: false };

  const userId = await requireUser();
  const sb = createAdminClient();

  const { error } = await sb
    .from("custom_questions")
    .update({
      question: trimmedQ,
      answer: answer.trim(),
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
