"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Pencil, Check, X, ChevronRight, ChevronDown } from "lucide-react";

import {
  createCustomTopic,
  deleteCustomTopic,
  createCustomQuestion,
  updateCustomQuestion,
  deleteCustomQuestion,
  type CustomTopic,
  type CustomQuestion,
  type MockOption,
} from "@/lib/actions/custom-topics";
import { JsonImportUser } from "@/app/dashboard/_components/json-import-user";
import { LevelDots } from "@/components/level-dots";
import { LEVELS } from "@/lib/topics";
import { i18nMyTopics, i18nLevels } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Language } from "@/lib/supabase/types";

// ── Mock options editor ───────────────────────────────────────────────────────

function MockOptionsEditor({
  value,
  onChange,
  i18n,
}: {
  value: MockOption[];
  onChange: (opts: MockOption[]) => void;
  i18n: typeof i18nMyTopics.en;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">
        {i18n.mockOptionsLabel}{" "}
        <span className="font-normal">{i18n.mockOptionsHint}</span>
      </p>
      {value.map((opt, i) => (
        <div key={i} className="flex items-start gap-2">
          <input
            type="radio"
            name="mock-correct"
            checked={opt.isCorrect}
            onChange={() =>
              onChange(value.map((o, j) => ({ ...o, isCorrect: j === i })))
            }
            className="mt-2 shrink-0"
            title={i18n.markCorrect}
          />
          <div className="flex-1 space-y-1">
            <input
              value={opt.optionText}
              onChange={(e) =>
                onChange(value.map((o, j) => j === i ? { ...o, optionText: e.target.value } : o))
              }
              placeholder={i18n.mockOptionPlaceholder(String.fromCharCode(65 + i))}
              className="w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            />
            <input
              value={opt.explanation ?? ""}
              onChange={(e) =>
                onChange(value.map((o, j) => j === i ? { ...o, explanation: e.target.value } : o))
              }
              placeholder={i18n.explanationPlaceholder}
              className="w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs text-muted-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Add / Edit question form ──────────────────────────────────────────────────

function QuestionForm({
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
  i18n: typeof i18nMyTopics.en;
  lang: Language;
}) {
  const [question, setQuestion] = useState(initial?.question ?? "");
  const [answer, setAnswer] = useState(initial?.answer ?? "");
  const [level, setLevel] = useState(initial?.level ?? 1);
  const [answerPersonal, setAnswerPersonal] = useState(initial?.answer_personal ?? "");
  const [showMock, setShowMock] = useState(Boolean(initial?.mock_options));
  const [mockOptions, setMockOptions] = useState<MockOption[]>(
    initial?.mock_options ?? [
      { optionText: "", isCorrect: true, explanation: "" },
      { optionText: "", isCorrect: false, explanation: "" },
      { optionText: "", isCorrect: false, explanation: "" },
      { optionText: "", isCorrect: false, explanation: "" },
    ],
  );
  const [isPending, startTransition] = useTransition();

  const validMock =
    showMock &&
    mockOptions.every((o) => o.optionText.trim()) &&
    mockOptions.filter((o) => o.isCorrect).length === 1;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    const opts = showMock && validMock ? mockOptions : undefined;
    startTransition(async () => {
      if (initial) {
        const result = await updateCustomQuestion(
          initial.id, question, answer, level, answerPersonal, opts,
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
          topicId, question, answer, level, answerPersonal, opts,
        );
        if (result.ok && result.question) {
          onSave(result.question);
        }
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-lg border border-ring bg-background p-3">
      {/* Question */}
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

      {/* Level */}
      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">{i18n.levelLabel}</label>
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

      {/* Answer */}
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

      {/* Personal note */}
      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">
          {i18n.personalNoteLabel} <span className="text-muted-foreground/60">{i18n.personalNoteOptional}</span>
        </label>
        <textarea
          value={answerPersonal}
          onChange={(e) => setAnswerPersonal(e.target.value)}
          placeholder={i18n.personalNotePlaceholder}
          rows={2}
          className="w-full resize-y rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* Mock options toggle */}
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

      {/* Actions */}
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

// ── Single question row ───────────────────────────────────────────────────────

function QuestionRow({
  q,
  onUpdate,
  onDelete,
  i18n,
  lang,
}: {
  q: CustomQuestion;
  onUpdate: (updated: CustomQuestion) => void;
  onDelete: (id: string) => void;
  i18n: typeof i18nMyTopics.en;
  lang: Language;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  function remove() {
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
        onSave={(updated) => { onUpdate(updated); setEditing(false); }}
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
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">{q.answer}</p>
          ) : (
            <p className="text-sm italic text-muted-foreground">
              {i18n.noAnswer}{" "}
              <button type="button" onClick={() => setEditing(true)} className="underline hover:text-foreground">
                {i18n.addOne}
              </button>
            </p>
          )}
          {q.answer_personal && (
            <div className="rounded-md border border-violet-500/20 bg-violet-50/50 px-3 py-2 dark:bg-violet-950/20">
              <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-violet-600 dark:text-violet-400">
                {i18n.personalNoteHeading}
              </p>
              <p className="whitespace-pre-wrap text-xs text-foreground/80">{q.answer_personal}</p>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

// ── Single topic accordion ────────────────────────────────────────────────────

function TopicAccordion({
  topic,
  initialQuestions,
  onDeleteTopic,
  i18n,
  lang,
}: {
  topic: CustomTopic;
  initialQuestions: CustomQuestion[];
  onDeleteTopic: (id: string) => void;
  i18n: typeof i18nMyTopics.en;
  lang: Language;
}) {
  const [open, setOpen] = useState(false);
  const [questions, setQuestions] = useState<CustomQuestion[]>(initialQuestions);
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [isPending, startTransition] = useTransition();

  function removeTopic() {
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
                    setQuestions((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
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
              onSave={(q) => { setQuestions((prev) => [...prev, q]); setAddingQuestion(false); }}
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

// ── Main section (exported) ───────────────────────────────────────────────────

export function MyTopicsSection({
  initialTopics,
  initialQuestionsMap,
  lang,
}: {
  initialTopics: CustomTopic[];
  initialQuestionsMap: Record<string, CustomQuestion[]>;
  lang: Language;
}) {
  const i18n = i18nMyTopics[lang];
  const [topics, setTopics] = useState<CustomTopic[]>(initialTopics);
  const [questionsMap, setQuestionsMap] = useState<Record<string, CustomQuestion[]>>(initialQuestionsMap);
  const [newName, setNewName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function submitTopic(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setError("");
    startTransition(async () => {
      const result = await createCustomTopic(newName);
      if (!result.ok) { setError(result.error); return; }
      window.location.reload();
    });
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">{i18n.heading}</h2>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded-md border border-border px-3 py-1 text-xs font-medium hover:bg-accent transition-colors"
          >
            {i18n.newTopic}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={submitTopic} className="mb-3 flex items-center gap-2">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={i18n.topicNamePlaceholder}
            maxLength={80}
            className="h-8 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={isPending || !newName.trim()}
            className="h-8 rounded-md bg-foreground px-3 text-xs font-medium text-background hover:opacity-80 disabled:opacity-40 transition-opacity"
          >
            {isPending ? i18n.creating : i18n.create}
          </button>
          <button
            type="button"
            onClick={() => { setShowForm(false); setNewName(""); setError(""); }}
            className="h-8 rounded-md border border-border px-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {i18n.cancel}
          </button>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </form>
      )}

      {topics.length === 0 && !showForm ? (
        <div className="rounded-lg border border-dashed border-border px-5 py-6 text-center">
          <p className="text-sm text-muted-foreground">{i18n.noTopics}</p>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="mt-2 text-sm font-medium hover:underline"
          >
            {i18n.createFirst}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {topics.map((topic) => (
            <TopicAccordion
              key={topic.id}
              topic={topic}
              initialQuestions={questionsMap[topic.id] ?? []}
              onDeleteTopic={(id) => {
                setTopics((prev) => prev.filter((t) => t.id !== id));
                setQuestionsMap((prev) => {
                  const next = { ...prev };
                  delete next[id];
                  return next;
                });
              }}
              i18n={i18n}
              lang={lang}
            />
          ))}
        </div>
      )}
    </section>
  );
}
