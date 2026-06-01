"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { saveMockSession, saveTopicMastery } from "@/lib/actions/user-tracking";
import { getGrade } from "@/lib/grade";
import type { MockOption, MockQuestion } from "@/lib/mock-shared";
import {
  buildQuestionResults,
  computeMockScore,
} from "@/lib/mock-scoring";
import type { Language } from "@/lib/supabase/types";
import { i18nCommon, i18nMockSession } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

function correctOption(question: MockQuestion): MockOption | undefined {
  return question.options.find((o) => o.isCorrect);
}

export function MockSession({
  questions,
  topicLabels = {},
  lang = "en",
}: {
  questions: MockQuestion[];
  topicLabels?: Record<string, string>;
  lang?: Language;
}) {
  const i18n = i18nMockSession[lang];
  const common = i18nCommon[lang];
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<(string | null)[]>(() =>
    questions.map(() => null),
  );
  const [finished, setFinished] = useState(false);

  const total = questions.length;
  const current = questions[index];
  const saveCalledRef = useRef(false);
  const [saveError, setSaveError] = useState(false);

  const score = useMemo(
    () => (finished ? computeMockScore(questions, selected) : 0),
    [finished, questions, selected],
  );

  useEffect(() => {
    if (!finished || saveCalledRef.current) return;
    saveCalledRef.current = true;

    const questionResults = buildQuestionResults(questions, selected);
    const topics = [...new Set(questions.map((q) => q.topic))];

    void Promise.all([
      saveMockSession({
        score,
        total,
        topics,
        questionResults: questionResults.map(({ questionId, correct }) => ({
          questionId,
          correct,
        })),
      }),
      saveTopicMastery(
        "mock",
        questionResults.map((r) => ({
          questionId: r.questionId,
          topic: r.topic,
          mastered: r.correct,
        })),
      ),
    ]).catch(() => setSaveError(true));
  }, [finished, questions, score, selected, total]);

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
    const missed = questions
      .map((q, i) => ({ q, picked: q.options.find((o) => o.id === selected[i]) }))
      .filter((entry) => !entry.picked?.isCorrect);

    const pct = Math.round((score / total) * 100);
    const grade = getGrade(pct, lang);

    const topicMap = new Map<string, { correct: number; total: number }>();
    questions.forEach((q, i) => {
      const key = q.topic;
      if (!topicMap.has(key)) topicMap.set(key, { correct: 0, total: 0 });
      const entry = topicMap.get(key)!;
      entry.total += 1;
      const picked = q.options.find((o) => o.id === selected[i]);
      if (picked?.isCorrect) entry.correct += 1;
    });
    const topicBreakdown = [...topicMap.entries()];

    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            {i18n.sessionComplete}
          </p>
          <p className="mt-2 text-4xl font-semibold tracking-tight">
            {score} / {total}
          </p>
          <p className={cn("mt-1 text-sm font-medium", grade.textClass)}>
            {pct}% — {grade.label}
          </p>
          {saveError && (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
              Session could not be saved. Your score is shown but progress was not recorded.
            </p>
          )}
          {score === total && (
            <p className="mt-1 text-sm text-muted-foreground">
              {i18n.cleanSweep}
            </p>
          )}
        </div>

        {topicBreakdown.length > 1 && (
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="mb-3 text-xs font-medium text-muted-foreground">
              {i18n.byTopic}
            </p>
            <div className="flex flex-wrap gap-2">
              {topicBreakdown.map(([topic, { correct, total: t }]) => {
                const topicPct = Math.round((correct / t) * 100);
                return (
                  <span
                    key={topic}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium",
                      topicPct === 100
                        ? "border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : topicPct >= 60
                          ? "border-amber-500/40 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                          : "border-rose-500/40 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
                    )}
                  >
                    {topicLabels[topic as string] ?? topic}
                    <span className="opacity-70">{correct}/{t}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {missed.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              {i18n.reviewAnswers}
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
                      {topicLabels[q.topic] ?? q.topic}
                    </span>
                    <span className="text-muted-foreground">{q.levelLabel}</span>
                  </div>
                  <p className="mt-2 text-sm font-medium leading-snug">{q.question}</p>
                  <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">
                    <span className="font-medium">
                      {i18n.yourAnswer}
                    </span>{" "}
                    {picked ? (lang === "tr" && picked.textTr ? picked.textTr : picked.text) : i18n.notAnswered}
                  </p>
                  <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
                    <span className="font-medium">{i18n.correctAnswer}</span>{" "}
                    {answer ? (lang === "tr" && answer.textTr ? answer.textTr : answer.text) : null}
                  </p>
                  {answer?.explanation && (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {lang === "tr" && answer.explanationTr ? answer.explanationTr : answer.explanation}
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
            {i18n.restart}
          </button>
          <Link
            href="/mock"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium transition hover:bg-accent"
          >
            {common.newSession}
          </Link>
          <Link
            href="/questions"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium transition hover:bg-accent"
          >
            {i18n.backToBank}
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
          <span>{i18n.questionOf(index + 1, total)}</span>
          <Link href="/mock" className="hover:text-foreground hover:underline">
            {common.quit}
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
            {topicLabels[current.topic] ?? current.topic}
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
                    {OPTION_LABELS[optionIndex]}
                  </span>
                  <span className="flex-1 pt-0.5 leading-snug">{lang === "tr" && option.textTr ? option.textTr : option.text}</span>
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
              <p className="mt-1">{lang === "tr" && pickedOption.explanationTr ? pickedOption.explanationTr : pickedOption.explanation}</p>
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
          onClick={handleNext}
          disabled={!isAnswered}
          className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLast ? i18n.finish : i18n.next}
        </button>
      </div>
    </div>
  );
}
