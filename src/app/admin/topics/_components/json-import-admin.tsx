"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Upload } from "lucide-react";

import { bulkImportSystemQuestions, type BulkImportQuestion, type MockOption } from "@/lib/actions/admin-topics";
import { i18nAdmin } from "@/lib/i18n";
import type { Language } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type ValidationResult = {
  valid: BulkImportQuestion[];
  invalid: Array<{ index: number; reasons: string[] }>;
};

function validateMockOptions(opts: unknown): string | null {
  if (!Array.isArray(opts)) return '"mock_options" must be an array';
  if (opts.length !== 4) return '"mock_options" must have exactly 4 items';
  const correctCount = opts.filter((o) => (o as Record<string, unknown>).isCorrect === true).length;
  if (correctCount !== 1) return '"mock_options" must have exactly 1 correct answer';
  for (const o of opts) {
    const opt = o as Record<string, unknown>;
    if (!opt.optionText || typeof opt.optionText !== "string" || !(opt.optionText as string).trim())
      return 'Each option needs a non-empty "optionText"';
  }
  return null;
}

function validateAdminJson(raw: string): { parsed: ValidationResult; error?: never } | { error: string; parsed?: never } {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { error: "Invalid JSON — check syntax" };
  }
  if (!Array.isArray(data)) return { error: "Expected a JSON array [ ... ]" };

  const valid: BulkImportQuestion[] = [];
  const invalid: Array<{ index: number; reasons: string[] }> = [];

  for (let i = 0; i < data.length; i++) {
    const item = data[i] as Record<string, unknown>;
    const reasons: string[] = [];

    if (!item.question || typeof item.question !== "string" || !item.question.trim())
      reasons.push('"question" is required (non-empty string)');

    const level = Number(item.level);
    if (!item.level || !Number.isInteger(level) || level < 1 || level > 5)
      reasons.push('"level" is required (integer 1–5)');

    if (!item.answerGeneral || typeof item.answerGeneral !== "string" || !item.answerGeneral.trim())
      reasons.push('"answerGeneral" is required (non-empty string)');

    // Validate mock_options only if provided
    if (item.mock_options !== undefined && item.mock_options !== null) {
      const optErr = validateMockOptions(item.mock_options);
      if (optErr) reasons.push(optErr);
    }

    if (reasons.length > 0) {
      invalid.push({ index: i + 1, reasons });
    } else {
      valid.push(item as unknown as BulkImportQuestion);
    }
  }

  return { parsed: { valid, invalid } };
}

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

export function JsonImportAdmin({ topicSlug, topicName }: { topicSlug: string; topicName: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [parseError, setParseError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState<number | null>(null);
  const router = useRouter();

  function handleChange(value: string) {
    setText(value);
    setSuccess(null);
    if (!value.trim()) { setResult(null); setParseError(""); return; }
    const out = validateAdminJson(value);
    if (out.error) { setParseError(out.error); setResult(null); }
    else { setParseError(""); setResult(out.parsed!); }
  }

  function submit() {
    if (!result || result.valid.length === 0) return;
    startTransition(async () => {
      const res = await bulkImportSystemQuestions(topicSlug, result.valid);
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
          onClick={() => { setOpen(false); setText(""); setResult(null); setParseError(""); }}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>

      {/* Format hint */}
      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer hover:text-foreground">Required fields + example</summary>
        <div className="mt-2 space-y-1">
          <p><span className="font-mono text-foreground">question</span> — string, required</p>
          <p><span className="font-mono text-foreground">level</span> — integer 1–5, required</p>
          <p><span className="font-mono text-foreground">answerGeneral</span> — string, required</p>
          <p className="text-muted-foreground/60">Optional: answerGeneralTr, answerPersonal, answerPersonalTr, detailMd, detailMdTr, topic</p>
          <p className="text-muted-foreground/60">
            <span className="font-mono text-foreground">mock_options</span> — optional array of exactly 4 objects{" "}
            <span className="italic">(makes question available in mock exam)</span>
            <br />
            Each option: <span className="font-mono">optionText</span> (required), <span className="font-mono">isCorrect</span> (exactly 1 true), <span className="font-mono">explanation</span> (optional)
          </p>
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

      {/* Live status */}
      {(result || parseError) && (
        <div className="space-y-1">
          {parseError && (
            <p className="flex items-center gap-1 text-xs text-destructive">
              <XCircle className="size-3" /> {parseError}
            </p>
          )}
          {result && (
            <>
              <p className={cn("flex items-center gap-1 text-xs font-medium",
                result.valid.length > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
              )}>
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
