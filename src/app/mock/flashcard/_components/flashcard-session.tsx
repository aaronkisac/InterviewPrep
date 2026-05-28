"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Eye, ArrowRight, RotateCcw } from "lucide-react";

import { LevelDots } from "@/components/level-dots";
import { cn } from "@/lib/utils";

export type FlashcardQuestion = {
  id: string;
  question: string;
  answer: string;
  level: number;
  answer_personal?: string | null;
};

type Result = "known" | "unknown";

export function FlashcardSession({
  questions,
  topicName,
}: {
  questions: FlashcardQuestion[];
  topicName: string;
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [done, setDone] = useState(false);

  const current = questions[index];
  const total = questions.length;
  const known = results.filter((r) => r === "known").length;
  const pct = Math.round((known / total) * 100);

  function answer(result: Result) {
    const next = [...results, result];
    setResults(next);
    if (index + 1 >= total) {
      setDone(true);
    } else {
      setIndex(index + 1);
      setRevealed(false);
    }
  }

  function restart() {
    setIndex(0);
    setRevealed(false);
    setResults([]);
    setDone(false);
  }

  if (done) {
    const grade =
      pct === 100 ? { label: "Perfect", cls: "text-emerald-600 dark:text-emerald-400" }
      : pct >= 80 ? { label: "Strong", cls: "text-emerald-600 dark:text-emerald-400" }
      : pct >= 60 ? { label: "Decent", cls: "text-amber-600 dark:text-amber-400" }
      : { label: "Needs work", cls: "text-rose-600 dark:text-rose-400" };

    const missed = questions.filter((_, i) => results[i] === "unknown");

    return (
      <div className="space-y-6">
        {/* Score */}
        <div className="rounded-lg border border-border bg-card px-6 py-8 text-center">
          <p className={cn("text-4xl font-bold", grade.cls)}>{pct}%</p>
          <p className="mt-1 text-sm font-medium text-muted-foreground">{grade.label}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            {known} / {total} known
          </p>
        </div>

        {/* Missed questions */}
        {missed.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-medium">Review missed ({missed.length})</h2>
            <div className="space-y-2">
              {missed.map((q) => (
                <div key={q.id} className="rounded-lg border border-rose-500/20 bg-rose-50/30 px-4 py-3 dark:bg-rose-950/10">
                  <p className="text-sm font-medium">{q.question}</p>
                  {q.answer && (
                    <p className="mt-1.5 whitespace-pre-wrap text-xs text-foreground/70 leading-relaxed">
                      {q.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={restart}
            className="flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
          >
            <RotateCcw className="size-3.5" /> Restart
          </button>
          <button
            type="button"
            onClick={() => router.push("/mock")}
            className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Back to mock <ArrowRight className="size-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${((index) / total) * 100}%` }}
          />
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">
          {index + 1} / {total}
        </span>
      </div>

      {/* Card */}
      <div className="rounded-lg border border-border bg-card">
        {/* Question */}
        <div className="px-6 py-6">
          <div className="mb-3 flex items-center gap-2">
            <LevelDots level={current.level ?? 1} />
          </div>
          <p className="text-base font-medium leading-relaxed">{current.question}</p>
        </div>

        {/* Reveal / Answer */}
        {!revealed ? (
          <div className="border-t border-border px-6 py-4">
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Eye className="size-4" /> Show answer
            </button>
          </div>
        ) : (
          <div className="border-t border-border px-6 py-4 space-y-3">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Answer</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
                {current.answer || <span className="italic text-muted-foreground">No answer provided.</span>}
              </p>
            </div>
            {current.answer_personal && (
              <div className="rounded-md border border-violet-500/20 bg-violet-50/50 px-3 py-2 dark:bg-violet-950/20">
                <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-violet-600 dark:text-violet-400">
                  Personal note
                </p>
                <p className="whitespace-pre-wrap text-xs text-foreground/80">{current.answer_personal}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Self-assess buttons — only visible after reveal */}
      {revealed && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => answer("unknown")}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-rose-500/30 bg-rose-50 py-3 text-sm font-medium text-rose-700 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-950/50 transition-colors"
          >
            <XCircle className="size-4" /> Didn&apos;t know
          </button>
          <button
            type="button"
            onClick={() => answer("known")}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-50 py-3 text-sm font-medium text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300 dark:hover:bg-emerald-950/50 transition-colors"
          >
            <CheckCircle2 className="size-4" /> I knew it
          </button>
        </div>
      )}
    </div>
  );
}
