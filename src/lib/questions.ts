import { createServerSupabaseClient } from "@/lib/supabase/server";
import { TOPICS } from "@/lib/topics";
import type { QuestionRow, Topic } from "@/lib/supabase/types";

// Re-export for convenience — Server Components can import everything from
// "@/lib/questions". Client Components MUST import from "@/lib/topics" instead
// to avoid pulling next/headers into the client bundle.
export { TOPICS, TOPIC_LABELS, LEVELS } from "@/lib/topics";

export type QuestionListItem = Pick<
  QuestionRow,
  | "id"
  | "topic"
  | "level"
  | "level_label"
  | "question"
  | "answer_general"
  | "answer_personal"
  | "answer_general_tr"
  | "answer_personal_tr"
> & {
  has_detail: boolean;
  has_detail_tr: boolean;
};

export type QuestionFilters = {
  topic?: Topic;
  level?: 1 | 2 | 3 | 4 | 5;
  q?: string;
};

export function parseTopic(value: string | undefined): Topic | undefined {
  return value && (TOPICS as readonly string[]).includes(value)
    ? (value as Topic)
    : undefined;
}

export function parseLevel(
  value: string | undefined,
): 1 | 2 | 3 | 4 | 5 | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return n >= 1 && n <= 5 ? (n as 1 | 2 | 3 | 4 | 5) : undefined;
}

export function parseQuery(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

export async function listQuestions(
  filters: QuestionFilters,
): Promise<QuestionListItem[]> {
  const supabase = await createServerSupabaseClient();

  // Pulls detail_md / detail_md_tr so the card can flag "deep-dive available",
  // but we drop them from the public shape — only render on the detail page.
  let query = supabase
    .from("questions")
    .select(
      "id, topic, level, level_label, question, answer_general, answer_personal, answer_general_tr, answer_personal_tr, detail_md, detail_md_tr",
    )
    .eq("status", "active")
    .eq("is_shared", true)
    .order("topic", { ascending: true })
    .order("level", { ascending: true });

  if (filters.topic) query = query.eq("topic", filters.topic);
  if (filters.level) query = query.eq("level", filters.level);
  if (filters.q) query = query.ilike("question", `%${filters.q}%`);

  const { data, error } = await query;
  if (error) throw new Error(`Failed to load questions: ${error.message}`);

  return (data ?? []).map((row) => {
    const { detail_md, detail_md_tr, ...rest } = row as QuestionRow & {
      detail_md: string | null;
      detail_md_tr: string | null;
    };
    return {
      ...rest,
      has_detail: Boolean(detail_md && detail_md.trim().length > 0),
      has_detail_tr: Boolean(detail_md_tr && detail_md_tr.trim().length > 0),
    };
  });
}

export async function getQuestionById(
  id: string,
): Promise<QuestionRow | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("id", id)
    .eq("status", "active")
    .maybeSingle();

  if (error) throw new Error(`Failed to load question: ${error.message}`);
  return data;
}
