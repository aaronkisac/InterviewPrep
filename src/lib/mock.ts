import { unstable_cache } from "next/cache";

import type {
  Level,
  MockQuestion,
  MockReadyMeta,
  MockSessionConfig,
} from "@/lib/mock-shared";
import { createAdminClient } from "@/lib/supabase/admin";
import type { LevelLabel, Topic } from "@/lib/supabase/types";

// Server Components can import everything mock-related from "@/lib/mock".
// Client Components MUST import from "@/lib/mock-shared" instead, to keep
// next/headers out of the client bundle.
export * from "@/lib/mock-shared";

type QuestionWithOptionsRow = {
  id: string;
  topic: Topic;
  level: Level;
  level_label: LevelLabel;
  question: string;
  question_tr: string;
  mock_options: {
    id: string;
    option_text: string;
    option_text_tr: string;
    is_correct: boolean;
    explanation: string;
    explanation_tr: string;
  }[];
};

/** Fisher–Yates shuffle — returns a new array, leaves the input untouched. */
function shuffle<T>(input: readonly T[]): T[] {
  const out = [...input];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = out[i];
    const b = out[j];
    if (a !== undefined && b !== undefined) {
      out[i] = b;
      out[j] = a;
    }
  }
  return out;
}

/**
 * Loads every question that is ready for a mock session. A question only
 * qualifies when it has exactly four options with exactly one correct — the
 * V1 constraint from the spec.
 *
 * Cached for 60 seconds — mock question data changes only when an admin
 * seeds new content, so a short TTL is safe and avoids hammering Supabase
 * on every config/session page load.
 */
const loadMockReady = unstable_cache(
  async (): Promise<MockQuestion[]> => {
    // Use admin client (no cookies) — mock questions are public data and
    // unstable_cache does not allow cookies() inside its scope.
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("questions")
      .select(
        "id, topic, level, level_label, question, question_tr, mock_options(id, option_text, option_text_tr, is_correct, explanation, explanation_tr)",
      )
      .eq("status", "active")
      .eq("is_shared", true);

    if (error) {
      throw new Error(`Failed to load mock questions: ${error.message}`);
    }

    const rows = (data ?? []) as unknown as QuestionWithOptionsRow[];
    const ready: MockQuestion[] = [];

    for (const row of rows) {
      const opts = row.mock_options ?? [];
      const correctCount = opts.filter((o) => o.is_correct).length;
      if (opts.length !== 4 || correctCount !== 1) continue;

      ready.push({
        id: row.id,
        topic: row.topic,
        level: row.level,
        levelLabel: row.level_label,
        question: row.question,
        questionTr: row.question_tr,
        options: opts.map((o) => ({
          id: o.id,
          text: o.option_text,
          textTr: o.option_text_tr,
          isCorrect: o.is_correct,
          explanation: o.explanation,
          explanationTr: o.explanation_tr,
        })),
      });
    }

    return ready;
  },
  ["mock-ready-questions"],
  { revalidate: 60 },
);

/** Topic + level of every mock-ready question — drives the config page. */
export async function getMockReadyMeta(): Promise<MockReadyMeta[]> {
  const ready = await loadMockReady();
  return ready.map((q) => ({ topic: q.topic, level: q.level }));
}

/**
 * Draws a random session: filters the mock-ready pool by the chosen topics
 * and difficulty range, shuffles, then trims to the requested length. Option
 * order is also shuffled so the correct answer isn't always in the same slot.
 */
export async function getMockSessionQuestions(
  config: MockSessionConfig,
): Promise<MockQuestion[]> {
  const ready = await loadMockReady();
  const pool = ready.filter(
    (q) =>
      config.topics.includes(q.topic) &&
      q.level >= config.minLevel &&
      q.level <= config.maxLevel,
  );

  const shuffled = shuffle(pool);
  const trimmed = config.length !== undefined ? shuffled.slice(0, config.length) : shuffled;
  return trimmed.map((q) => ({ ...q, options: shuffle(q.options) }));
}
