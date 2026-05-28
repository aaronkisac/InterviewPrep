"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";

import { cn } from "@/lib/utils";

type SystemTopic = { slug: string; name: string };
type CustomTopic = { slug: string; name: string };
type Level = { value: number; label: string };

export function NewQuestionForm({
  systemTopics,
  customTopics,
  levels,
  action,
}: {
  systemTopics: SystemTopic[];
  customTopics: CustomTopic[];
  levels: Level[];
  action: (formData: FormData) => Promise<void>;
}) {
  const [selectedTopic, setSelectedTopic] = useState("");
  const isCustomTopic = selectedTopic.startsWith("custom:");

  return (
    <form action={action} className="space-y-6">
      {/* Topic + Level row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="topic" className="text-sm font-medium">
            Topic
          </label>
          <select
            id="topic"
            name="topic"
            required
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="" disabled>
              Select a topic…
            </option>
            <optgroup label="System Topics">
              {systemTopics.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.name}
                </option>
              ))}
            </optgroup>
            {customTopics.length > 0 && (
              <optgroup label="My Topics (Private)">
                {customTopics.map((t) => (
                  <option key={`custom:${t.slug}`} value={`custom:${t.slug}`}>
                    {t.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="level" className="text-sm font-medium">
            Level
          </label>
          <select
            id="level"
            name="level"
            required
            defaultValue=""
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="" disabled>
              Select a level…
            </option>
            {levels.map((l) => (
              <option key={l.value} value={l.value}>
                {l.value} — {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Question text */}
      <div className="space-y-1.5">
        <label htmlFor="question" className="text-sm font-medium">
          Question
        </label>
        <textarea
          id="question"
          name="question"
          required
          rows={3}
          placeholder="e.g. What is the difference between useMemo and useCallback?"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Answer */}
      <div className="space-y-1.5">
        <label htmlFor="answer_general" className="text-sm font-medium">
          Answer
        </label>
        <textarea
          id="answer_general"
          name="answer_general"
          required
          rows={6}
          placeholder="Write a clear, concise answer. Markdown is supported on the detail page."
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Visibility */}
      <fieldset className="space-y-3 rounded-lg border border-border p-4">
        <legend className="px-1 text-sm font-medium">Visibility</legend>

        {/* Private — always available */}
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="radio"
            name="visibility"
            value="private"
            defaultChecked
            className="mt-0.5"
          />
          <span>
            <span className="text-sm font-medium">Private</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Only you can see this question. Goes live immediately.
            </span>
          </span>
        </label>

        {/* Submit for review — disabled for custom topics */}
        <label
          className={cn(
            "flex items-start gap-3",
            isCustomTopic ? "cursor-not-allowed opacity-40" : "cursor-pointer",
          )}
        >
          <input
            type="radio"
            name="visibility"
            value="public"
            disabled={isCustomTopic}
            className="mt-0.5"
          />
          <span>
            <span className="flex items-center gap-1.5 text-sm font-medium">
              Submit for review
              {isCustomTopic && (
                <span className="flex items-center gap-1 rounded border border-violet-500/40 px-1.5 py-0.5 text-[10px] text-violet-600 dark:text-violet-400">
                  <Lock className="size-2.5" /> private topic
                </span>
              )}
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {isCustomTopic
                ? "My Topics are always private and cannot be submitted for review."
                : "Propose this question for the shared bank. An admin will review and approve or reject it."}
            </span>
          </span>
        </label>
      </fieldset>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Submit question
        </button>
        <Link
          href="/questions"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
