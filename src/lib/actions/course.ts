"use server";

import { auth } from "@/lib/auth";
import { saveTopicMastery } from "@/lib/actions/user-tracking";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateSteps, type ChallengeStep } from "@/lib/course/step-schema";

export type RecordLessonResultInput = {
  lessonId: string;
  /** First-attempt accuracy 0–100. */
  accuracyPct: number;
  /** First-attempt result per challenge question (UUIDs). */
  challenges: Array<{ questionId: string; correct: boolean }>;
};

/**
 * Persist a finished lesson (finish-to-pass model — reaching the end of the
 * queue IS completion). Updates lesson progress, per-question progress and
 * Leitner boxes for challenge steps so the existing /mock/review queue keeps
 * working over the question bank.
 */
export async function recordLessonResult(
  input: RecordLessonResultInput,
): Promise<{ ok: boolean }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };

  const userId = session.user.id;
  const sb = createAdminClient();
  const now = new Date().toISOString();
  const accuracy = Math.max(0, Math.min(100, Math.round(input.accuracyPct)));

  // Lesson + topic + steps (steps let us validate the submitted challenges
  // against the questions that actually belong to this lesson).
  const { data: lesson, error: lessonError } = await sb
    .from("lessons")
    .select("id, steps, units(topic_slug)")
    .eq("id", input.lessonId)
    .maybeSingle();

  if (lessonError || !lesson) {
    console.error("[recordLessonResult:lesson]", lessonError?.message);
    return { ok: false };
  }
  const topicSlug = (
    lesson.units as unknown as { topic_slug: string } | null
  )?.topic_slug;
  if (!topicSlug) return { ok: false };

  // Whitelist: only question IDs that are genuine challenge steps in THIS
  // lesson may write per-question progress / mastery. A tampered client could
  // otherwise POST arbitrary bank question UUIDs (or fabricated `correct`
  // flags) and pollute its own Leitner queue and topic mastery.
  const parsedSteps = validateSteps(lesson.steps);
  const allowedQuestionIds = new Set<string>(
    parsedSteps.ok
      ? parsedSteps.value
          .filter((s): s is ChallengeStep => s.type === "challenge")
          .map((s) => s.questionId)
          .filter((id): id is string => typeof id === "string")
      : [],
  );

  // Upsert progress: attempts +1, best_pct keeps the max, completed_at sticks
  const { data: existing } = await sb
    .from("user_lesson_progress")
    .select("best_pct, attempts, completed_at")
    .eq("user_id", userId)
    .eq("lesson_id", input.lessonId)
    .maybeSingle();

  const { error: upsertError } = await sb.from("user_lesson_progress").upsert(
    {
      user_id: userId,
      lesson_id: input.lessonId,
      best_pct: Math.max(accuracy, (existing?.best_pct as number | undefined) ?? 0),
      attempts: ((existing?.attempts as number | undefined) ?? 0) + 1,
      completed_at: (existing?.completed_at as string | null | undefined) ?? now,
      updated_at: now,
    },
    { onConflict: "user_id,lesson_id" },
  );

  if (upsertError) {
    console.error("[recordLessonResult:upsert]", upsertError.message);
    return { ok: false };
  }

  // Challenge steps feed the same tracking as mock sessions. Drop any entry
  // whose questionId is not an actual challenge in this lesson; dedupe so a
  // repeated UUID can't be counted twice.
  const seen = new Set<string>();
  const validChallenges = input.challenges.filter((c) => {
    if (!allowedQuestionIds.has(c.questionId) || seen.has(c.questionId)) {
      return false;
    }
    seen.add(c.questionId);
    return true;
  });

  if (validChallenges.length > 0) {
    const rows = validChallenges.map((c) => ({
      user_id: userId,
      question_id: c.questionId,
      correct: c.correct === true,
      answered_at: now,
    }));
    const { error: progressError } = await sb
      .from("user_question_progress")
      .upsert(rows, { onConflict: "user_id,question_id" });
    if (progressError) {
      console.error("[recordLessonResult:progress]", progressError.message);
    }

    await saveTopicMastery(
      "mock",
      validChallenges.map((c) => ({
        questionId: c.questionId,
        topic: topicSlug,
        mastered: c.correct === true,
      })),
    );
  }

  return { ok: true };
}

/**
 * Import a logged-out visitor's localStorage course progress into their
 * account on first sign-in. Existing accounts keep their own data — if any
 * lesson progress already exists, the guest entries are ignored (the client
 * still clears localStorage afterwards).
 */
export async function migrateGuestProgress(
  entries: RecordLessonResultInput[],
): Promise<{ imported: number }> {
  const session = await auth();
  if (!session?.user?.id || entries.length === 0) return { imported: 0 };

  const sb = createAdminClient();
  const { count } = await sb
    .from("user_lesson_progress")
    .select("lesson_id", { count: "exact", head: true })
    .eq("user_id", session.user.id);

  // Account already has progress → trust the server data, skip the import.
  if ((count ?? 0) > 0) return { imported: 0 };

  let imported = 0;
  for (const entry of entries) {
    const result = await recordLessonResult(entry);
    if (result.ok) imported += 1;
  }
  return { imported };
}
