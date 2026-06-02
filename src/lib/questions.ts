import { unstable_cache } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import type { QuestionRow, Topic } from "@/lib/supabase/types";

// Re-export for convenience — Server Components can import everything from
// "@/lib/questions". Client Components MUST import from "@/lib/topics" instead
// to avoid pulling next/headers into the client bundle.
export { LEVELS } from "@/lib/topics";

export type QuestionListItem = Pick<
  QuestionRow,
  | "id"
  | "topic"
  | "level"
  | "level_label"
  | "question"
  | "question_tr"
  | "answer_general"
  | "answer_personal"
  | "answer_general_tr"
  | "answer_personal_tr"
>;

export type QuestionFilters = {
  topic?: Topic;
  levels?: (1 | 2 | 3 | 4 | 5)[];
  q?: string;
};

// Topic is now dynamic — any non-empty slug is valid
export function parseTopic(value: string | undefined): Topic | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

export function parseLevel(
  value: string | undefined,
): 1 | 2 | 3 | 4 | 5 | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return n >= 1 && n <= 5 ? (n as 1 | 2 | 3 | 4 | 5) : undefined;
}

export function parseLevels(
  value: string | undefined,
): (1 | 2 | 3 | 4 | 5)[] | undefined {
  if (!value) return undefined;
  const parsed = value
    .split(",")
    .map(Number)
    .filter((n) => n >= 1 && n <= 5) as (1 | 2 | 3 | 4 | 5)[];
  return parsed.length > 0 ? parsed : undefined;
}

export function parseQuery(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Cached for 1 hour — question list is public and rarely changes.
 * Uses admin client; unstable_cache cannot access cookies/session.
 * Each unique filter combination gets its own cache entry.
 */
const _listQuestionsCached = unstable_cache(
  async (filters: QuestionFilters): Promise<QuestionListItem[]> => {
    const supabase = createAdminClient();

    let query = supabase
      .from("questions")
      .select(
        "id, topic, level, level_label, question, question_tr, answer_general, answer_personal, answer_general_tr, answer_personal_tr",
      )
      .eq("status", "active")
      .eq("is_shared", true)
      .order("topic", { ascending: true })
      .order("level", { ascending: true });

    if (filters.topic) query = query.eq("topic", filters.topic);
    if (filters.levels && filters.levels.length > 0)
      query = query.in("level", filters.levels);
    if (filters.q) query = query.ilike("question", `%${filters.q}%`);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to load questions: ${error.message}`);

    return (data ?? []) as QuestionListItem[];
  },
  ["questions-list"],
  { revalidate: 3600 },
);

export async function listQuestions(
  filters: QuestionFilters,
): Promise<QuestionListItem[]> {
  return _listQuestionsCached(filters);
}

/**
 * Cached for 5 minutes — topic counts only change when new questions are seeded.
 * Supabase JS client doesn't support GROUP BY natively, so we fetch topic
 * column only (minimal payload) and aggregate in JS, but avoid hitting the DB
 * on every homepage render.
 */
export const getTopicStats = unstable_cache(
  async (): Promise<Record<string, number>> => {
    // Use admin client (no cookies) — topic stats are public and unstable_cache
    // does not allow cookies() inside its scope.
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("questions")
      .select("topic")
      .eq("status", "active")
      .eq("is_shared", true);

    if (error) return {};

    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
      counts[row.topic as string] = (counts[row.topic as string] ?? 0) + 1;
    }
    return counts;
  },
  ["topic-stats"],
  { revalidate: 300 },
);

/**
 * Cached for 1 hour — question detail is public and rarely changes.
 */
export const getQuestionById = unstable_cache(
  async (id: string): Promise<QuestionRow | null> => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("id", id)
      .eq("status", "active")
      .maybeSingle();

    if (error) throw new Error(`Failed to load question: ${error.message}`);
    return data;
  },
  ["question-by-id"],
  { revalidate: 3600 },
);
