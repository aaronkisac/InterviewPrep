"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, XCircle, Upload } from "lucide-react";

import { createCustomQuestion, type CustomQuestion } from "@/lib/actions/custom-topics";
import { validateUserImportJson, type UserImportValidation } from "@/lib/validation/question-import";
import { cn } from "@/lib/utils";

const EXAMPLE = JSON.stringify(
  [
    {
      question: "What is the difference between null and undefined?",
      answer: "null is explicit absence, undefined is uninitialized.",
      level: 2,
      answer_personal: "I always remember: null = intentional empty, undefined = forgotten.",
    },
    {
      question: "What is a closure?",
      answer: "A function that retains access to its outer scope even after the outer function returns.",
      level: 3,
      mock_options: [
        { optionText: "A function that retains access to its outer scope", isCorrect: true, explanation: "Correct — this is the definition of a closure." },
        { optionText: "A function with no return value", isCorrect: false },
        { optionText: "A function that runs immediately", isCorrect: false },
        { optionText: "A function stored in an object", isCorrect: false },
      ],
    },
  ],
  null,
  2,
);

export function JsonImportUser({
  topicId,
  onImported,
}: {
  topicId: string;
  onImported: (questions: CustomQuestion[]) => void;
}): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [result, setResult] = useState<UserImportValidation | null>(null);
  const [parseError, setParseError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState<number | null>(null);

  function handleChange(value: string): void {
    setText(value);
    setSuccess(null);
    if (!value.trim()) {
      setResult(null);
      setParseError("");
      return;
    }
    const out = validateUserImportJson(value);
    if (out.error) {
      setParseError(out.error);
      setResult(null);
    } else {
      setParseError("");
      setResult(out.parsed ?? null);
    }
  }

  function submit(): void {
    if (!result || result.valid.length === 0) return;
    startTransition(async () => {
      const created: CustomQuestion[] = [];
      for (const q of result.valid) {
        const res = await createCustomQuestion(
          topicId,
          q.question,
          q.answer,
          q.level,
          q.answer_personal,
          q.mock_options,
        );
        if (res.ok && res.question) created.push(res.question);
      }
      setSuccess(created.length);
      setText("");
      setResult(null);
      onImported(created);
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <Upload className="size-3" /> Import JSON
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-ring bg-background p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium">Import questions via JSON</p>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setText("");
            setResult(null);
            setParseError("");
          }}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>

      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer hover:text-foreground">Format + example</summary>
        <div className="mt-1 space-y-0.5">
          <p><span className="font-mono text-foreground">question</span> — required</p>
          <p><span className="font-mono text-foreground">answer</span> — optional</p>
          <p><span className="font-mono text-foreground">level</span> — optional (1–5, default 1)</p>
          <p><span className="font-mono text-foreground">answer_personal</span> — optional personal note</p>
          <p>
            <span className="font-mono text-foreground">mock_options</span> — optional, array of exactly 4 objects
          </p>
          <pre className="mt-1.5 overflow-x-auto rounded bg-muted p-2 text-[10px] leading-relaxed">{EXAMPLE}</pre>
        </div>
      </details>

      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Paste JSON array here…"
        rows={6}
        className="w-full resize-y rounded-md border border-input bg-background px-3 py-1.5 font-mono text-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring"
      />

      {(result || parseError) && (
        <div className="space-y-0.5">
          {parseError && (
            <p className="flex items-center gap-1 text-xs text-destructive">
              <XCircle className="size-3" /> {parseError}
            </p>
          )}
          {result && (
            <>
              <p
                className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  result.valid.length > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground",
                )}
              >
                <CheckCircle2 className="size-3" />
                {result.valid.length} valid question{result.valid.length !== 1 ? "s" : ""}
                {result.invalid.length > 0 && (
                  <span className="text-amber-600 dark:text-amber-400 ml-1">
                    · {result.invalid.length} skipped
                  </span>
                )}
              </p>
              {result.invalid.length > 0 && (
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer hover:text-foreground">Show skipped</summary>
                  <ul className="mt-1 pl-3 space-y-0.5">
                    {result.invalid.map((inv) => (
                      <li key={inv.index} className="text-amber-600 dark:text-amber-400">
                        #{inv.index}: {inv.reason}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </>
          )}
        </div>
      )}

      {success !== null && (
        <p className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-3.5" /> {success} question{success !== 1 ? "s" : ""} imported
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={isPending || !result || result.valid.length === 0}
        className="flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-80 disabled:opacity-40 transition-opacity"
      >
        <Upload className="size-3" />
        {isPending
          ? "Importing…"
          : `Import ${result?.valid.length ?? 0} question${(result?.valid.length ?? 0) !== 1 ? "s" : ""}`}
      </button>
    </div>
  );
}
