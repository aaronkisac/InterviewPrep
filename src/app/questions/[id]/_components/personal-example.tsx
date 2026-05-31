"use client";

import { useState } from "react";

import { i18nQuestionDetail } from "@/lib/i18n";
import type { Language } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

export function PersonalExample({
  text,
  lang = "en",
}: {
  text: string;
  lang?: Language;
}) {
  const i18n = i18nQuestionDetail[lang];
  const [open, setOpen] = useState(false);

  return (
    <section className="mt-8">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="personal-example-content"
        className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-left text-sm font-medium transition hover:bg-accent/50"
      >
        <span>{i18n.personalExample}</span>
        <span
          className={cn(
            "text-xs text-muted-foreground transition-transform",
            open && "rotate-90",
          )}
          aria-hidden="true"
        >
          ▸
        </span>
      </button>
      {open && (
        <div
          id="personal-example-content"
          className="mt-2 rounded-lg border border-border bg-card p-4 text-sm leading-relaxed text-foreground/90"
        >
          {text}
        </div>
      )}
    </section>
  );
}