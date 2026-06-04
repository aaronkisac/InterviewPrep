"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

import { setLang } from "@/lib/actions/lang";
import { LANG_COOKIE } from "@/lib/lang-constants";
import { useLang } from "@/contexts/lang-context";

export function LangToggle() {
  const { lang, setLang: setLangCtx } = useLang();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, setIsPending] = useState(false);

  async function toggle() {
    if (isPending) return;
    const next = lang === "en" ? "tr" : "en";
    setIsPending(true);
    // Update context immediately for instant client-side feedback
    setLangCtx(next);
    // Set cookie client-side
    document.cookie = `${LANG_COOKIE}=${next};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    // Await server action so cookie is set server-side
    await setLang(next);
    // Soft navigation to current path — forces server components to re-render
    // router.refresh() does not reliably re-render RSC in production
    router.push(pathname);
    setIsPending(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-label="Toggle language"
      className="flex items-center rounded-md px-2 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground transition hover:bg-accent/60 hover:text-foreground disabled:opacity-50"
    >
      {lang === "en" ? "EN" : "TR"}
    </button>
  );
}
