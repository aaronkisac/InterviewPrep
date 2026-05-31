"use client";

import Link from "next/link";
import { useState } from "react";

import { GlossaryText } from "@/components/glossary-text";
import { BookmarkButton } from "@/app/questions/_components/bookmark-button";
import { LevelDots } from "@/components/level-dots";
import type { GlossaryTerm } from "@/lib/glossary-match";
import type { Language } from "@/lib/supabase/types";
import { TR_FALLBACK } from "@/lib/topics";
import { i18nQuestionCard } from "@/lib/i18n";
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


export function QuestionCard({
  question,
  index,
  lang,
  terms,
  isBookmarked = false,
  showTopic = false,
  isLoggedIn = true,
  topicLabels = {},
}: {
  question: QuestionListItem;
  index: number;
  lang: Language;
  terms: GlossaryTerm[];
  isBookmarked?: boolean;
  showTopic?: boolean;
  isLoggedIn?: boolean;
  topicLabels?: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);
  const [personalOpen, setPersonalOpen] = useState(false);
  const { general, personal, isFallback } = pickAnswer(question, lang);
  const card = i18nQuestionCard[lang];

  return (
    <li className="rounded-lg border border-border bg-background transition hover:border-foreground/30">
      {/* ── Collapsed row ── */}
      <div className="flex w-full items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4">
        {/* sequential number */}
        <span className="hidden sm:inline w-10 flex-shrink-0 font-mono text-base font-bold text-muted-foreground/70 select-none">
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
            {topicLabels[question.topic] ?? question.topic}
          </span>
        )}

        {/* level dots */}
        <LevelDots level={question.level} />

        {/* bookmark — only for logged-in users */}
        {isLoggedIn && (
          <BookmarkButton
            questionId={question.id}
            initialBookmarked={isBookmarked}
          />
        )}
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
              <GlossaryText text={general} terms={terms} isLoggedIn={isLoggedIn} />
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
                {card.personalExample}
              </button>
              {personalOpen && (
                <p className="mt-2 rounded border border-dashed border-border bg-background p-3 text-sm leading-relaxed text-foreground/85">
                  <GlossaryText text={personal} terms={terms} isLoggedIn={isLoggedIn} />
                </p>
              )}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            {/* show topic in expanded footer if hidden above (mobile) */}
            {showTopic && (
              <span className="md:hidden rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                {topicLabels[question.topic] ?? question.topic}
              </span>
            )}
            <div className="ml-auto">
              <Link
                href={
                  isLoggedIn
                    ? `/questions/${question.id}`
                    : "/signin"
                }
                className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
              >
                {isLoggedIn
                  ? card.detailPage
                  : card.signInForDetails}
              </Link>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
