import { unstable_cache } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { TermRow, Topic } from "@/lib/supabase/types";

export type TermListItem = Pick<
  TermRow,
  "id" | "slug" | "label" | "topic" | "tooltip" | "tooltip_tr"
>;

/**
 * Cached for 5 minutes — glossary terms change only when an admin seeds new
 * content, so frequent re-fetching is wasteful.
 */
export const listTerms = unstable_cache(
  async (): Promise<TermListItem[]> => {
    // Use admin client (no cookies) — terms are public data and unstable_cache
    // does not allow cookies() inside its scope.
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("terms")
      .select("id, slug, label, topic, tooltip, tooltip_tr")
      .order("label", { ascending: true });

    if (error) throw new Error(`Failed to load terms: ${error.message}`);
    return data ?? [];
  },
  ["glossary-terms"],
  { revalidate: 300 },
);

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
    .select("id, slug, label, topic, tooltip, tooltip_tr")
    .in("slug", slugs);

  // Degrade gracefully — this only powers the decorative tooltip prefetch.
  // A failure here must not take down the whole /glossary page (the term list
  // itself comes from listTerms via the admin client).
  if (error) {
    console.error("[getRelatedTerms]", error.message);
    return [];
  }
  return data ?? [];
}

export function groupByTopic(
  terms: TermListItem[],
): Record<Topic | "general", TermListItem[]> {
  const groups: Record<string, TermListItem[]> = {};
  for (const term of terms) {
    const key = term.topic ?? "general";
    if (!groups[key]) groups[key] = [];
    groups[key]!.push(term);
  }
  return groups as Record<Topic | "general", TermListItem[]>;
}
