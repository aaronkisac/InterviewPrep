"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { setLang } from "@/lib/actions/lang";
import type { Language } from "@/lib/supabase/types";

export function LangToggle({ current }: { current: Language }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next: Language = current === "en" ? "tr" : "en";
    startTransition(async () => {
      await setLang(next);
      router.refresh();
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
      {current === "en" ? "EN" : "TR"}
    </button>
  );
}
