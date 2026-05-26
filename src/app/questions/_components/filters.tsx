"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { LANGUAGES, LEVELS } from "@/lib/topics";
import { cn } from "@/lib/utils";

export function QuestionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

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

  // colour per level value
  const levelColour: Record<number, string> = {
    1: "data-[active=true]:bg-emerald-950 data-[active=true]:border-emerald-800 data-[active=true]:text-emerald-400",
    2: "data-[active=true]:bg-emerald-950 data-[active=true]:border-emerald-800 data-[active=true]:text-emerald-400",
    3: "data-[active=true]:bg-yellow-950 data-[active=true]:border-yellow-800 data-[active=true]:text-yellow-400",
    4: "data-[active=true]:bg-orange-950 data-[active=true]:border-orange-800 data-[active=true]:text-orange-400",
    5: "data-[active=true]:bg-red-950 data-[active=true]:border-red-800 data-[active=true]:text-red-400",
  };

  return (
    <div className={cn("space-y-3", isPending && "opacity-70")}>
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
          return (
            <button
              key={lvl.value}
              type="button"
              data-active={active}
              onClick={() => toggleLevel(lvl.value)}
              className={cn(
                "h-7 rounded-full border px-3 text-[11px] font-medium transition",
                "border-border bg-background text-muted-foreground",
                "hover:border-border/80 hover:text-foreground",
                levelColour[lvl.value],
              )}
            >
              {lvl.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
