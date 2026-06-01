"use client";

import { useState, useTransition } from "react";

import { createCustomTopic } from "@/lib/actions/custom-topics";
import { i18nMyTopics } from "@/lib/i18n";

import { TopicAccordion } from "./topic-accordion";
import type { MyTopicsSectionProps } from "./types";

export function MyTopicsSection({
  initialTopics,
  initialQuestionsMap,
  lang,
}: MyTopicsSectionProps): React.ReactElement {
  const i18n = i18nMyTopics[lang];
  const [topics, setTopics] = useState(initialTopics);
  const [questionsMap, setQuestionsMap] = useState(initialQuestionsMap);
  const [newName, setNewName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function submitTopic(e: React.FormEvent): void {
    e.preventDefault();
    if (!newName.trim()) return;
    setError("");
    startTransition(async () => {
      const result = await createCustomTopic(newName);
      if (!result.ok) {
        setError(result.error);
        return;
      }
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
            onClick={() => {
              setShowForm(false);
              setNewName("");
              setError("");
            }}
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
