"use client";

import { useState, useTransition } from "react";
import { Check, ChevronDown, ChevronRight, X } from "lucide-react";

import {
  createCustomQuestion,
  updateCustomQuestion,
  type CustomQuestion,
} from "@/lib/actions/custom-topics";
import { i18nLevels } from "@/lib/i18n";
import { LEVELS } from "@/lib/topics";
import { DEFAULT_MOCK_OPTIONS, type MockOptionInput } from "@/types/mock";

import { MockOptionsEditor } from "./mock-options-editor";
import type { MyTopicsI18n } from "./types";
import type { Language } from "@/lib/supabase/types";

export function QuestionForm({
  topicId,
  initial,
  onSave,
  onCancel,
  i18n,
  lang,
}: {
  topicId: string;
  initial?: CustomQuestion;
  onSave: (q: CustomQuestion) => void;
  onCancel: () => void;
  i18n: MyTopicsI18n;
  lang: Language;
}): React.ReactElement {
  const [question, setQuestion] = useState(initial?.question ?? "");
  const [answer, setAnswer] = useState(initial?.answer ?? "");
  const [level, setLevel] = useState(initial?.level ?? 1);
  const [answerPersonal, setAnswerPersonal] = useState(initial?.answer_personal ?? "");
  const [showMock, setShowMock] = useState(Boolean(initial?.mock_options));
  const [mockOptions, setMockOptions] = useState<MockOptionInput[]>(
    initial?.mock_options ?? DEFAULT_MOCK_OPTIONS.map((o) => ({ ...o })),
  );
  const [isPending, startTransition] = useTransition();

  const validMock =
    showMock &&
    mockOptions.every((o) => o.optionText.trim()) &&
    mockOptions.filter((o) => o.isCorrect).length === 1;

  function submit(e: React.FormEvent): void {
    e.preventDefault();
    if (!question.trim()) return;
    const opts = showMock && validMock ? mockOptions : undefined;
    startTransition(async () => {
      if (initial) {
        const result = await updateCustomQuestion(
          initial.id,
          question,
          answer,
          level,
          answerPersonal,
          opts,
        );
        if (result.ok) {
          onSave({
            ...initial,
            question: question.trim(),
            answer: answer.trim(),
            level,
            answer_personal: answerPersonal.trim() || null,
            mock_options: opts ?? null,
          });
        }
      } else {
        const result = await createCustomQuestion(
          topicId,
          question,
          answer,
          level,
          answerPersonal,
          opts,
        );
        if (result.ok && result.question) {
          onSave(result.question);
        }
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-lg border border-ring bg-background p-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">
          {i18n.questionLabel} <span className="text-destructive">*</span>
        </label>
        <textarea
          autoFocus
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={i18n.questionPlaceholder}
          rows={2}
          className="w-full resize-y rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">
          {i18n.levelLabel}
        </label>
        <select
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
          className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
        >
          {LEVELS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.value} — {i18nLevels[lang][l.value as keyof typeof i18nLevels.en] ?? l.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">
          {i18n.answerLabel} <span className="text-destructive">*</span>
        </label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder={i18n.answerPlaceholder}
          rows={3}
          className="w-full resize-y rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">
          {i18n.personalNoteLabel}{" "}
          <span className="text-muted-foreground/60">{i18n.personalNoteOptional}</span>
        </label>
        <textarea
          value={answerPersonal}
          onChange={(e) => setAnswerPersonal(e.target.value)}
          placeholder={i18n.personalNotePlaceholder}
          rows={2}
          className="w-full resize-y rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
        />
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowMock((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {showMock ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
          {showMock ? i18n.hideMockOptions : i18n.showMockOptions}
        </button>
        {showMock && (
          <div className="mt-2">
            <MockOptionsEditor value={mockOptions} onChange={setMockOptions} i18n={i18n} />
            {showMock && !validMock && mockOptions.some((o) => o.optionText.trim()) && (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                {i18n.mockOptionsWarning}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={isPending || !question.trim()}
          className="flex items-center gap-1 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-80 disabled:opacity-40 transition-opacity"
        >
          <Check className="size-3" />
          {initial ? i18n.save : i18n.add}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="size-3" /> {i18n.cancel}
        </button>
      </div>
    </form>
  );
}
