"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { getGrade } from "@/lib/grade";
import type { MockOption, MockQuestion } from "@/lib/mock-shared";
import type { Language } from "@/lib/supabase/types";
import { i18nCommon, i18nMockSession } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function correctOption(question: MockQuestion): MockOption | undefined {
  return question.options.find((o) => o.isCorrect);
}

export function EndScreen({
  questions,
  selected,
  score,
  total,
  lang,
  topicLabels,
  saveError,
  onRetryMissed,
}: {
  questions: MockQuestion[];
  selected: (string | null)[];
  score: number;
  total: number;
  lang: Language;
  topicLabels: Record<string, string>;
  saveError: boolean;
  onRetryMissed?: () => void;
}) {
  const router = useRouter();
  const i18n = i18nMockSession[lang];
  const common = i18nCommon[lang];

  const pct = Math.round((score / total) * 100);
  const grade = getGrade(pct, lang);

  const missed = questions
    .map((q, i) => ({ q, picked: q.options.find((o) => o.id === selected[i]) }))
    .filter((entry) => !entry.picked?.isCorrect);

  const topicMap = new Map<string, { correct: number; total: number }>();
  questions.forEach((q, i) => {
    const entry = topicMap.get(q.topic) ?? { correct: 0, total: 0 };
    entry.total += 1;
    const picked = q.options.find((o) => o.id === selected[i]);
    if (picked?.isCorrect) entry.correct += 1;
    topicMap.set(q.topic, entry);
  });
  const topicBreakdown = [...topicMap.entries()];

  return (
    <div className="space-y-6">
      {/* Score card */}
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <p className="text-sm font-medium text-muted-foreground">{i18n.sessionComplete}</p>
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
          <p className="mt-1 text-sm text-muted-foreground">{i18n.cleanSweep}</p>
        )}
      </div>

      {/* Topic breakdown */}
      {topicBreakdown.length > 1 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="mb-3 text-xs font-medium text-muted-foreground">{i18n.byTopic}</p>
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
                  {topicLabels[topic] ?? topic}
                  <span className="opacity-70">{correct}/{t}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Missed questions review */}
      {missed.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">{i18n.reviewAnswers}</h2>
          {missed.map(({ q, picked }) => {
            const answer = correctOption(q);
            return (
              <div key={q.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded bg-secondary px-1.5 py-0.5 font-medium text-secondary-foreground">
                    {topicLabels[q.topic] ?? q.topic}
                  </span>
                  <span className="text-muted-foreground">{q.levelLabel}</span>
                </div>
                <p className="mt-2 text-sm font-medium leading-snug">
                  {lang === "tr" && q.questionTr ? q.questionTr : q.question}
                </p>
                <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">
                  <span className="font-medium">{i18n.yourAnswer}</span>{" "}
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

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {onRetryMissed && missed.length > 0 && (
          <button
            type="button"
            onClick={onRetryMissed}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            {i18n.retryMissed(missed.length)}
          </button>
        )}
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
