"use client";

import { useState, useTransition } from "react";
import { ChevronRight, Plus, Trash2 } from "lucide-react";

import {
  deleteCustomTopic,
  type CustomQuestion,
  type CustomTopic,
} from "@/lib/actions/custom-topics";
import { JsonImportUser } from "@/app/dashboard/_components/json-import-user";
import { cn } from "@/lib/utils";

import { QuestionForm } from "./question-form";
import { QuestionRow } from "./question-row";
import type { MyTopicsI18n } from "./types";
import type { Language } from "@/lib/supabase/types";

export function TopicAccordion({
  topic,
  initialQuestions,
  onDeleteTopic,
  i18n,
  lang,
}: {
  topic: CustomTopic;
  initialQuestions: CustomQuestion[];
  onDeleteTopic: (id: string) => void;
  i18n: MyTopicsI18n;
  lang: Language;
}): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [questions, setQuestions] = useState<CustomQuestion[]>(initialQuestions);
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [isPending, startTransition] = useTransition();

  function removeTopic(): void {
    if (!confirm(i18n.deleteTopicConfirm(topic.name))) return;
    startTransition(async () => {
      const result = await deleteCustomTopic(topic.id);
      if (result.ok) onDeleteTopic(topic.id);
    });
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <ChevronRight
            className={cn(
              "size-4 flex-shrink-0 text-muted-foreground/60 transition-transform",
              open && "rotate-90",
            )}
          />
          <span className="font-medium">{topic.name}</span>
          <span className="text-xs text-muted-foreground">
            {i18n.questionCount(questions.length)}
          </span>
        </button>
        <JsonImportUser
          topicId={topic.id}
          onImported={(newQs) => setQuestions((prev) => [...prev, ...newQs])}
        />
        <button
          type="button"
          onClick={removeTopic}
          disabled={isPending}
          aria-label={i18n.deleteTopic}
          className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-40 transition-colors"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      {open && (
        <div className="border-t border-border px-4 py-3 space-y-2">
          {questions.length > 0 && (
            <ul className="space-y-2">
              {questions.map((q) => (
                <QuestionRow
                  key={q.id}
                  q={q}
                  onUpdate={(updated) =>
                    setQuestions((prev) =>
                      prev.map((x) => (x.id === updated.id ? updated : x)),
                    )
                  }
                  onDelete={(id) => setQuestions((prev) => prev.filter((x) => x.id !== id))}
                  i18n={i18n}
                  lang={lang}
                />
              ))}
            </ul>
          )}

          {addingQuestion ? (
            <QuestionForm
              topicId={topic.id}
              onSave={(q) => {
                setQuestions((prev) => [...prev, q]);
                setAddingQuestion(false);
              }}
              onCancel={() => setAddingQuestion(false)}
              i18n={i18n}
              lang={lang}
            />
          ) : (
            <button
              type="button"
              onClick={() => setAddingQuestion(true)}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors"
            >
              <Plus className="size-3" /> {i18n.addQuestion}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
