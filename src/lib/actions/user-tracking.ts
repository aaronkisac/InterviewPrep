"use server";

import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Topic } from "@/lib/supabase/types";

// ============================================================================
// Mock session
// ============================================================================

export type SaveMockSessionInput = {
  score: number;
  total: number;
  topics: Topic[];
  /** Per-question results: question_id (UUID string) → correct */
  questionResults: Array<{ questionId: string; correct: boolean }>;
};

export async function saveMockSession(
  input: SaveMockSessionInput,
): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;
  const sb = createAdminClient();

  const { data, error } = await sb
    .from("mock_sessions")
    .insert({
      user_id: userId,
      score: input.score,
      total: input.total,
      topics: input.topics,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[saveMockSession]", error?.message);
    return null;
  }

  // Save per-question progress (upsert — last result wins)
  if (input.questionResults.length > 0) {
    const rows = input.questionResults.map((r) => ({
      user_id: userId,
      question_id: r.questionId,
      correct: r.correct,
      answered_at: new Date().toISOString(),
    }));

    const { error: progressError } = await sb
      .from("user_question_progress")
      .upsert(rows, { onConflict: "user_id,question_id" });

    if (progressError) {
      console.error("[saveMockSession:progress]", progressError.message);
    }
  }

  return data.id;
}

// ============================================================================
// Bookmarks
// ============================================================================

export async function toggleBookmark(
  questionId: string,
): Promise<{ bookmarked: boolean } | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;
  const sb = createAdminClient();

  // Check if already bookmarked
  const { data: existing } = await sb
    .from("bookmarks")
    .select("question_id")
    .eq("user_id", userId)
    .eq("question_id", questionId)
    .maybeSingle();

  if (existing) {
    await sb
      .from("bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("question_id", questionId);
    return { bookmarked: false };
  } else {
    await sb
      .from("bookmarks")
      .insert({ user_id: userId, question_id: questionId });
    return { bookmarked: true };
  }
}

export async function getBookmarkedIds(): Promise<string[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const sb = createAdminClient();
  const { data } = await sb
    .from("bookmarks")
    .select("question_id")
    .eq("user_id", session.user.id);

  return (data ?? []).map((r) => r.question_id as string);
}

// ============================================================================
// Dashboard data
// ============================================================================

export type DashboardData = {
  mockSessions: Array<{
    id: string;
    score: number;
    total: number;
    pct: number;
    topics: Topic[];
    createdAt: string;
  }>;
  topicProgress: Array<{
    topic: Topic;
    seen: number;
    correct: number;
  }>;
  bookmarkCount: number;
};

export async function getDashboardData(): Promise<DashboardData | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;
  const sb = createAdminClient();

  const [sessionsResult, progressResult, bookmarkResult] = await Promise.all([
    sb
      .from("mock_sessions")
      .select("id, score, total, topics, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10),
    sb
      .from("user_question_progress")
      .select("question_id, correct, questions!inner(topic)")
      .eq("user_id", userId),
    sb
      .from("bookmarks")
      .select("question_id", { count: "exact", head: true })
      .eq("user_id", userId),
  ]);

  const mockSessions = (sessionsResult.data ?? []).map((s) => ({
    id: s.id as string,
    score: s.score as number,
    total: s.total as number,
    pct: Math.round(((s.score as number) / (s.total as number)) * 100),
    topics: s.topics as Topic[],
    createdAt: s.created_at as string,
  }));

  // Aggregate progress by topic
  const topicMap = new Map<Topic, { seen: number; correct: number }>();
  for (const row of progressResult.data ?? []) {
    const topic = (row.questions as { topic: Topic } | null)?.topic;
    if (!topic) continue;
    const entry = topicMap.get(topic) ?? { seen: 0, correct: 0 };
    entry.seen += 1;
    if (row.correct === true) entry.correct += 1;
    topicMap.set(topic, entry);
  }

  const topicProgress = Array.from(topicMap.entries()).map(
    ([topic, stats]) => ({ topic, ...stats }),
  );

  return {
    mockSessions,
    topicProgress,
    bookmarkCount: bookmarkResult.count ?? 0,
  };
}
