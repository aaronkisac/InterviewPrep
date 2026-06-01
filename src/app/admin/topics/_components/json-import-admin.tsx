"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Upload } from "lucide-react";

import {
  bulkImportSystemQuestions,
  type BulkImportQuestion,
} from "@/lib/actions/admin-topics";
import { i18nAdmin } from "@/lib/i18n";
import {
  validateAdminImportJson,
  type AdminImportValidation,
} from "@/lib/validation/question-import";
import type { Language } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

const EXAMPLE = JSON.stringify(
  [
    {
      question: "What is the virtual DOM?",
      level: 2,
      answerGeneral: "A lightweight copy of the real DOM used to batch updates.",
      answerGeneralTr: "Güncellemeleri toplu yapmak için kullanılan gerçek DOM'un hafif kopyası.",
      answerPersonal: "I explained this in a Butlin's code review when optimising list renders.",
      mock_options: [
        { optionText: "A lightweight in-memory copy of the real DOM used to batch updates efficiently.", isCorrect: true, explanation: "Correct — React diffs the virtual DOM and only patches what changed." },
        { optionText: "A browser API for direct DOM manipulation without JavaScript.", isCorrect: false, explanation: "The virtual DOM is a React concept, not a browser API." },
        { optionText: "A CSS rendering engine used by modern browsers.", isCorrect: false, explanation: "That describes a browser's layout engine, not React's virtual DOM." },
        { optionText: "A server-side cache of the HTML document structure.", isCorrect: false, explanation: "The virtual DOM lives in memory on the client, not on the server." },
      ],
    },
  ],
  null,
  2,
);

export function JsonImportAdmin({
  topicSlug,
  topicName,
  lang = "en",
}: {
  topicSlug: string;
  topicName: string;
  lang?: Language;
}): React.ReactElement {
  const i18n = i18nAdmin[lang];
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [result, setResult] = useState<AdminImportValidation | null>(null);
  const [parseError, setParseError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState<number | null>(null);
  const router = useRouter();

  function handleChange(value: string): void {
    setText(value);
    setSuccess(null);
    if (!value.trim()) {
      setResult(null);
      setParseError("");
      return;
    }
    const out = validateAdminImportJson(value);
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
      const res = await bulkImportSystemQuestions(
        topicSlug,
        result.valid as BulkImportQuestion[],
      );
      if (res.ok) {
        setSuccess(res.inserted);
        setText("");
        setResult(null);
        router.refresh();
      } else {
        setParseError(res.error ?? i18n.importFailed);
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
      >
        <Upload className="size-3" /> Import JSON
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          Import questions → <span className="text-muted-foreground">{topicName}</span>
        </p>
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
        <summary className="cursor-pointer hover:text-foreground">Required fields + example</summary>
        <div className="mt-2 space-y-1">
          <p><span className="font-mono text-foreground">question</span> — string, required</p>
          <p><span className="font-mono text-foreground">level</span> — integer 1–5, required</p>
          <p><span className="font-mono text-foreground">answerGeneral</span> — string, required</p>
          <pre className="mt-2 overflow-x-auto rounded bg-muted p-2 text-[10px] leading-relaxed">{EXAMPLE}</pre>
        </div>
      </details>

      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={i18n.pastePlaceholder}
        rows={8}
        className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 font-mono text-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring"
      />

      {(result || parseError) && (
        <div className="space-y-1">
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
                {(() => {
                  const mockCount = result.valid.filter(
                    (q) => Array.isArray(q.mock_options) && q.mock_options.length === 4,
                  ).length;
                  return mockCount > 0 ? (
                    <span className="text-sky-600 dark:text-sky-400 ml-2">
                      · {mockCount} mock-ready
                    </span>
                  ) : null;
                })()}
                {result.invalid.length > 0 && (
                  <span className="text-amber-600 dark:text-amber-400 ml-2">
                    · {result.invalid.length} skipped
                  </span>
                )}
              </p>
              {result.invalid.length > 0 && (
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer hover:text-foreground">{i18n.showSkipped}</summary>
                  <ul className="mt-1 space-y-0.5 pl-3">
                    {result.invalid.map((inv) => (
                      <li key={inv.index} className="text-amber-600 dark:text-amber-400">
                        #{inv.index}: {inv.reasons.join(", ")}
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
          <CheckCircle2 className="size-3.5" /> {success} question{success !== 1 ? "s" : ""} imported successfully
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={isPending || !result || result.valid.length === 0}
        className="flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-xs font-medium text-background hover:opacity-80 disabled:opacity-40 transition-opacity"
      >
        <Upload className="size-3" />
        {isPending ? i18n.importing : i18n.import(result?.valid.length ?? 0)}
      </button>
    </div>
  );
}
