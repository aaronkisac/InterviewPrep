import { cookies } from "next/headers";
import type { Language } from "@/lib/supabase/types";

export const LANG_COOKIE = "preferred_lang";

/**
 * Reads the user's preferred language from the cookie.
 * Server-only — imports next/headers.
 */
export async function getLang(urlOverride?: string): Promise<Language> {
  if (urlOverride === "tr" || urlOverride === "en") return urlOverride;
  const store = await cookies();
  const val = store.get(LANG_COOKIE)?.value;
  return val === "tr" ? "tr" : "en";
}
