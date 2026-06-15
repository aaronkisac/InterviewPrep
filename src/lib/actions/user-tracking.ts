"use server";

import { auth } from "@/lib/auth";
import { nextBox, nextDueAt } from "@/lib/leitner";
import { createServerSupabaseClient } from "@/lib/supabase/server";
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
  const sb = await createServerSupabaseClient();

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
  const sb = await createServerSupabaseClient();

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

export async function getBookmarkedIds(overrideUserId?: string): Promise<string[]> {
  const userId = overrideUserId ?? (await auth())?.user?.id;
  if (!userId) return [];

  const sb = await createServerSupabaseClient();
  const { data } = await sb
    .from("bookmarks")
    .select("question_id")
    .eq("user_id", userId);

  return (data ?? []).map((r) => r.question_id as string);
}

// ============================================================================
// Adaptive learning: user_topic_mastery
// ============================================================================

export type MasteryRow = {
  questionId: string;
  topic: string;
  mastered: boolean;
};

/**
 * Upsert mastery rows after a session finishes, with Leitner scheduling:
 * correct answer promotes the question one box (max 5, longer interval),
 * wrong answer demotes it to box 1 (due immediately).
 * mode: 'mock' | 'flashcard'
 * rows: one entry per question answered
 */
export async function saveTopicMastery(
  mode: "mock" | "flashcard",
  rows: MasteryRow[],
): Promise<void> {
  if (rows.length === 0) return;
  const session = await auth();
  if (!session?.user?.id) return;

  const userId = session.user.id;
  const sb = await createServerSupabaseClient();
  const nowDate = new Date();
  const now = nowDate.toISOString();

  // Current boxes for the answered questions (missing row = new = box 0)
  const { data: existing } = await sb
    .from("user_topic_mastery")
    .select("question_id, box")
    .eq("user_id", userId)
    .eq("mode", mode)
    .in("question_id", rows.map((r) => r.questionId));

  const currentBox = new Map<string, number>(
    (existing ?? []).map((r) => [r.question_id as string, (r.box as number) ?? 1]),
  );

  const upsertRows = rows.map((r) => {
    const box = nextBox(currentBox.get(r.questionId), r.mastered);
    return {
      user_id: userId,
      question_id: r.questionId,
      topic: r.topic,
      mode,
      mastered: r.mastered,
      box,
      due_at: nextDueAt(box, nowDate),
      updated_at: now,
    };
  });

  // Only upgrade mastered: true → keep existing true if already set.
  // We use a raw upsert; "mastered" is set to the new value so a correct
  // answer after a wrong one properly marks it mastered.
  await sb
    .from("user_topic_mastery")
    .upsert(upsertRows, { onConflict: "user_id,question_id,mode" })
    .then(({ error }) => {
      if (error) console.error("[saveTopicMastery]", error.message);
    });
}

/**
 * Return mastered question IDs for a user across given topics + mode.
 * Used by session builders to apply 80/20 split.
 */
export async function getMasteredIds(
  userId: string,
  topics: string[],
  mode: "mock" | "flashcard",
): Promise<Set<string>> {
  if (topics.length === 0) return new Set();
  const sb = await createServerSupabaseClient();

  const { data, error } = await sb
    .from("user_topic_mastery")
    .select("question_id")
    .eq("user_id", userId)
    .eq("mode", mode)
    .eq("mastered", true)
    .in("topic", topics);

  if (error) {
    console.error("[getMasteredIds]", error.message);
    return new Set();
  }

  return new Set((data ?? []).map((r) => r.question_id as string));
}

/**
 * Return mastered count per topic for the given mode.
 * Used by mock/page to show "CSS 12/22" on topic chips.
 */
export async function getTopicMasteryStats(
  userId: string,
  topics: string[],
  mode: "mock" | "flashcard",
): Promise<Record<string, number>> {
  if (topics.length === 0) return {};
  const sb = await createServerSupabaseClient();

  const { data, error } = await sb
    .from("user_topic_mastery")
    .select("topic")
    .eq("user_id", userId)
    .eq("mode", mode)
    .eq("mastered", true)
    .in("topic", topics);

  if (error) {
    console.error("[getTopicMasteryStats]", error.message);
    return {};
  }

  const result: Record<string, number> = {};
  for (const row of data ?? []) {
    const t = row.topic as string;
    result[t] = (result[t] ?? 0) + 1;
  }
  return result;
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
  const sb = await createServerSupabaseClient();

  const [sessionsResult, progressResult, bookmarkResult] = await Promise.all([
    sb
      .from("mock_sessions")
      .select("id, score, total, topics, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10),
    // RPC does GROUP BY in SQL — avoids fetching every individual progress row
    // and joining questions one-by-one in JS.
    sb.rpc("get_user_topic_progress", { p_user_id: userId }),
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

  const topicProgress = (
    (progressResult.data ?? []) as Array<{ topic: string; seen: number; correct: number }>
  ).map(({ topic, seen, correct }) => ({
    topic: topic as Topic,
    seen: Number(seen),
    correct: Number(correct),
  }));

  return {
    mockSessions,
    topicProgress,
    bookmarkCount: bookmarkResult.count ?? 0,
  };
}

// ============================================================================
// Spaced repetition: review queue
// ============================================================================

export type DueReview = {
  questionId: string;
  topic: string;
  box: number;
  dueAt: string;
};

/**
 * Questions due for review (due_at <= now), earliest first.
 * Custom-topic questions are excluded for now — the review session renders
 * system question content only. Rows existing in both modes are deduped to
 * the earliest due date.
 */
export async function getDueReviews(
  userId: string,
  limit = 200,
): Promise<DueReview[]> {
  const sb = await createServerSupabaseClient();
  const { data, error } = await sb
    .from("user_topic_mastery")
    .select("question_id, topic, box, due_at")
    .eq("user_id", userId)
    .lte("due_at", new Date().toISOString())
    .not("topic", "like", "custom:%")
    .order("due_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("[getDueReviews]", error.message);
    return [];
  }

  const byQuestion = new Map<string, DueReview>();
  for (const row of data ?? []) {
    const id = row.question_id as string;
    if (!byQuestion.has(id)) {
      byQuestion.set(id, {
        questionId: id,
        topic: row.topic as string,
        box: (row.box as number) ?? 1,
        dueAt: row.due_at as string,
      });
    }
  }
  return [...byQuestion.values()];
}

// ============================================================================
// Dashboard: score trend
// ============================================================================

export type SessionTrendPoint = {
  pct: number;
  score: number;
  total: number;
  createdAt: string;
};

/** Last `limit` mock sessions as chart points, oldest first. */
export async function getSessionTrend(
  userId: string,
  limit = 30,
): Promise<SessionTrendPoint[]> {
  const sb = await createServerSupabaseClient();
  const { data, error } = await sb
    .from("mock_sessions")
    .select("score, total, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getSessionTrend]", error.message);
    return [];
  }

  return (data ?? [])
    .reverse()
    .map((s) => ({
      score: s.score as number,
      total: s.total as number,
      pct: Math.round(((s.score as number) / Math.max(s.total as number, 1)) * 100),
      createdAt: s.created_at as string,
    }));
}
