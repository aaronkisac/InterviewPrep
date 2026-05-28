"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Lock } from "lucide-react";

import {
  SESSION_LENGTHS,
  type Level,
  type MockReadyMeta,
  type SessionLength,
} from "@/lib/mock-shared";
import { LEVELS } from "@/lib/topics";
import type { CustomTopic } from "@/lib/actions/custom-topics";
import { cn } from "@/lib/utils";

export function MockConfig({
  meta,
  topicLabels = {},
  customTopics = [],
}: {
  meta: MockReadyMeta[];
  topicLabels?: Record<string, string>;
  customTopics?: CustomTopic[];
}) {
  const router = useRouter();

  const systemTopicsWithData = useMemo(
    () => new Set(meta.filter((m) => !m.topic.startsWith("custom:")).map((m) => m.topic)),
    [meta],
  );

  const customTopicsWithMock = useMemo(
    () => new Set(meta.filter((m) => m.topic.startsWith("custom:")).map((m) => m.topic)),
    [meta],
  );

  const allSelectableTopics = useMemo(
    () => new Set([...systemTopicsWithData, ...customTopicsWithMock]),
    [systemTopicsWithData, customTopicsWithMock],
  );

  const [topics, setTopics] = useState<Set<string>>(
    () => new Set([...allSelectableTopics]),
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
    () => [...allSelectableTopics].every((t) => topics.has(t)),
    [allSelectableTopics, topics],
  );

  function toggleTopic(topic: string) {
    setTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topic)) next.delete(topic);
      else next.add(topic);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) setTopics(new Set());
    else setTopics(new Set(allSelectableTopics));
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

  // suppress unused warning — customTopics kept in signature for future use
  void customTopics;

  return (
    <div className="space-y-6 rounded-lg border border-border bg-card p-6">
      <fieldset className="space-y-3">
        <div className="flex items-center justify-between">
          <legend className="text-sm font-medium">Topics</legend>
          <button
            type="button"
            onClick={toggleAll}
            disabled={allSelectableTopics.size === 0}
            className="text-xs text-muted-foreground underline-offset-2 transition hover:text-foreground hover:underline disabled:cursor-not-allowed disabled:opacity-40"
          >
            {allSelected ? "Deselect all" : "Select all"}
          </button>
        </div>

        {/* System topics */}
        <div className="flex flex-wrap gap-2">
          {[...systemTopicsWithData].sort().map((topic) => {
            const checked = topics.has(topic);
            return (
              <label
                key={topic}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm transition hover:bg-accent",
                  checked && "border-foreground bg-accent",
                )}
              >
                <input
                  type="checkbox"
                  className="size-4 accent-foreground"
                  checked={checked}
                  onChange={() => toggleTopic(topic)}
                />
                <span>{topicLabels[topic] ?? topic}</span>
              </label>
            );
          })}
        </div>

        {/* Custom topics with mock options */}
        {customTopicsWithMock.size > 0 && (
          <div className="flex flex-wrap gap-2 border-t border-dashed border-border pt-3">
            {[...customTopicsWithMock].sort().map((topicKey) => {
              const checked = topics.has(topicKey);
              return (
                <label
                  key={topicKey}
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-2 rounded-md border border-violet-500/30 px-3 py-2 text-sm transition hover:bg-violet-50 dark:hover:bg-violet-950/20",
                    checked && "border-violet-500 bg-violet-50 dark:bg-violet-950/20",
                  )}
                >
                  <input
                    type="checkbox"
                    className="size-4 accent-foreground"
                    checked={checked}
                    onChange={() => toggleTopic(topicKey)}
                  />
                  <Lock className="size-3 shrink-0 text-violet-500" />
                  <span>{topicLabels[topicKey] ?? topicKey.replace("custom:", "")}</span>
                </label>
              );
            })}
          </div>
        )}
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Difficulty range</legend>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="min-level" className="text-xs font-medium text-muted-foreground">
              From
            </label>
            <select
              id="min-level"
              value={minLevel}
              onChange={(e) => handleMin(Number(e.currentTarget.value) as Level)}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm shadow-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
            >
              {LEVELS.map((level) => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>
          <span className="pb-2 text-sm text-muted-foreground">to</span>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="max-level" className="text-xs font-medium text-muted-foreground">
              To
            </label>
            <select
              id="max-level"
              value={maxLevel}
              onChange={(e) => handleMax(Number(e.currentTarget.value) as Level)}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm shadow-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
            >
              {LEVELS.map((level) => (
                <option key={level.value} value={level.value}>{level.label}</option>
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
