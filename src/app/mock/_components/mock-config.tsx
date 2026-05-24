"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  SESSION_LENGTHS,
  type Level,
  type MockReadyMeta,
  type SessionLength,
} from "@/lib/mock-shared";
import type { Topic } from "@/lib/supabase/types";
import { LEVELS, TOPICS, TOPIC_LABELS } from "@/lib/topics";
import { cn } from "@/lib/utils";

export function MockConfig({ meta }: { meta: MockReadyMeta[] }) {
  const router = useRouter();

  const topicsWithData = useMemo(
    () => new Set(meta.map((m) => m.topic)),
    [meta],
  );

  const [topics, setTopics] = useState<Set<Topic>>(
    () => new Set(TOPICS.filter((t) => topicsWithData.has(t))),
  );
  const [minLevel, setMinLevel] = useState<Level>(1);
  const [maxLevel, setMaxLevel] = useState<Level>(5);
  const [length, setLength] = useState<SessionLength>(10);
  const [isStarting, setIsStarting] = useState(false);

  const available = useMemo(
    () =>
      meta.filter(
        (m) => topics.has(m.topic) && m.level >= minLevel && m.level <= maxLevel,
      ).length,
    [meta, topics, minLevel, maxLevel],
  );

  const allSelected = useMemo(
    () => [...topicsWithData].every((t) => topics.has(t)),
    [topicsWithData, topics],
  );

  function toggleTopic(topic: Topic) {
    setTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topic)) next.delete(topic);
      else next.add(topic);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) {
      setTopics(new Set());
    } else {
      setTopics(new Set(topicsWithData));
    }
  }

  function handleMin(value: Level) {
    setMinLevel(value);
    if (value > maxLevel) setMaxLevel(value);
  }

  function handleMax(value: Level) {
    setMaxLevel(value);
    if (value < minLevel) setMinLevel(value);
  }

  function start() {
    if (available === 0 || topics.size === 0) return;
    setIsStarting(true);
    const params = new URLSearchParams({
      topics: [...topics].join(","),
      min: String(minLevel),
      max: String(maxLevel),
      len: String(length),
    });
    router.push(`/mock/session?${params.toString()}`);
  }

  const effectiveLength = Math.min(available, length);
  const canStart = available > 0 && topics.size > 0 && !isStarting;

  return (
    <div className="space-y-6 rounded-lg border border-border bg-card p-6">
      <fieldset className="space-y-3">
        <div className="flex items-center justify-between">
          <legend className="text-sm font-medium">Topics</legend>
          <button
            type="button"
            onClick={toggleAll}
            disabled={topicsWithData.size === 0}
            className="text-xs text-muted-foreground underline-offset-2 transition hover:text-foreground hover:underline disabled:cursor-not-allowed disabled:opacity-40"
          >
            {allSelected ? "Deselect all" : "Select all"}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((topic) => {
            const hasData = topicsWithData.has(topic);
            const checked = topics.has(topic);
            return (
              <label
                key={topic}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition",
                  hasData
                    ? "cursor-pointer border-input hover:bg-accent"
                    : "cursor-not-allowed border-dashed border-border text-muted-foreground",
                  checked && hasData && "border-foreground bg-accent",
                )}
              >
                <input
                  type="checkbox"
                  className="size-4 accent-foreground"
                  checked={checked}
                  disabled={!hasData}
                  onChange={() => toggleTopic(topic)}
                />
                <span>{TOPIC_LABELS[topic]}</span>
                {!hasData && (
                  <span className="text-xs">(no questions yet)</span>
                )}
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Difficulty range</legend>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="min-level"
              className="text-xs font-medium text-muted-foreground"
            >
              From
            </label>
            <select
              id="min-level"
              value={minLevel}
              onChange={(e) => handleMin(Number(e.currentTarget.value) as Level)}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm shadow-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
            >
              {LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
          <span className="pb-2 text-sm text-muted-foreground">to</span>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="max-level"
              className="text-xs font-medium text-muted-foreground"
            >
              To
            </label>
            <select
              id="max-level"
              value={maxLevel}
              onChange={(e) => handleMax(Number(e.currentTarget.value) as Level)}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm shadow-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
            >
              {LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Session length</legend>
        <div className="inline-flex overflow-hidden rounded-md border border-input">
          {SESSION_LENGTHS.map((len) => {
            const checked = length === len;
            return (
              <label
                key={len}
                className={cn(
                  "cursor-pointer px-4 py-1.5 text-sm font-medium transition",
                  checked
                    ? "bg-foreground text-background"
                    : "bg-background text-foreground hover:bg-accent",
                )}
              >
                <input
                  type="radio"
                  name="length"
                  value={len}
                  checked={checked}
                  onChange={() => setLength(len)}
                  className="sr-only"
                />
                {len}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="border-t border-border pt-4">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {available === 0
            ? "No questions match this selection."
            : effectiveLength < length
              ? `Only ${available} question${available === 1 ? "" : "s"} available — this session will use all ${effectiveLength}.`
              : `${effectiveLength} questions ready for this session.`}
        </p>
        <button
          type="button"
          onClick={start}
          disabled={!canStart}
          className="mt-4 w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isStarting ? "Starting…" : "Start mock interview"}
        </button>
      </div>
    </div>
  );
}
