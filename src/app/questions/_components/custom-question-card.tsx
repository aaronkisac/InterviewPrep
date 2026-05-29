"use client";

import { useState, useTransition } from "react";
import { Lock, Bookmark } from "lucide-react";
import { Tooltip } from "radix-ui";

import type { CustomQuestion } from "@/lib/actions/custom-topics";
import { toggleCustomBookmark } from "@/lib/actions/custom-topics";
import { LevelDots } from "@/components/level-dots";
import { cn } from "@/lib/utils";

export function CustomQuestionCard({
  question,
  index,
  initialBookmarked = false,
}: {
  question: CustomQuestion;
  index: number;
  initialBookmarked?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isPending, startTransition] = useTransition();

  function handleBookmark(e: React.MouseEvent) {
    e.stopPropagation();
    startTransition(async () => {
      const result = await toggleCustomBookmark(question.id);
      if (result !== null) setBookmarked(result.bookmarked);
    });
  }

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

        <LevelDots level={question.level ?? 1} />

        <Tooltip.Provider delayDuration={300}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                type="button"
                onClick={handleBookmark}
                disabled={isPending}
                aria-label={bookmarked ? "Remove bookmark" : "Bookmark question"}
                className={cn(
                  "rounded p-1 transition hover:bg-accent disabled:opacity-50",
                  bookmarked ? "text-amber-500" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Bookmark className="size-4" fill={bookmarked ? "currentColor" : "none"} />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="top"
                className="z-50 rounded-md bg-foreground px-2.5 py-1.5 text-xs text-background shadow-md animate-in fade-in-0 zoom-in-95"
                sideOffset={5}
              >
                {bookmarked ? "Remove bookmark" : "Save to bookmarks"}
                <Tooltip.Arrow className="fill-foreground" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>

          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <span className="flex items-center">
                <Lock className="size-3 flex-shrink-0 text-muted-foreground/40" />
              </span>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="top"
                className="z-50 rounded-md bg-foreground px-2.5 py-1.5 text-xs text-background shadow-md animate-in fade-in-0 zoom-in-95"
                sideOffset={5}
              >
                Private — only visible to you
                <Tooltip.Arrow className="fill-foreground" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
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
