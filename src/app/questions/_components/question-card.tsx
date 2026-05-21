"use client";

import Link from "next/link";
import { useState } from "react";

import { GlossaryText } from "@/components/glossary-text";
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

export function QuestionCard({
  question,
  lang,
  terms,
}: {
  question: QuestionListItem;
  lang: Language;
  terms: GlossaryTerm[];
}) {
  const [open, setOpen] = useState(false);
  const [personalOpen, setPersonalOpen] = useState(false);
  const { general, personal, isFallback } = pickAnswer(question, lang);

  return (
    <li className="rounded-lg border border-border bg-card transition hover:border-foreground/30">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`answer-${question.id}`}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <span
          className={cn(
            "mt-1 inline-block text-xs text-muted-foreground transition-transform",
            open && "rotate-90",
          )}
          aria-hidden="true"
        >
          ▸
        </span>
        <span className="flex-1">
          <span className="flex items-center gap-2 text-xs">
            <span className="rounded bg-secondary px-1.5 py-0.5 font-medium text-secondary-foreground">
              {TOPIC_LABELS[question.topic]}
            </span>
            <span className="text-muted-foreground">{question.level_label}</span>
          </span>
          <span className="mt-2 block text-sm font-medium leading-snug">
            {question.question}
          </span>
        </span>
      </button>

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

          <div className="mt-4 flex justify-end">
            <Link
              href={`/questions/${question.id}?lang=${lang}`}
              className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
            >
              {lang === "tr" ? "Detaylı sayfa →" : "Detail page →"}
            </Link>
          </div>
        </div>
      )}
    </li>
  );
}
