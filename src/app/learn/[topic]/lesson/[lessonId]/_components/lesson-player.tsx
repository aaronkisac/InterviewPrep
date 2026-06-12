"use client";

// Lesson player — the Duolingo-style core loop.
// One step per screen · check → instant feedback banner → continue.
// Wrong answers re-queue at the back (finish-to-pass, see lesson-queue.ts).
// All motion respects prefers-reduced-motion.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  accuracyPct,
  answerStep,
  continueStep,
  currentStep,
  initQueue,
  isDone,
  progress,
} from "@/lib/course/lesson-queue";
import {
  BANNER_TRANSITION,
  SPRING,
  SPRING_POP,
  STAGGER_DELAY,
  STEP_VARIANTS,
} from "@/lib/course/motion";
import { seededShuffle } from "@/lib/course/shuffle";
import { isInteractive, type Step } from "@/lib/course/step-schema";
import { usePrefersReducedMotion } from "@/lib/course/use-reduced-motion";
import { recordLessonResult } from "@/lib/actions/course";
import type { ChallengeData } from "@/lib/course-data";
import { i18nCourse } from "@/lib/i18n";
import { MarkdownContent } from "@/components/markdown-content";
import type { Language } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

import { OptionList, type PlayerOption } from "./option-list";
import { StepConcept } from "./step-concept";
import { StepFillBlank } from "./step-fill-blank";
import { StepMatch } from "./step-match";
import { StepOrder } from "./step-order";

export type PlayerLesson = {
  id: string;
  title: string;
  titleTr: string;
  topicSlug: string;
  steps: Step[];
  challenges: Record<string, ChallengeData>;
  nextLessonId: string | null;
};

type Phase = "answering" | "feedback";

type Feedback = {
  correct: boolean;
  explanation: string;
  explanationTr: string;
  /** Shown when the answer was wrong. */
  correctAnswer: string;
  correctAnswerTr: string;
};

export function LessonPlayer({
  lesson,
  lang,
}: {
  lesson: PlayerLesson;
  lang: Language;
}) {
  const i18n = i18nCourse[lang];
  const reduced = usePrefersReducedMotion();
  const router = useRouter();

  const [queue, setQueue] = useState(() => initQueue(lesson.steps.length));
  const [phase, setPhase] = useState<Phase>("answering");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  // Bumped on every advance so a re-queued step remounts with fresh state.
  const [served, setServed] = useState(0);

  // Per-step selection state (reset on advance)
  const [optionIndex, setOptionIndex] = useState<number | null>(null);
  const [blanksRaw, setBlanksRaw] = useState<Array<number | null>>([]);
  const [sequence, setSequence] = useState<number[]>([]);

  const stepIndex = currentStep(queue);
  const step = stepIndex !== null ? lesson.steps[stepIndex] : undefined;
  const stepKey = `${lesson.id}-${stepIndex}-${served}`;
  const done = isDone(queue);
  const savedRef = useRef(false);

  // ── Normalized options for the option-based step types ─────────────────────
  const playerOptions: PlayerOption[] | null = useMemo(() => {
    if (!step) return null;
    switch (step.type) {
      case "mcq":
      case "output_predict":
        return step.options.map((o) => ({
          text: o.text,
          textTr: o.textTr,
          correct: o.correct === true,
        }));
      case "true_false":
        return [
          {
            text: i18nCourse.en.trueLabel,
            textTr: i18nCourse.tr.trueLabel,
            correct: step.answer === true,
          },
          {
            text: i18nCourse.en.falseLabel,
            textTr: i18nCourse.tr.falseLabel,
            correct: step.answer === false,
          },
        ];
      case "challenge": {
        const data = step.questionId
          ? lesson.challenges[step.questionId]
          : undefined;
        return (data?.options ?? []).map((o) => ({
          text: o.text,
          textTr: o.textTr,
          correct: o.isCorrect,
          explanation: o.explanation,
          explanationTr: o.explanationTr,
        }));
      }
      default:
        return null;
    }
  }, [step, lesson.challenges]);

  // Fill-blank slots, derived — raw state starts empty and is sized lazily,
  // so no setState-in-effect is needed when the step changes.
  const blanks: Array<number | null> = useMemo(() => {
    if (step?.type !== "fill_blank") return [];
    return blanksRaw.length === step.answers.length
      ? blanksRaw
      : Array.from({ length: step.answers.length }, () => null);
  }, [step, blanksRaw]);

  const canCheck =
    step !== undefined &&
    phase === "answering" &&
    (playerOptions !== null
      ? optionIndex !== null
      : step.type === "fill_blank"
        ? blanks.length > 0 && blanks.every((b) => b !== null)
        : step.type === "order"
          ? sequence.length === step.items.length
          : false);

  // ── Answer evaluation ───────────────────────────────────────────────────────
  const buildFeedback = useCallback(
    (correct: boolean): Feedback => {
      const empty = { explanation: "", explanationTr: "", correctAnswer: "", correctAnswerTr: "" };
      if (!step) return { correct, ...empty };
      switch (step.type) {
        case "mcq":
        case "output_predict": {
          const right = step.options.find((o) => o.correct === true);
          return {
            correct,
            explanation: step.explanation,
            explanationTr: step.explanationTr,
            correctAnswer: right?.text ?? "",
            correctAnswerTr: right?.textTr ?? "",
          };
        }
        case "true_false":
          return {
            correct,
            explanation: step.explanation,
            explanationTr: step.explanationTr,
            correctAnswer: step.answer ? i18nCourse.en.trueLabel : i18nCourse.en.falseLabel,
            correctAnswerTr: step.answer ? i18nCourse.tr.trueLabel : i18nCourse.tr.falseLabel,
          };
        case "challenge": {
          const picked = optionIndex !== null ? playerOptions?.[optionIndex] : undefined;
          const right = playerOptions?.find((o) => o.correct);
          return {
            correct,
            explanation: picked?.explanation ?? "",
            explanationTr: picked?.explanationTr ?? "",
            correctAnswer: right?.text ?? "",
            correctAnswerTr: right?.textTr ?? "",
          };
        }
        case "fill_blank":
          return {
            correct,
            explanation: step.explanation,
            explanationTr: step.explanationTr,
            correctAnswer: step.answers.join("  ·  "),
            correctAnswerTr: step.answers.join("  ·  "),
          };
        case "order":
          return {
            correct,
            explanation: step.explanation,
            explanationTr: step.explanationTr,
            correctAnswer: step.items.map((it) => it.text).join(" → "),
            correctAnswerTr: step.items.map((it) => it.textTr).join(" → "),
          };
        default:
          return { correct, ...empty };
      }
    },
    [step, optionIndex, playerOptions],
  );

  const handleCheck = useCallback(() => {
    if (!step || !canCheck) return;
    let correct = false;
    if (playerOptions !== null && optionIndex !== null) {
      correct = playerOptions[optionIndex]?.correct === true;
    } else if (step.type === "fill_blank") {
      const bank = seededShuffle([...step.answers, ...step.distractors], stepKey);
      correct = blanks.every((b, i) => b !== null && bank[b] === step.answers[i]);
    } else if (step.type === "order") {
      correct = sequence.every((itemIndex, slot) => itemIndex === slot);
    }
    setFeedback(buildFeedback(correct));
    setPhase("feedback");
  }, [step, canCheck, playerOptions, optionIndex, blanks, sequence, stepKey, buildFeedback]);

  const handleMatchComplete = useCallback(
    (perfect: boolean) => {
      setFeedback(buildFeedback(perfect));
      setPhase("feedback");
    },
    [buildFeedback],
  );

  const advance = useCallback(() => {
    setQueue((q) => {
      if (!step) return q;
      return isInteractive(step)
        ? answerStep(q, feedback?.correct === true)
        : continueStep(q);
    });
    setServed((n) => n + 1);
    setPhase("answering");
    setFeedback(null);
    setOptionIndex(null);
    setBlanksRaw([]);
    setSequence([]);
  }, [step, feedback]);

  // ── Keyboard: 1–5 select options, Enter = check / continue ────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done) return;
      if (e.key === "Enter") {
        if (phase === "feedback") advance();
        else if (step && !isInteractive(step)) advance();
        else if (canCheck) handleCheck();
        return;
      }
      if (phase === "answering" && playerOptions) {
        const n = Number(e.key);
        if (Number.isInteger(n) && n >= 1 && n <= playerOptions.length) {
          setOptionIndex(n - 1);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, phase, step, canCheck, playerOptions, advance, handleCheck]);

  // ── Completion: save once + confetti ───────────────────────────────────────
  const finalAccuracy = accuracyPct(queue);
  useEffect(() => {
    if (!done || savedRef.current) return;
    savedRef.current = true;

    const challenges = lesson.steps.flatMap((s, i) =>
      s.type === "challenge" && s.questionId && i in queue.firstTry
        ? [{ questionId: s.questionId, correct: queue.firstTry[i] === true }]
        : [],
    );
    void recordLessonResult({
      lessonId: lesson.id,
      accuracyPct: finalAccuracy,
      challenges,
    });

    if (!reduced) {
      void import("canvas-confetti").then(({ default: confetti }) => {
        void confetti({ particleCount: 80, spread: 70, origin: { x: 0.3, y: 0.7 } });
        void confetti({ particleCount: 80, spread: 70, origin: { x: 0.7, y: 0.7 } });
      });
    }
  }, [done, lesson, queue, finalAccuracy, reduced]);

  const exit = useCallback(() => {
    const dirty = !done && (queue.cleared > 0 || Object.keys(queue.firstTry).length > 0);
    if (!dirty || window.confirm(i18n.exitConfirm)) {
      router.push("/dashboard");
    }
  }, [done, queue, router, i18n.exitConfirm]);

  const pct = Math.round(progress(queue) * 100);

  // ── Complete screen ─────────────────────────────────────────────────────────
  if (done) {
    const challengeCount = lesson.steps.filter((s) => s.type === "challenge").length;
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <motion.div
          initial={reduced ? false : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={SPRING_POP}
          className="flex size-16 items-center justify-center rounded-full bg-emerald-600 text-3xl text-white"
          aria-hidden="true"
        >
          ✓
        </motion.div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">
          {i18n.lessonComplete}
        </h1>
        <div className="mt-8 grid w-full grid-cols-2 gap-3">
          {[
            { label: i18n.firstTryAccuracy, value: `${finalAccuracy}%` },
            { label: i18n.challengesDone, value: String(challengeCount) },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: reduced ? 0 : i * STAGGER_DELAY }}
              className="rounded-xl border border-border bg-card p-4"
            >
              <p className="text-2xl font-semibold tabular-nums">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          {lesson.nextLessonId && (
            <Link
              href={`/learn/${lesson.topicSlug}/lesson/${lesson.nextLessonId}`}
              className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              {i18n.nextLesson} →
            </Link>
          )}
          <Link
            href="/dashboard"
            className="rounded-md border border-border px-5 py-2 text-sm font-medium transition hover:bg-accent"
          >
            {i18n.backToDashboard}
          </Link>
        </div>
      </div>
    );
  }

  // ── Active lesson ───────────────────────────────────────────────────────────
  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-4 sm:px-6">
      {/* Top bar: exit + progress */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={exit}
          aria-label={i18n.exitLesson}
          className="rounded-md p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          ✕
        </button>
        <div
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={i18n.lessonProgress}
          className="h-3 flex-1 overflow-hidden rounded-full bg-secondary"
        >
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={reduced ? { duration: 0 } : SPRING}
          />
        </div>
      </div>

      {/* Step card */}
      <div className="flex flex-1 flex-col justify-center py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepKey}
            variants={reduced ? undefined : STEP_VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            transition={SPRING}
          >
            {step && step.type === "challenge" && (
              <p className="mb-2 inline-block rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                ★ {i18n.challengeBadge}
              </p>
            )}
            {step && playerOptions !== null && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold leading-snug">
                  {step.type === "challenge"
                    ? (() => {
                        const data = step.questionId
                          ? lesson.challenges[step.questionId]
                          : undefined;
                        return lang === "tr" && data?.questionTr
                          ? data.questionTr
                          : (data?.question ?? "");
                      })()
                    : step.type === "true_false"
                      ? lang === "tr"
                        ? step.statementTr
                        : step.statement
                      : step.type === "mcq" || step.type === "output_predict"
                        ? lang === "tr"
                          ? step.promptTr
                          : step.prompt
                        : ""}
                </h2>
                {(step.type === "mcq" ||
                  step.type === "output_predict" ||
                  step.type === "true_false") &&
                  step.code && (
                    <MarkdownContent
                      source={"```jsx\n" + step.code + "\n```"}
                      lang={lang}
                    />
                  )}
                <OptionList
                  options={playerOptions}
                  selected={optionIndex}
                  answered={phase === "feedback"}
                  reduced={reduced}
                  lang={lang}
                  i18n={{ correct: i18n.correct, notQuite: i18n.notQuite }}
                  onSelect={setOptionIndex}
                />
              </div>
            )}
            {step?.type === "concept" && <StepConcept step={step} lang={lang} />}
            {step?.type === "fill_blank" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold leading-snug">
                  {lang === "tr" ? step.promptTr : step.prompt}
                </h2>
                <StepFillBlank
                  step={step}
                  stepKey={stepKey}
                  filled={blanks}
                  answered={phase === "feedback"}
                  reduced={reduced}
                  lang={lang}
                  i18n={{ wordBank: i18n.wordBank, blank: i18n.blankN }}
                  onChange={setBlanksRaw}
                />
              </div>
            )}
            {step?.type === "order" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold leading-snug">
                  {lang === "tr" ? step.promptTr : step.prompt}
                </h2>
                <StepOrder
                  step={step}
                  stepKey={stepKey}
                  sequence={sequence}
                  answered={phase === "feedback"}
                  reduced={reduced}
                  lang={lang}
                  i18n={{ yourOrder: i18n.yourOrder, pool: i18n.pool }}
                  onChange={setSequence}
                />
              </div>
            )}
            {step?.type === "match" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold leading-snug">
                  {lang === "tr" ? step.promptTr : step.prompt}
                </h2>
                <StepMatch
                  step={step}
                  stepKey={stepKey}
                  reduced={reduced}
                  lang={lang}
                  onComplete={handleMatchComplete}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom bar: check / feedback banner */}
      <div className="pb-4">
        <AnimatePresence mode="wait" initial={false}>
          {phase === "feedback" && feedback ? (
            <motion.div
              key="banner"
              initial={reduced ? false : { y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduced ? undefined : { y: 24, opacity: 0 }}
              transition={BANNER_TRANSITION}
              className={cn(
                "rounded-xl border-2 p-4",
                feedback.correct
                  ? "border-emerald-500/60 bg-emerald-50 dark:bg-emerald-950/40"
                  : "border-rose-500/60 bg-rose-50 dark:bg-rose-950/40",
              )}
              aria-live="polite"
            >
              <p
                className={cn(
                  "font-semibold",
                  feedback.correct
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-rose-700 dark:text-rose-300",
                )}
              >
                {feedback.correct ? i18n.correct : i18n.notQuite}
              </p>
              {(lang === "tr" ? feedback.explanationTr : feedback.explanation) && (
                <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                  {lang === "tr" ? feedback.explanationTr : feedback.explanation}
                </p>
              )}
              {!feedback.correct &&
                (lang === "tr" ? feedback.correctAnswerTr : feedback.correctAnswer) && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {i18n.correctAnswer}
                    </span>{" "}
                    {lang === "tr" ? feedback.correctAnswerTr : feedback.correctAnswer}
                  </p>
                )}
              <button
                type="button"
                onClick={advance}
                className="mt-3 w-full rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 sm:w-auto"
              >
                {i18n.continueBtn}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="check"
              initial={false}
              animate={{ opacity: 1 }}
              exit={reduced ? undefined : { opacity: 0 }}
              className="flex justify-end"
            >
              {step && !isInteractive(step) ? (
                <button
                  type="button"
                  onClick={advance}
                  className="w-full rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 sm:w-auto"
                >
                  {i18n.continueBtn}
                </button>
              ) : step?.type === "match" ? null : (
                <button
                  type="button"
                  onClick={handleCheck}
                  disabled={!canCheck}
                  className="w-full rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {i18n.check}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
