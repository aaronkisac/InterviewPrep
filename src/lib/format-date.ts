import type { Language } from "@/lib/supabase/types";

export function formatDate(iso: string, lang: Language): string {
  return new Date(iso).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
