"use server";

import { cookies } from "next/headers";
import type { Language } from "@/lib/supabase/types";
import { LANG_COOKIE } from "@/lib/lang";

export async function setLang(lang: Language): Promise<void> {
  const store = await cookies();
  store.set(LANG_COOKIE, lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    httpOnly: false,              // readable client-side too
    sameSite: "lax",
  });
}
