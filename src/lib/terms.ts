import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { TermRow, Topic } from "@/lib/supabase/types";

export type TermListItem = Pick<
  TermRow,
  "id" | "slug" | "label" | "topic" | "tooltip"
>;

export async function listTerms(): Promise<TermListItem[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("terms")
    .select("id, slug, label, topic, tooltip")
    .order("label", { ascending: true });

  if (error) throw new Error(`Failed to load terms: ${error.message}`);
  return data ?? [];
}

export async function getTermBySlug(slug: string): Promise<TermRow | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("terms")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`Failed to load term: ${error.message}`);
  return data;
}

export async function getRelatedTerms(slugs: string[]): Promise<TermListItem[]> {
  if (slugs.length === 0) return [];
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("terms")
    .select("id, slug, label, topic, tooltip")
    .in("slug", slugs);

  if (error) throw new Error(`Failed to load related terms: ${error.message}`);
  return data ?? [];
}

export function groupByTopic(
  terms: TermListItem[],
): Record<Topic | "general", TermListItem[]> {
  const groups: Record<string, TermListItem[]> = {
    react: [],
    typescript: [],
    nextjs: [],
    general: [],
  };
  for (const term of terms) {
    const key = term.topic ?? "general";
    groups[key]!.push(term);
  }
  return groups as Record<Topic | "general", TermListItem[]>;
}
