"use client";

import { useState } from "react";
import { Lock } from "lucide-react";

import type { CustomQuestion } from "@/lib/actions/custom-topics";
import { cn } from "@/lib/utils";

export function CustomQuestionCard({
  question,
  index,
}: {
  question: CustomQuestion;
  index: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <li className="rounded-lg border border-border bg-background transition hover:border-foreground/30">
      {/* Collapsed row */}
      <div className="flex w-full items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4">
        <span className="hidden sm:inline w-10 flex-shrink-0 font-mono text-base font-bold text-muted-foreground/70 select-none">
          #{index}
        </span>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span
            className={cn(
              "inline-block flex-shrink-0 text-[8px] text-muted-foreground/50 transition-transform",
              open && "rotate-90",
            )}
            aria-hidden="true"
          >
            ▶
          </span>
          <span className="truncate text-sm font-medium leading-snug">
            {question.question}
          </span>
        </button>

        <Lock className="size-3 flex-shrink-0 text-muted-foreground/40" />
      </div>

      {/* Expanded body */}
      {open && (
        <div className="border-t border-border px-4 py-4">
          {question.answer ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {question.answer}
            </p>
          ) : (
            <p className="text-sm italic text-muted-foreground">
              No answer added yet. Edit this question from your{" "}
              <a href="/dashboard" className="underline hover:text-foreground">
                dashboard
              </a>
              .
            </p>
          )}
        </div>
      )}
    </li>
  );
}
