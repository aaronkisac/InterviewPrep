"use client";

import { useEffect, useState } from "react";

import type { MockOption, MockQuestion } from "@/lib/mock-shared";
import type { Language } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

type I18n = {
  correct: string;
  notQuite: string;
  timeUp: string;
  timeLeft: string;
  correctAnswer: string;
  next: string;
  finish: string;
};

/**
 * Per-question countdown. Mounted with a key per question so state resets
 * naturally; stops ticking once the question is answered.
 */
function Countdown({
  seconds,
  active,
  label,
  onTimeout,
}: {
  seconds: number;
  active: boolean;
  label: string;
  onTimeout: () => void;
}) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    if (!active || left <= 0) return;
    const id = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(id);
  }, [active, left]);

  useEffect(() => {
    if (left === 0 && active) onTimeout();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once when the clock hits zero
  }, [left]);

  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, "0");

  return (
    <span
      role="timer"
      aria-label={`${label}: ${mm}:${ss}`}
      className={
        "ml-auto rounded-md border px-2 py-0.5 font-mono text-xs font-semibold tabular-nums " +
        (left <= 10 && active
          ? "border-rose-500/60 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
          : "border-border bg-secondary text-secondary-foreground")
      }
    >
      {mm}:{ss}
    </span>
  );
}

function correctOption(question: MockQuestion): MockOption | undefined {
  return question.options.find((o) => o.isCorrect);
}

export function QuestionView({
  question,
  selectedId,
  isLast,
  lang,
  topicLabels,
  i18n,
  timerSeconds = 0,
  onSelect,
  onNext,
  onTimeout,
}: {
  question: MockQuestion;
  selectedId: string | null;
  isLast: boolean;
  lang: Language;
  topicLabels: Record<string, string>;
  i18n: I18n;
  timerSeconds?: number;
  onSelect: (optionId: string) => void;
  onNext: () => void;
  onTimeout: () => void;
}) {
  const isAnswered = selectedId !== null;
  const timedOut = selectedId === "";
  const pickedOption = question.options.find((o) => o.id === selectedId);
  const answer = correctOption(question);

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded bg-secondary px-1.5 py-0.5 font-medium text-secondary-foreground">
            {topicLabels[question.topic] ?? question.topic}
          </span>
          <span className="text-muted-foreground">{question.levelLabel}</span>
          {timerSeconds > 0 && (
            <Countdown
              key={question.id}
              seconds={timerSeconds}
              active={!isAnswered}
              label={i18n.timeLeft}
              onTimeout={onTimeout}
            />
          )}
        </div>
        <h1 className="mt-3 text-lg font-semibold leading-snug">
          {lang === "tr" && question.questionTr ? question.questionTr : question.question}
        </h1>

        <ul className="mt-5 space-y-2">
          {question.options.map((option, i) => {
            const isPicked = option.id === selectedId;
            const showCorrect = isAnswered && option.isCorrect;
            const showWrong = isAnswered && isPicked && !option.isCorrect;
            return (
              <li key={option.id}>
                <button
                  type="button"
                  // aria-disabled instead of disabled: a hard disable would
                  // drop keyboard focus to <body> the moment an answer locks in
                  onClick={() => {
                    if (!isAnswered) onSelect(option.id);
                  }}
                  aria-disabled={isAnswered}
                  aria-pressed={isPicked}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-md border p-3 text-left text-sm transition",
                    !isAnswered && "border-input hover:border-foreground/40 hover:bg-accent",
                    isAnswered && "cursor-default",
                    showCorrect && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",
                    showWrong && "border-rose-500 bg-rose-50 dark:bg-rose-950/40",
                    isAnswered && !showCorrect && !showWrong && "border-border opacity-60",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded text-xs font-semibold",
                      showCorrect
                        ? "bg-emerald-600 text-white"
                        : showWrong
                          ? "bg-rose-600 text-white"
                          : "bg-secondary text-secondary-foreground",
                    )}
                    aria-hidden="true"
                  >
                    {OPTION_LABELS[i]}
                  </span>
                  <span className="flex-1 pt-0.5 leading-snug">
                    {lang === "tr" && option.textTr ? option.textTr : option.text}
                    {showCorrect && (
                      <span className="sr-only"> — {i18n.correct}</span>
                    )}
                    {showWrong && (
                      <span className="sr-only"> — {i18n.notQuite}</span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {isAnswered && (
          <div
            className={cn(
              "mt-4 rounded-md border p-3 text-sm leading-relaxed",
              pickedOption?.isCorrect
                ? "border-emerald-500/60 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
                : "border-rose-500/60 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200",
            )}
            aria-live="polite"
          >
            <p className="font-medium">
              {pickedOption?.isCorrect
                ? i18n.correct
                : timedOut
                  ? i18n.timeUp
                  : i18n.notQuite}
            </p>
            {pickedOption?.explanation && (
              <p className="mt-1">
                {lang === "tr" && pickedOption.explanationTr
                  ? pickedOption.explanationTr
                  : pickedOption.explanation}
              </p>
            )}
            {!pickedOption?.isCorrect && answer && (
              <p className="mt-2 text-muted-foreground">
                <span className="font-medium text-foreground">{i18n.correctAnswer}</span>{" "}
                {lang === "tr" && answer.textTr ? answer.textTr : answer.text}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onNext}
          disabled={!isAnswered}
          className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLast ? i18n.finish : i18n.next}
        </button>
      </div>
    </div>
  );
}
