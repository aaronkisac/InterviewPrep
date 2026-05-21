"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { LANGUAGES, LEVELS, TOPICS, TOPIC_LABELS } from "@/lib/topics";
import { cn } from "@/lib/utils";

export function QuestionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentTopic = searchParams.get("topic") ?? "";
  const currentLevel = searchParams.get("level") ?? "";
  const currentQuery = searchParams.get("q") ?? "";
  const currentLang = searchParams.get("lang") === "tr" ? "tr" : "en";

  function update(key: "topic" | "level" | "q" | "lang", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.replace(`/questions?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4",
        isPending && "opacity-80",
      )}
    >
      <fieldset
        className="mb-3 flex items-center gap-3"
        aria-label="Answer language"
      >
        <legend className="sr-only">Answer language</legend>
        <span className="text-xs font-medium text-muted-foreground">
          Language
        </span>
        <div className="inline-flex overflow-hidden rounded-md border border-input">
          {LANGUAGES.map((lang) => {
            const checked = currentLang === lang.value;
            return (
              <label
                key={lang.value}
                className={cn(
                  "cursor-pointer px-3 py-1 text-xs font-medium transition",
                  checked
                    ? "bg-foreground text-background"
                    : "bg-background text-foreground hover:bg-accent",
                )}
              >
                <input
                  type="radio"
                  name="lang"
                  value={lang.value}
                  checked={checked}
                  onChange={(event) => update("lang", event.currentTarget.value)}
                  className="sr-only"
                />
                {lang.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex flex-1 flex-col gap-1.5">
        <label
          htmlFor="question-search"
          className="text-xs font-medium text-muted-foreground"
        >
          Search
        </label>
        <input
          id="question-search"
          type="search"
          placeholder="Keyword in question…"
          defaultValue={currentQuery}
          onChange={(event) => update("q", event.currentTarget.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="flex flex-col gap-1.5 sm:w-44">
        <label
          htmlFor="topic-filter"
          className="text-xs font-medium text-muted-foreground"
        >
          Topic
        </label>
        <select
          id="topic-filter"
          value={currentTopic}
          onChange={(event) => update("topic", event.currentTarget.value)}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm shadow-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
        >
          <option value="">All topics</option>
          {TOPICS.map((topic) => (
            <option key={topic} value={topic}>
              {TOPIC_LABELS[topic]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5 sm:w-40">
        <label
          htmlFor="level-filter"
          className="text-xs font-medium text-muted-foreground"
        >
          Level
        </label>
        <select
          id="level-filter"
          value={currentLevel}
          onChange={(event) => update("level", event.currentTarget.value)}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm shadow-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
        >
          <option value="">All levels</option>
          {LEVELS.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
      </div>
      </div>
    </div>
  );
}
