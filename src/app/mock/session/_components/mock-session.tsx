"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { MockOption, MockQuestion } from "@/lib/mock-shared";
import { TOPIC_LABELS } from "@/lib/topics";
import { cn } from "@/lib/utils";

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

function correctOption(question: MockQuestion): MockOption | undefined {
  return question.options.find((o) => o.isCorrect);
}

export function MockSession({ questions }: { questions: MockQuestion[] }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<(string | null)[]>(() =>
    questions.map(() => null),
  );
  const [finished, setFinished] = useState(false);

  const total = questions.length;
  const current = questions[index];
  if (!current) return null;

  const currentSelectedId = selected[index] ?? null;
  const isAnswered = currentSelectedId !== null;
  const isLast = index === total - 1;

  function handleSelect(optionId: string) {
    if (isAnswered) return;
    setSelected((prev) => {
      const next = [...prev];
      next[index] = optionId;
      return next;
    });
  }

  function handleNext() {
    if (isLast) setFinished(true);
    else setIndex((i) => i + 1);
  }

  if (finished) {
    const score = questions.reduce((sum, q, i) => {
      const picked = q.options.find((o) => o.id === selected[i]);
      return sum + (picked?.isCorrect ? 1 : 0);
    }, 0);
    const missed = questions
      .map((q, i) => ({ q, picked: q.options.find((o) => o.id === selected[i]) }))
      .filter((entry) => !entry.picked?.isCorrect);

    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Session complete
          </p>
          <p className="mt-2 text-4xl font-semibold tracking-tight">
            {score} / {total}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {score === total
              ? "Clean sweep — every answer correct."
              : `You missed ${total - score} question${total - score === 1 ? "" : "s"}.`}
          </p>
        </div>

        {missed.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              Review missed questions
            </h2>
            {missed.map(({ q, picked }) => {
              const answer = correctOption(q);
              return (
                <div
                  key={q.id}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span className="rounded bg-secondary px-1.5 py-0.5 font-medium text-secondary-foreground">
                      {TOPIC_LABELS[q.topic]}
                    </span>
                    <span className="text-muted-foreground">
                      {q.levelLabel}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium leading-snug">
                    {q.question}
                  </p>
                  <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">
                    <span className="font-medium">Your answer:</span>{" "}
                    {picked ? picked.text : "Not answered"}
                  </p>
                  <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
                    <span className="font-medium">Correct answer:</span>{" "}
                    {answer?.text}
                  </p>
                  {answer?.explanation && (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {answer.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => router.refresh()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Restart with same settings
          </button>
          <Link
            href="/mock"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium transition hover:bg-accent"
          >
            New session
          </Link>
          <Link
            href="/questions"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium transition hover:bg-accent"
          >
            Back to question bank
          </Link>
        </div>
      </div>
    );
  }

  const answer = correctOption(current);
  const pickedOption = current.options.find((o) => o.id === currentSelectedId);
  const progress = Math.round(((index + 1) / total) * 100);

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Question {index + 1} of {total}
          </span>
          <Link href="/mock" className="hover:text-foreground hover:underline">
            Quit
          </Link>
        </div>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-valuenow={index + 1}
          aria-valuemin={0}
          aria-valuemax={total}
        >
          <div
            className="h-full bg-foreground transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded bg-secondary px-1.5 py-0.5 font-medium text-secondary-foreground">
            {TOPIC_LABELS[current.topic]}
          </span>
          <span className="text-muted-foreground">{current.levelLabel}</span>
        </div>
        <h1 className="mt-3 text-lg font-semibold leading-snug">
          {current.question}
        </h1>

        <ul className="mt-5 space-y-2">
          {current.options.map((option, optionIndex) => {
            const isPicked = option.id === currentSelectedId;
            const showCorrect = isAnswered && option.isCorrect;
            const showWrong = isAnswered && isPicked && !option.isCorrect;
            return (
              <li key={option.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(option.id)}
                  disabled={isAnswered}
                  aria-pressed={isPicked}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-md border p-3 text-left text-sm transition",
                    !isAnswered &&
                      "border-input hover:border-foreground/40 hover:bg-accent",
                    isAnswered && "cursor-default",
                    showCorrect &&
                      "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",
                    showWrong &&
                      "border-rose-500 bg-rose-50 dark:bg-rose-950/40",
                    isAnswered &&
                      !showCorrect &&
                      !showWrong &&
                      "border-border opacity-60",
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
                    {OPTION_LABELS[optionIndex]}
                  </span>
                  <span className="flex-1 pt-0.5 leading-snug">
                    {option.text}
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
              {pickedOption?.isCorrect ? "Correct" : "Not quite"}
            </p>
            {pickedOption?.explanation && (
              <p className="mt-1">{pickedOption.explanation}</p>
            )}
            {!pickedOption?.isCorrect && answer && (
              <p className="mt-2 text-muted-foreground">
                <span className="font-medium text-foreground">
                  Correct answer:
                </span>{" "}
                {answer.text}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleNext}
          disabled={!isAnswered}
          className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLast ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
}
