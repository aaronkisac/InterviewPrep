"use client";

// fill_blank step: code with ___ slots + a word bank.
// Tokens "fly" between bank and slots via motion layoutId (teleport when
// reduced motion). Fully keyboard operable — every token and slot is a button.

import { motion } from "motion/react";
import { useMemo } from "react";

import { SPRING } from "@/lib/course/motion";
import { seededShuffle } from "@/lib/course/shuffle";
import type { FillBlankStep } from "@/lib/course/step-schema";
import type { Language } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

export function StepFillBlank({
  step,
  stepKey,
  filled,
  answered,
  reduced,
  lang,
  i18n,
  onChange,
}: {
  step: FillBlankStep;
  /** Stable key for deterministic bank shuffle (lesson id + step index). */
  stepKey: string;
  /** One entry per blank: bank index or null. */
  filled: Array<number | null>;
  answered: boolean;
  reduced: boolean;
  lang: Language;
  i18n: { wordBank: string; blank: (n: number) => string };
  onChange: (next: Array<number | null>) => void;
}) {
  const bank = useMemo(
    () => seededShuffle([...step.answers, ...step.distractors], stepKey),
    [step, stepKey],
  );
  const segments = step.code.split("___");
  const usedBankIndexes = new Set(filled.filter((f): f is number => f !== null));

  const placeToken = (bankIndex: number) => {
    if (answered || usedBankIndexes.has(bankIndex)) return;
    const slot = filled.indexOf(null);
    if (slot === -1) return;
    const next = [...filled];
    next[slot] = bankIndex;
    onChange(next);
  };

  const clearSlot = (slotIndex: number) => {
    if (answered) return;
    const next = [...filled];
    next[slotIndex] = null;
    onChange(next);
  };

  return (
    <div className="space-y-5">
      <pre className="overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 text-sm leading-loose">
        <code className="font-mono">
          {segments.map((segment, i) => (
            <span key={i}>
              {segment}
              {i < segments.length - 1 && (
                <button
                  type="button"
                  onClick={() => clearSlot(i)}
                  aria-label={i18n.blank(i + 1)}
                  aria-disabled={answered}
                  className={cn(
                    "mx-0.5 inline-flex min-w-16 items-center justify-center rounded-md border-2 border-dashed px-2 py-0.5 align-middle font-mono text-sm transition",
                    filled[i] === null
                      ? "border-input bg-background text-muted-foreground"
                      : "border-primary/60 bg-primary/10 border-solid",
                  )}
                >
                  {filled[i] !== null ? (
                    <motion.span
                      layoutId={reduced ? undefined : `${stepKey}-token-${filled[i]}`}
                      transition={SPRING}
                    >
                      {bank[filled[i]!]}
                    </motion.span>
                  ) : (
                    <span aria-hidden="true">&nbsp;</span>
                  )}
                </button>
              )}
            </span>
          ))}
        </code>
      </pre>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {i18n.wordBank}
        </p>
        <div className="flex flex-wrap gap-2">
          {bank.map((token, i) => {
            const used = usedBankIndexes.has(i);
            return (
              <button
                key={i}
                type="button"
                onClick={() => placeToken(i)}
                aria-disabled={answered || used}
                className={cn(
                  "rounded-md border px-3 py-1.5 font-mono text-sm transition",
                  used
                    ? "border-dashed border-border text-transparent select-none"
                    : "border-input bg-card hover:border-foreground/40 hover:bg-accent",
                )}
              >
                {used && !reduced ? (
                  // Slot owns the layoutId while placed; keep size via hidden text
                  <span aria-hidden="true">{token}</span>
                ) : used ? (
                  <span aria-hidden="true">{token}</span>
                ) : (
                  <motion.span
                    layoutId={reduced ? undefined : `${stepKey}-token-${i}`}
                    transition={SPRING}
                    className="inline-block"
                  >
                    {token}
                  </motion.span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {answered && (
        <p className="text-sm text-muted-foreground">
          {lang === "tr" ? step.promptTr : step.prompt}
        </p>
      )}
    </div>
  );
}
