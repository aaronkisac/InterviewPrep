"use client";

// match step: two columns; select a left card then a right card. Correct
// pairs lock in and fade to "done"; a mispair flashes both cards red.
// Self-resolving — when every pair is matched, onComplete(perfect) fires.
// "perfect" = zero mispairs, which is what the queue records as correct.

import { motion } from "motion/react";
import { useMemo, useRef, useState } from "react";

import { PULSE_KEYFRAMES, PULSE_TRANSITION } from "@/lib/course/motion";
import { seededShuffle } from "@/lib/course/shuffle";
import type { MatchStep } from "@/lib/course/step-schema";
import type { Language } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

export function StepMatch({
  step,
  stepKey,
  reduced,
  lang,
  onComplete,
}: {
  step: MatchStep;
  stepKey: string;
  reduced: boolean;
  lang: Language;
  onComplete: (perfect: boolean) => void;
}) {
  // Right column shuffled deterministically; left stays in authored order.
  const rightOrder = useMemo(
    () => seededShuffle(step.pairs.map((_, i) => i), stepKey),
    [step, stepKey],
  );

  const [resolved, setResolved] = useState<Set<number>>(new Set());
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [flash, setFlash] = useState<{ left: number; right: number } | null>(null);
  const mistakesRef = useRef(0);
  const doneRef = useRef(false);

  const leftLabel = (i: number) =>
    lang === "tr" ? step.pairs[i]!.leftTr : step.pairs[i]!.left;
  const rightLabel = (i: number) =>
    lang === "tr" ? step.pairs[i]!.rightTr : step.pairs[i]!.right;

  const pickRight = (i: number) => {
    if (selectedLeft === null || resolved.has(i) || flash) return;
    if (i === selectedLeft) {
      const next = new Set(resolved);
      next.add(i);
      setResolved(next);
      setSelectedLeft(null);
      if (next.size === step.pairs.length && !doneRef.current) {
        doneRef.current = true;
        // Give the last pulse a beat to play before the banner slides in.
        setTimeout(() => onComplete(mistakesRef.current === 0), reduced ? 0 : 350);
      }
    } else {
      mistakesRef.current += 1;
      setFlash({ left: selectedLeft, right: i });
      setTimeout(() => {
        setFlash(null);
        setSelectedLeft(null);
      }, 450);
    }
  };

  const cardClass = (state: "idle" | "selected" | "resolved" | "flash") =>
    cn(
      "w-full rounded-xl border-2 p-3 text-left text-sm transition",
      state === "idle" && "border-input bg-card hover:border-foreground/40 hover:bg-accent",
      state === "selected" && "border-primary bg-primary/10",
      state === "resolved" && "border-emerald-500/50 bg-emerald-50/50 opacity-50 dark:bg-emerald-950/20",
      state === "flash" && "border-rose-500 bg-rose-50 dark:bg-rose-950/40",
    );

  return (
    <div className="grid grid-cols-2 gap-3" aria-live="polite">
      <div className="space-y-2">
        {step.pairs.map((_, i) => {
          const state = resolved.has(i)
            ? "resolved"
            : flash?.left === i
              ? "flash"
              : selectedLeft === i
                ? "selected"
                : "idle";
          return (
            <motion.button
              key={i}
              type="button"
              onClick={() => {
                if (!resolved.has(i) && !flash) setSelectedLeft(i);
              }}
              animate={
                !reduced && resolved.has(i) ? PULSE_KEYFRAMES : undefined
              }
              transition={PULSE_TRANSITION}
              aria-disabled={resolved.has(i)}
              aria-pressed={selectedLeft === i}
              className={cardClass(state)}
            >
              {leftLabel(i)}
            </motion.button>
          );
        })}
      </div>
      <div className="space-y-2">
        {rightOrder.map((i) => {
          const state = resolved.has(i)
            ? "resolved"
            : flash?.right === i
              ? "flash"
              : "idle";
          return (
            <motion.button
              key={i}
              type="button"
              onClick={() => pickRight(i)}
              animate={
                !reduced && resolved.has(i) ? PULSE_KEYFRAMES : undefined
              }
              transition={PULSE_TRANSITION}
              aria-disabled={resolved.has(i) || selectedLeft === null}
              className={cardClass(state)}
            >
              {rightLabel(i)}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
