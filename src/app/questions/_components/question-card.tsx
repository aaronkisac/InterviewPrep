"use client";

import Link from "next/link";
import { useState } from "react";

import { GlossaryText } from "@/components/glossary-text";
import { BookmarkButton } from "@/app/questions/_components/bookmark-button";
import type { GlossaryTerm } from "@/lib/glossary-match";
import type { Language } from "@/lib/supabase/types";
import { TOPIC_LABELS, TR_FALLBACK } from "@/lib/topics";
import type { QuestionListItem } from "@/lib/questions";
import { cn } from "@/lib/utils";

function pickAnswer(
  question: QuestionListItem,
  lang: Language,
): { general: string; personal: string | null; isFallback: boolean } {
  if (lang === "tr") {
    return {
      general: question.answer_general_tr || TR_FALLBACK,
      personal: question.answer_personal_tr,
      isFallback: !question.answer_general_tr,
    };
  }
  return {
    general: question.answer_general || "No answer yet.",
    personal: question.answer_personal,
    isFallback: !question.answer_general,
  };
}

// 5 dots, colour based on level
function LevelDots({ level }: { level: number }) {
  const colours: Record<number, string> = {
    1: "bg-emerald-500",
    2: "bg-emerald-500",
    3: "bg-yellow-400",
    4: "bg-orange-400",
    5: "bg-red-500",
  };
  const active = colours[level] ?? "bg-emerald-500";

  return (
    <div className="hidden sm:flex items-center gap-[3px] flex-shrink-0">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "inline-block h-[5px] w-[5px] rounded-full",
            i < level ? active : "bg-border",
          )}
        />
      ))}
    </div>
  );
}

export function QuestionCard({
  question,
  index,
  lang,
  terms,
  isBookmarked = false,
  showTopic = false,
}: {
  question: QuestionListItem;
  index: number;
  lang: Language;
  terms: GlossaryTerm[];
  isBookmarked?: boolean;
  showTopic?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [personalOpen, setPersonalOpen] = useState(false);
  const { general, personal, isFallback } = pickAnswer(question, lang);

  return (
    <li className="rounded-lg border border-border bg-background transition hover:border-foreground/30">
      {/* ── Collapsed row ── */}
      <div className="flex w-full items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4">
        {/* sequential number */}
        <span className="hidden sm:inline w-7 flex-shrink-0 font-mono text-[10px] font-bold text-muted-foreground/40 select-none">
          #{index}
        </span>

        {/* expand button — takes up most of the row */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={`answer-${question.id}`}
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

        {/* topic badge — only in Bookmarked tab */}
        {showTopic && (
          <span className="hidden md:inline flex-shrink-0 rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
            {TOPIC_LABELS[question.topic]}
          </span>
        )}

        {/* level dots */}
        <LevelDots level={question.level} />

        {/* bookmark */}
        <BookmarkButton
          questionId={question.id}
          initialBookmarked={isBookmarked}
        />
      </div>

      {/* ── Expanded body ── */}
      {open && (
        <div
          id={`answer-${question.id}`}
          className="border-t border-border px-4 py-4"
        >
          <div
            className={cn(
              "whitespace-pre-wrap text-sm leading-relaxed",
              isFallback
                ? "italic text-muted-foreground"
                : "text-foreground/90",
            )}
          >
            {isFallback ? (
              general
            ) : (
              <GlossaryText text={general} terms={terms} />
            )}
          </div>

          {personal && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setPersonalOpen((v) => !v)}
                aria-expanded={personalOpen}
                className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <span
                  className={cn(
                    "inline-block transition-transform",
                    personalOpen && "rotate-90",
                  )}
                  aria-hidden="true"
                >
                  ▸
                </span>
                {lang === "tr" ? "Kişisel örnek" : "Personal example"}
              </button>
              {personalOpen && (
                <p className="mt-2 rounded border border-dashed border-border bg-background p-3 text-sm leading-relaxed text-foreground/85">
                  <GlossaryText text={personal} terms={terms} />
                </p>
              )}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            {/* show topic in expanded footer if hidden above (mobile) */}
            {showTopic && (
              <span className="md:hidden rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                {TOPIC_LABELS[question.topic]}
              </span>
            )}
            <div className="ml-auto">
              <Link
                href={`/questions/${question.id}?lang=${lang}`}
                className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
              >
                {lang === "tr" ? "Detaylı sayfa →" : "Detail page →"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
