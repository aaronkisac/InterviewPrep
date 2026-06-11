"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { LEVELS } from "@/lib/topics";
import { i18nLevels, i18nQuestions } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Topic {
  slug: string;
  name: string;
}

interface QuestionFiltersProps {
  topics?: Topic[];
  lang?: "en" | "tr";
}

export function QuestionFilters({ topics = [], lang = "en" }: QuestionFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentTopic = searchParams.get("topic") ?? "";

  function updateTopic(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (value) {
      params.set("topic", value);
    } else {
      params.delete("topic");
    }
    startTransition(() => {
      router.replace(`/questions?${params.toString()}`, { scroll: false });
    });
  }

  const currentLevels = (searchParams.get("levels") ?? "")
    .split(",")
    .map(Number)
    .filter((n) => n >= 1 && n <= 5) as (1 | 2 | 3 | 4 | 5)[];

  const currentQuery = searchParams.get("q") ?? "";

  function updateQuery(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    startTransition(() => {
      router.replace(`/questions?${params.toString()}`, { scroll: false });
    });
  }

  function toggleLevel(level: 1 | 2 | 3 | 4 | 5) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    const next = currentLevels.includes(level)
      ? currentLevels.filter((l) => l !== level)
      : [...currentLevels, level].sort();

    if (next.length > 0) {
      params.set("levels", next.join(","));
    } else {
      params.delete("levels");
    }
    startTransition(() => {
      router.replace(`/questions?${params.toString()}`, { scroll: false });
    });
  }

  const levelColour: Record<number, string> = {
    1: "data-[active=true]:bg-emerald-950 data-[active=true]:border-emerald-800 data-[active=true]:text-emerald-400",
    2: "data-[active=true]:bg-emerald-950 data-[active=true]:border-emerald-800 data-[active=true]:text-emerald-400",
    3: "data-[active=true]:bg-yellow-950 data-[active=true]:border-yellow-800 data-[active=true]:text-yellow-400",
    4: "data-[active=true]:bg-orange-950 data-[active=true]:border-orange-800 data-[active=true]:text-orange-400",
    5: "data-[active=true]:bg-red-950 data-[active=true]:border-red-800 data-[active=true]:text-red-400",
  };

  const dotColour: Record<number, string> = {
    1: "bg-emerald-500",
    2: "bg-emerald-500",
    3: "bg-yellow-400",
    4: "bg-orange-400",
    5: "bg-red-500",
  };

  const levelLabels = i18nLevels[lang];

  const topicAllLabel = i18nQuestions[lang].allTopics;
  const searchPlaceholder = i18nQuestions[lang].keywordPlaceholder;

  return (
    <div className={cn("space-y-3", isPending && "opacity-70")}>
      {/* Topic select */}
      {topics.length > 0 && (
        <select
          id="topic-filter"
          aria-label={i18nQuestions[lang].filterByTopic}
          value={currentTopic}
          onChange={(e) => updateTopic(e.currentTarget.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
        >
          <option value="">{topicAllLabel}</option>
          {topics.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.name}
            </option>
          ))}
        </select>
      )}

      {/* Search */}
      <div className="flex items-center gap-3">
        <input
          type="search"
          aria-label={searchPlaceholder}
          placeholder={searchPlaceholder}
          defaultValue={currentQuery}
          onChange={(e) => updateQuery(e.currentTarget.value)}
          className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring min-w-0"
        />
      </div>

      {/* Level pills */}
      <div className="flex flex-wrap items-center gap-2">
        {LEVELS.map((lvl) => {
          const active = currentLevels.includes(lvl.value);
          const dot = dotColour[lvl.value];
          return (
            <button
              key={lvl.value}
              type="button"
              aria-pressed={active}
              data-active={active}
              onClick={() => toggleLevel(lvl.value)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border px-3 py-1.5 text-[11px] font-medium transition",
                "border-border bg-background text-muted-foreground",
                "hover:border-border/80 hover:text-foreground",
                levelColour[lvl.value],
              )}
            >
              <span>{levelLabels[lvl.value] ?? lvl.label}</span>
              <span className="flex items-center gap-[3px]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "inline-block h-[4px] w-[4px] rounded-full transition-colors",
                      i < lvl.value ? dot : "bg-border",
                    )}
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
