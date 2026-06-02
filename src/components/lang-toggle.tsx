"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { setLang } from "@/lib/actions/lang";
import { LANG_COOKIE } from "@/lib/lang-constants";
import { useLang } from "@/contexts/lang-context";

export function LangToggle() {
  const { lang, setLang: setLangCtx } = useLang();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = lang === "en" ? "tr" : "en";
    // Update context immediately — zero-latency UI feedback
    setLangCtx(next);
    // Write cookie client-side so the refresh picks it up without waiting for the server action
    document.cookie = `${LANG_COOKIE}=${next};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    // Refresh server components in the background + sync server-side cookie
    startTransition(() => {
      router.refresh();
      void setLang(next);
    });
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
