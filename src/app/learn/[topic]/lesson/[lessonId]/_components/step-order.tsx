"use client";

// order step: tap pool items to build the sequence; tap a chosen item to
// send it back. The pool is deterministically shuffled (no hydration drift).

import { motion } from "motion/react";
import { useMemo } from "react";

import { SPRING } from "@/lib/course/motion";
import { seededShuffle } from "@/lib/course/shuffle";
import type { OrderStep } from "@/lib/course/step-schema";
import type { Language } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

export function StepOrder({
  step,
  stepKey,
  sequence,
  answered,
  reduced,
  lang,
  i18n,
  onChange,
}: {
  step: OrderStep;
  stepKey: string;
  /** Indices into step.items, in the order the user picked them. */
  sequence: number[];
  answered: boolean;
  reduced: boolean;
  lang: Language;
  i18n: { yourOrder: string; pool: string };
  onChange: (next: number[]) => void;
}) {
  // Shuffled view of original indices; re-shuffle only per step instance.
  const pool = useMemo(
    () => seededShuffle(step.items.map((_, i) => i), stepKey),
    [step, stepKey],
  );
  const chosen = new Set(sequence);
  const label = (i: number) =>
    lang === "tr" ? step.items[i]!.textTr : step.items[i]!.text;

  const pick = (i: number) => {
    if (answered || chosen.has(i)) return;
    onChange([...sequence, i]);
  };
  const unpick = (slot: number) => {
    if (answered) return;
    onChange(sequence.filter((_, s) => s !== slot));
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {i18n.yourOrder}
        </p>
        <ol className="min-h-12 space-y-2" aria-live="polite">
          {sequence.map((itemIndex, slot) => {
            const correctHere = answered && itemIndex === slot;
            const wrongHere = answered && itemIndex !== slot;
            return (
              <li key={itemIndex}>
                <motion.button
                  type="button"
                  layoutId={reduced ? undefined : `${stepKey}-order-${itemIndex}`}
                  transition={SPRING}
                  onClick={() => unpick(slot)}
                  aria-disabled={answered}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left text-sm transition",
                    !answered && "border-primary/50 bg-primary/5 hover:bg-primary/10",
                    correctHere && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",
                    wrongHere && "border-rose-500 bg-rose-50 dark:bg-rose-950/40",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold",
                      correctHere
                        ? "bg-emerald-600 text-white"
                        : wrongHere
                          ? "bg-rose-600 text-white"
                          : "bg-primary text-primary-foreground",
                    )}
                    aria-hidden="true"
                  >
                    {slot + 1}
                  </span>
                  <span className="flex-1 leading-snug">{label(itemIndex)}</span>
                </motion.button>
              </li>
            );
          })}
        </ol>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {i18n.pool}
        </p>
        <div className="flex flex-col gap-2">
          {pool.map((itemIndex) => {
            const used = chosen.has(itemIndex);
            return (
              <button
                key={itemIndex}
                type="button"
                onClick={() => pick(itemIndex)}
                aria-disabled={answered || used}
                className={cn(
                  "rounded-xl border p-3 text-left text-sm transition",
                  used
                    ? "border-dashed border-border text-transparent select-none"
                    : "border-input bg-card hover:border-foreground/40 hover:bg-accent",
                )}
              >
                {used ? (
                  <span aria-hidden="true">{label(itemIndex)}</span>
                ) : (
                  <motion.span
                    layoutId={reduced ? undefined : `${stepKey}-order-${itemIndex}`}
                    transition={SPRING}
                    className="inline-block"
                  >
                    {label(itemIndex)}
                  </motion.span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
