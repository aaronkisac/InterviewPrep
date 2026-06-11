"use client";

import type { MockOption, MockQuestion } from "@/lib/mock-shared";
import type { Language } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

type I18n = {
  correct: string;
  notQuite: string;
  correctAnswer: string;
  next: string;
  finish: string;
};

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
  onSelect,
  onNext,
}: {
  question: MockQuestion;
  selectedId: string | null;
  isLast: boolean;
  lang: Language;
  topicLabels: Record<string, string>;
  i18n: I18n;
  onSelect: (optionId: string) => void;
  onNext: () => void;
}) {
  const isAnswered = selectedId !== null;
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
              {pickedOption?.isCorrect ? i18n.correct : i18n.notQuite}
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
