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
import { cn } from "@/lib/utils";

type Tab = "mock" | "flashcard";

export type TopicEntry = {
  key: string;        // slug (system) or "custom:slug" (private)
  name: string;
  isPrivate?: boolean;
};

export function MockConfigTabs({
  mockMeta,
  mockTopics,
  flashcardTopics,
  topicLabels = {},
}: {
  mockMeta: MockReadyMeta[];
  /** Topics selectable in mock tab (have mock-ready questions) */
  mockTopics: TopicEntry[];
  /** Topics selectable in flashcard tab (have any questions) */
  flashcardTopics: TopicEntry[];
  topicLabels?: Record<string, string>;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("mock");

  // ── Shared controls ──────────────────────────────────────────────────────────
  const [minLevel, setMinLevel] = useState<Level>(1);
  const [maxLevel, setMaxLevel] = useState<Level>(5);
  const [length, setLength] = useState<SessionLength>(10);
  const [isStarting, setIsStarting] = useState(false);

  // ── Mock tab state ───────────────────────────────────────────────────────────
  const mockTopicKeys = useMemo(() => new Set(mockTopics.map((t) => t.key)), [mockTopics]);
  const [mockSelected, setMockSelected] = useState<Set<string>>(() => new Set(mockTopicKeys));

  const mockAvailable = useMemo(
    () =>
      mockMeta.filter(
        (m) => mockSelected.has(m.topic) && m.level >= minLevel && m.level <= maxLevel,
      ).length,
    [mockMeta, mockSelected, minLevel, maxLevel],
  );

  const mockAllSelected = useMemo(
    () => [...mockTopicKeys].every((k) => mockSelected.has(k)),
    [mockTopicKeys, mockSelected],
  );

  function toggleMock(key: string) {
    setMockSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  // ── Flashcard tab state ──────────────────────────────────────────────────────
  const flashcardTopicKeys = useMemo(
    () => new Set(flashcardTopics.map((t) => t.key)),
    [flashcardTopics],
  );
  const [flashSelected, setFlashSelected] = useState<Set<string>>(
    () => new Set(flashcardTopicKeys),
  );

  const flashAllSelected = useMemo(
    () => [...flashcardTopicKeys].every((k) => flashSelected.has(k)),
    [flashcardTopicKeys, flashSelected],
  );

  function toggleFlash(key: string) {
    setFlashSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  // ── Shared level handlers ────────────────────────────────────────────────────
  function handleMin(value: Level) {
    setMinLevel(value);
    if (value > maxLevel) setMaxLevel(value);
  }
  function handleMax(value: Level) {
    setMaxLevel(value);
    if (value < minLevel) setMinLevel(value);
  }

  // ── Start ────────────────────────────────────────────────────────────────────
  function start() {
    if (isStarting) return;
    setIsStarting(true);
    if (tab === "mock") {
      if (mockAvailable === 0 || mockSelected.size === 0) { setIsStarting(false); return; }
      const params = new URLSearchParams({
        topics: [...mockSelected].join(","),
        min: String(minLevel),
        max: String(maxLevel),
        len: String(length),
      });
      router.push(`/mock/session?${params.toString()}`);
    } else {
      if (flashSelected.size === 0) { setIsStarting(false); return; }
      const params = new URLSearchParams({
        topics: [...flashSelected].join(","),
        min: String(minLevel),
        max: String(maxLevel),
        len: String(length),
      });
      router.push(`/mock/flashcard?${params.toString()}`);
    }
  }

  // ── Derived ──────────────────────────────────────────────────────────────────
  const mockEffective = Math.min(mockAvailable, length);
  const canStartMock = mockAvailable > 0 && mockSelected.size > 0 && !isStarting;
  const canStartFlash = flashSelected.size > 0 && !isStarting;

  const isMock = tab === "mock";
  const currentTopics = isMock ? mockTopics : flashcardTopics;
  const currentSelected = isMock ? mockSelected : flashSelected;
  const currentAllSelected = isMock ? mockAllSelected : flashAllSelected;
  function toggleCurrent(key: string) { isMock ? toggleMock(key) : toggleFlash(key); }
  function toggleAll() {
    if (isMock) {
      setMockSelected(mockAllSelected ? new Set() : new Set(mockTopicKeys));
    } else {
      setFlashSelected(flashAllSelected ? new Set() : new Set(flashcardTopicKeys));
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* ── Tabs ── */}
      <div className="flex border-b border-border">
        {(["mock", "flashcard"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTab(t); setIsStarting(false); }}
            className={cn(
              "flex-1 px-4 py-3 text-sm font-medium transition",
              t === tab
                ? "border-b-2 border-foreground text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t === "mock" ? "Mock interview" : "Flashcard"}
          </button>
        ))}
      </div>

      <div className="space-y-6 p-6">
        {/* ── Topics ── */}
        <fieldset className="space-y-3">
          <div className="flex items-center justify-between">
            <legend className="text-sm font-medium">Topics</legend>
            <button
              type="button"
              onClick={toggleAll}
              disabled={currentTopics.length === 0}
              className="text-xs text-muted-foreground underline-offset-2 transition hover:text-foreground hover:underline disabled:cursor-not-allowed disabled:opacity-40"
            >
              {currentAllSelected ? "Deselect all" : "Select all"}
            </button>
          </div>

          {currentTopics.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {isMock
                ? "No mock-ready questions yet. Add 4 options to questions to enable mock mode."
                : "No topics with questions available."}
            </p>
          ) : (
            <>
              {/* Group: public topics */}
              <div className="flex flex-wrap gap-2">
                {currentTopics.filter((t) => !t.isPrivate).map((topic) => {
                  const checked = currentSelected.has(topic.key);
                  return (
                    <label
                      key={topic.key}
                      className={cn(
                        "inline-flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm transition hover:bg-accent",
                        checked && "border-foreground bg-accent",
                      )}
                    >
                      <input
                        type="checkbox"
                        className="size-4 accent-foreground"
                        checked={checked}
                        onChange={() => toggleCurrent(topic.key)}
                      />
                      <span>{topicLabels[topic.key] ?? topic.name}</span>
                    </label>
                  );
                })}
              </div>

              {/* Group: private (custom) topics */}
              {currentTopics.some((t) => t.isPrivate) && (
                <div className="flex flex-wrap gap-2 border-t border-dashed border-border pt-3">
                  {currentTopics.filter((t) => t.isPrivate).map((topic) => {
                    const checked = currentSelected.has(topic.key);
                    return (
                      <label
                        key={topic.key}
                        className={cn(
                          "inline-flex cursor-pointer items-center gap-2 rounded-md border border-violet-500/30 px-3 py-2 text-sm transition hover:bg-violet-50 dark:hover:bg-violet-950/20",
                          checked && "border-violet-500 bg-violet-50 dark:bg-violet-950/20",
                        )}
                      >
                        <input
                          type="checkbox"
                          className="size-4 accent-foreground"
                          checked={checked}
                          onChange={() => toggleCurrent(topic.key)}
                        />
                        <Lock className="size-3 shrink-0 text-violet-500" />
                        <span>{topicLabels[topic.key] ?? topic.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </fieldset>

        {/* ── Difficulty range ── */}
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
                {LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
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
                {LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        {/* ── Session length ── */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">
            {isMock ? "Session length" : "Card limit"}
          </legend>
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

        {/* ── Start ── */}
        <div className="border-t border-border pt-4">
          {isMock && (
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {mockAvailable === 0
                ? "No questions match this selection."
                : mockEffective < length
                  ? `Only ${mockAvailable} question${mockAvailable === 1 ? "" : "s"} available — session will use all ${mockEffective}.`
                  : `${mockEffective} questions ready for this session.`}
            </p>
          )}
          {!isMock && (
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {flashSelected.size === 0
                ? "Select at least one topic."
                : `${flashSelected.size} topic${flashSelected.size === 1 ? "" : "s"} selected — up to ${length} cards.`}
            </p>
          )}
          <button
            type="button"
            onClick={start}
            disabled={isMock ? !canStartMock : !canStartFlash}
            className="mt-4 w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isStarting
              ? "Starting…"
              : isMock
                ? "Start mock interview"
                : "Start flashcard session"}
          </button>
        </div>
      </div>
    </div>
  );
}
