"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { LANGUAGES, LEVELS } from "@/lib/topics";
import { cn } from "@/lib/utils";

interface Topic {
  slug: string;
  name: string;
}

interface QuestionFiltersProps {
  topics?: Topic[];
}

export function QuestionFilters({ topics = [] }: QuestionFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentTopic = searchParams.get("topic") ?? "";

  function updateTopic(value: string) {
    const params = new URLSearchParams(searchParams.toString());
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
  const currentLang = searchParams.get("lang") === "tr" ? "tr" : "en";

  function update(key: "q" | "lang", value: string) {
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

  function toggleLevel(level: 1 | 2 | 3 | 4 | 5) {
    const params = new URLSearchParams(searchParams.toString());
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

  // colour per level value — button active state
  const levelColour: Record<number, string> = {
    1: "data-[active=true]:bg-emerald-950 data-[active=true]:border-emerald-800 data-[active=true]:text-emerald-400",
    2: "data-[active=true]:bg-emerald-950 data-[active=true]:border-emerald-800 data-[active=true]:text-emerald-400",
    3: "data-[active=true]:bg-yellow-950 data-[active=true]:border-yellow-800 data-[active=true]:text-yellow-400",
    4: "data-[active=true]:bg-orange-950 data-[active=true]:border-orange-800 data-[active=true]:text-orange-400",
    5: "data-[active=true]:bg-red-950 data-[active=true]:border-red-800 data-[active=true]:text-red-400",
  };

  // dot colour per level (always visible, not dependent on active state)
  const dotColour: Record<number, string> = {
    1: "bg-emerald-500",
    2: "bg-emerald-500",
    3: "bg-yellow-400",
    4: "bg-orange-400",
    5: "bg-red-500",
  };

  return (
    <div className={cn("space-y-3", isPending && "opacity-70")}>
      {/* Topic select — used by E2E tests via #topic-filter */}
      {topics.length > 0 && (
        <select
          id="topic-filter"
          value={currentTopic}
          onChange={(e) => updateTopic(e.currentTarget.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
        >
          <option value="">All topics</option>
          {topics.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.name}
            </option>
          ))}
        </select>
      )}

      {/* Row 1 — search + lang */}
      <div className="flex items-center gap-3">
        <input
          type="search"
          placeholder="Keyword in question…"
          defaultValue={currentQuery}
          onChange={(e) => update("q", e.currentTarget.value)}
          className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring min-w-0"
        />

        {/* Language toggle */}
        <fieldset aria-label="Answer language">
          <legend className="sr-only">Answer language</legend>
          <div className="inline-flex overflow-hidden rounded-md border border-input">
            {LANGUAGES.map((lang) => {
              const checked = currentLang === lang.value;
              return (
                <label
                  key={lang.value}
                  className={cn(
                    "cursor-pointer px-3 py-1.5 text-xs font-medium transition",
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
                    onChange={(e) => update("lang", e.currentTarget.value)}
                    className="sr-only"
                  />
                  {lang.label}
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>

      {/* Row 2 — level pills */}
      <div className="flex flex-wrap items-center gap-2">
        {LEVELS.map((lvl) => {
          const active = currentLevels.includes(lvl.value);
          const dot = dotColour[lvl.value];
          return (
            <button
              key={lvl.value}
              type="button"
              data-active={active}
              onClick={() => toggleLevel(lvl.value)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border px-3 py-1.5 text-[11px] font-medium transition",
                "border-border bg-background text-muted-foreground",
                "hover:border-border/80 hover:text-foreground",
                levelColour[lvl.value],
              )}
            >
              <span>{lvl.label}</span>
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
