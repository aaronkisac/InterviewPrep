"use client";

import { useState, useTransition } from "react";
import { ChevronRight, Pencil, Trash2 } from "lucide-react";

import { deleteCustomQuestion, type CustomQuestion } from "@/lib/actions/custom-topics";
import { LevelDots } from "@/components/level-dots";
import { cn } from "@/lib/utils";
import type { Language } from "@/lib/supabase/types";

import { QuestionForm } from "./question-form";
import type { MyTopicsI18n } from "./types";

export function QuestionRow({
  q,
  onUpdate,
  onDelete,
  i18n,
  lang,
}: {
  q: CustomQuestion;
  onUpdate: (updated: CustomQuestion) => void;
  onDelete: (id: string) => void;
  i18n: MyTopicsI18n;
  lang: Language;
}): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  function remove(): void {
    if (!confirm(i18n.deleteQuestion)) return;
    startTransition(async () => {
      const result = await deleteCustomQuestion(q.id);
      if (result.ok) onDelete(q.id);
    });
  }

  if (editing) {
    return (
      <QuestionForm
        topicId={q.topic_id}
        initial={q}
        onSave={(updated) => {
          onUpdate(updated);
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
        i18n={i18n}
        lang={lang}
      />
    );
  }

  return (
    <li className="rounded-lg border border-border bg-background transition hover:border-foreground/20">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <ChevronRight
            className={cn(
              "size-3 flex-shrink-0 text-muted-foreground/50 transition-transform",
              open && "rotate-90",
            )}
          />
          <span className="truncate text-sm font-medium">{q.question}</span>
        </button>

        <LevelDots level={q.level ?? 1} />

        {Array.isArray(q.mock_options) && q.mock_options.length === 4 && (
          <span className="shrink-0 rounded border border-sky-500/40 bg-sky-50 px-1.5 py-0.5 text-[10px] text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
            Mock
          </span>
        )}

        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={i18n.edit}
          className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Pencil className="size-3" />
        </button>
        <button
          type="button"
          onClick={remove}
          disabled={isPending}
          aria-label={i18n.delete}
          className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-40 transition-colors"
        >
          <Trash2 className="size-3" />
        </button>
      </div>

      {open && (
        <div className="border-t border-border px-3 py-2.5 space-y-2">
          {q.answer ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
              {q.answer}
            </p>
          ) : (
            <p className="text-sm italic text-muted-foreground">
              {i18n.noAnswer}{" "}
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="underline hover:text-foreground"
              >
                {i18n.addOne}
              </button>
            </p>
          )}
          {q.answer_personal && (
            <div className="rounded-md border border-violet-500/20 bg-violet-50/50 px-3 py-2 dark:bg-violet-950/20">
              <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-violet-600 dark:text-violet-400">
                {i18n.personalNoteHeading}
              </p>
              <p className="whitespace-pre-wrap text-xs text-foreground/80">
                {q.answer_personal}
              </p>
            </div>
          )}
        </div>
      )}
    </li>
  );
}
