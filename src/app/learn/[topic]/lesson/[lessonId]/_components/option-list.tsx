"use client";

// Shared option grid for mcq / output_predict / true_false / challenge steps.
// Motion: shake on the wrongly picked option, pulse + ring on the correct one.
// A11y: state is communicated via icon + sr-only text, never color alone.

import { motion } from "motion/react";

import {
  PULSE_KEYFRAMES,
  PULSE_TRANSITION,
  SHAKE_KEYFRAMES,
  SHAKE_TRANSITION,
} from "@/lib/course/motion";
import type { Language } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

const OPTION_LABELS = ["1", "2", "3", "4", "5"] as const;

export type PlayerOption = {
  text: string;
  textTr: string;
  correct: boolean;
  /** Per-option explanation (challenge steps); falls back to step explanation. */
  explanation?: string;
  explanationTr?: string;
};

export function OptionList({
  options,
  selected,
  answered,
  reduced,
  lang,
  i18n,
  onSelect,
}: {
  options: PlayerOption[];
  selected: number | null;
  answered: boolean;
  reduced: boolean;
  lang: Language;
  i18n: { correct: string; notQuite: string };
  onSelect: (index: number) => void;
}) {
  return (
    <ul className="space-y-2" role="listbox" aria-label="Options">
      {options.map((option, i) => {
        const isPicked = i === selected;
        const showCorrect = answered && option.correct;
        const showWrong = answered && isPicked && !option.correct;

        return (
          <li key={i}>
            <motion.button
              type="button"
              onClick={() => {
                if (!answered) onSelect(i);
              }}
              animate={
                reduced
                  ? undefined
                  : showWrong
                    ? SHAKE_KEYFRAMES
                    : showCorrect && isPicked
                      ? PULSE_KEYFRAMES
                      : undefined
              }
              transition={
                reduced
                  ? undefined
                  : showWrong
                    ? SHAKE_TRANSITION
                    : PULSE_TRANSITION
              }
              aria-disabled={answered}
              aria-pressed={isPicked}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left text-sm transition",
                !answered &&
                  !isPicked &&
                  "border-input hover:border-foreground/40 hover:bg-accent",
                !answered && isPicked && "border-primary bg-primary/5",
                answered && "cursor-default",
                showCorrect &&
                  "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/30 dark:bg-emerald-950/40",
                showWrong && "border-rose-500 bg-rose-50 dark:bg-rose-950/40",
                answered && !showCorrect && !showWrong && "border-border opacity-60",
              )}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold",
                  showCorrect
                    ? "bg-emerald-600 text-white"
                    : showWrong
                      ? "bg-rose-600 text-white"
                      : isPicked
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground",
                )}
                aria-hidden="true"
              >
                {showCorrect ? "✓" : showWrong ? "✗" : OPTION_LABELS[i]}
              </span>
              <span className="flex-1 pt-0.5 leading-snug">
                {lang === "tr" && option.textTr ? option.textTr : option.text}
                {showCorrect && <span className="sr-only"> — {i18n.correct}</span>}
                {showWrong && <span className="sr-only"> — {i18n.notQuite}</span>}
              </span>
            </motion.button>
          </li>
        );
      })}
    </ul>
  );
}
