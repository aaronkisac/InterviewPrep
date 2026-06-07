"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { setLang } from "@/lib/actions/lang";
import { LANG_COOKIE } from "@/lib/lang-constants";
import { useLang } from "@/contexts/lang-context";

export function LangToggle() {
  const { lang, setLang: setLangCtx } = useLang();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function toggle() {
    if (isPending) return;
    const next = lang === "en" ? "tr" : "en";
    setIsPending(true);
    setLangCtx(next);
    document.cookie = `${LANG_COOKIE}=${next};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    await setLang(next);
    // router.refresh() re-renders server components with the updated cookie
    // without a full page reload — browser state and scroll position are preserved.
    router.refresh();
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
