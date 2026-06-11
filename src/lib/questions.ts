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
  /** UI language — picks which FTS vector / question column to search. */
  lang?: "en" | "tr";
};

/**
 * Hybrid search filter: ILIKE substring match on the question title
 * (catches partial words like "useEff") OR websearch full-text match on the
 * generated tsvector (catches terms buried in answers and deep-dives).
 * Returns a PostgREST `.or()` expression, or null for empty input.
 * Commas/parens are stripped — they are reserved in PostgREST or-syntax.
 */
export function buildSearchOrFilter(
  q: string,
  lang: "en" | "tr" | undefined,
): string | null {
  const safe = q.replace(/[,()]/g, " ").replace(/\s+/g, " ").trim();
  if (!safe) return null;
  const pattern = `%${safe}%`;
  if (lang === "tr") {
    return [
      `question_tr.ilike.${pattern}`,
      `question.ilike.${pattern}`,
      `search_vector_tr.wfts(simple).${safe}`,
      `search_vector.wfts(english).${safe}`,
    ].join(",");
  }
  return [
    `question.ilike.${pattern}`,
    `search_vector.wfts(english).${safe}`,
  ].join(",");
}

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

export function parsePage(value: string | undefined): number {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 ? n : 1;
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
    if (filters.q) {
      const orFilter = buildSearchOrFilter(filters.q, filters.lang);
      if (orFilter) query = query.or(orFilter);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to load questions: ${error.message}`);

    return (data ?? []) as QuestionListItem[];
  },
  ["questions-list"],
  { revalidate: 3600, tags: ["questions"] },
);

export async function listQuestions(
  filters: QuestionFilters,
): Promise<QuestionListItem[]> {
  return _listQuestionsCached(filters);
}

export const PAGE_SIZE = 50;

export type QuestionPage = { items: QuestionListItem[]; total: number };

/**
 * Paginated variant for the /questions browse view. Stable ordering
 * (topic → level → id) so range windows never overlap between pages.
 * Cached per unique (filters, page) combination; same tag as the full list.
 */
const _listQuestionsPageCached = unstable_cache(
  async (filters: QuestionFilters, page: number): Promise<QuestionPage> => {
    const supabase = createAdminClient();
    const from = (page - 1) * PAGE_SIZE;

    let query = supabase
      .from("questions")
      .select(
        "id, topic, level, level_label, question, question_tr, answer_general, answer_personal, answer_general_tr, answer_personal_tr",
        { count: "exact" },
      )
      .eq("status", "active")
      .eq("is_shared", true)
      .order("topic", { ascending: true })
      .order("level", { ascending: true })
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (filters.topic) query = query.eq("topic", filters.topic);
    if (filters.levels && filters.levels.length > 0)
      query = query.in("level", filters.levels);
    if (filters.q) {
      const orFilter = buildSearchOrFilter(filters.q, filters.lang);
      if (orFilter) query = query.or(orFilter);
    }

    const { data, count, error } = await query;
    // Supabase returns an error when the range starts past the last row —
    // treat it like an empty page instead of crashing the view.
    if (error) {
      if (from > 0) return { items: [], total: count ?? 0 };
      throw new Error(`Failed to load questions: ${error.message}`);
    }

    return { items: (data ?? []) as QuestionListItem[], total: count ?? 0 };
  },
  ["questions-page"],
  { revalidate: 3600, tags: ["questions"] },
);

export async function listQuestionsPage(
  filters: QuestionFilters,
  page: number,
): Promise<QuestionPage> {
  return _listQuestionsPageCached(filters, page);
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
  { revalidate: 300, tags: ["questions"] },
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
  { revalidate: 3600, tags: ["questions"] },
);
