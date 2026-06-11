"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Lock } from "lucide-react";

import {
  SESSION_LENGTHS,
  TIMER_OPTIONS,
  type Level,
  type MockReadyMeta,
  type SessionLength,
  type TimerSeconds,
} from "@/lib/mock-shared";
import { LEVELS } from "@/lib/topics";
import { i18nMock, i18nLevels } from "@/lib/i18n";
import type { Language } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type Tab = "mock" | "flashcard";

export type TopicEntry = {
  key: string;        // slug (system) or "custom:slug" (private)
  name: string;
  isPrivate?: boolean;
  total?: number;     // total question count (for flashcard tab display)
};

export type TopicStats = {
  mock: Record<string, number>;      // mastered count per topic key
  flashcard: Record<string, number>; // mastered count per topic key
};

export function MockConfigTabs({
  mockMeta,
  mockTopics,
  flashcardTopics,
  topicLabels = {},
  topicStats,
  lang = "en",
}: {
  mockMeta: MockReadyMeta[];
  mockTopics: TopicEntry[];
  flashcardTopics: TopicEntry[];
  topicLabels?: Record<string, string>;
  topicStats?: TopicStats;
  lang?: Language;
}) {
  const i18n = i18nMock[lang];
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("mock");

  // ── Shared controls ──────────────────────────────────────────────────────────
  const [minLevel, setMinLevel] = useState<Level>(1);
  const [maxLevel, setMaxLevel] = useState<Level>(5);
  const [length, setLength] = useState<SessionLength>(10);
  const [timer, setTimer] = useState<TimerSeconds>(0);
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
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
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
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
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
      if (timer > 0) params.set("t", String(timer));
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

  // ── Topic totals (for "mastered/total" chip display) ─────────────────────────
  const mockTotals = useMemo(() => {
    const map: Record<string, number> = {};
    for (const m of mockMeta) map[m.topic] = (map[m.topic] ?? 0) + 1;
    return map;
  }, [mockMeta]);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const mockEffective = Math.min(mockAvailable, length);
  const canStartMock = mockAvailable > 0 && mockSelected.size > 0 && !isStarting;
  const canStartFlash = flashSelected.size > 0 && !isStarting;

  const isMock = tab === "mock";
  const currentTopics = isMock ? mockTopics : flashcardTopics;
  const currentSelected = isMock ? mockSelected : flashSelected;
  const currentAllSelected = isMock ? mockAllSelected : flashAllSelected;
  function toggleCurrent(key: string) {
    if (isMock) {
      toggleMock(key);
    } else {
      toggleFlash(key);
    }
  }
  function toggleAll() {
    if (isMock) {
      setMockSelected(mockAllSelected ? new Set() : new Set(mockTopicKeys));
    } else {
      setFlashSelected(flashAllSelected ? new Set() : new Set(flashcardTopicKeys));
    }
  }

  // ── Stat badge: "12/22" next to topic name ───────────────────────────────────
  function StatBadge({ topicKey }: { topicKey: string }) {
    const mastered = isMock
      ? (topicStats?.mock[topicKey] ?? 0)
      : (topicStats?.flashcard[topicKey] ?? 0);
    const total = isMock
      ? (mockTotals[topicKey] ?? 0)
      : (currentTopics.find((t) => t.key === topicKey)?.total ?? 0);
    if (total === 0) return null;
    return (
      <span className="ml-0.5 text-[10px] tabular-nums text-muted-foreground/70">
        {mastered}/{total}
      </span>
    );
  }

  function levelLabel(value: number): string {
    return i18nLevels[lang][value as keyof typeof i18nLevels.en] ?? String(value);
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
            {t === "mock" ? i18n.tabMock : i18n.tabFlashcard}
          </button>
        ))}
      </div>

      <div className="space-y-6 p-6">
        {/* ── Topics ── */}
        <fieldset className="space-y-3">
          <div className="flex items-center justify-between">
            <legend className="text-sm font-medium">{i18n.topics}</legend>
            <button
              type="button"
              onClick={toggleAll}
              disabled={currentTopics.length === 0}
              className="text-xs text-muted-foreground underline-offset-2 transition hover:text-foreground hover:underline disabled:cursor-not-allowed disabled:opacity-40"
            >
              {currentAllSelected ? i18n.deselectAll : i18n.selectAll}
            </button>
          </div>

          {currentTopics.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {isMock ? i18n.noMockReady : i18n.noTopics}
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
                      <StatBadge topicKey={topic.key} />
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
                        <StatBadge topicKey={topic.key} />
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
          <legend className="text-sm font-medium">{i18n.difficultyRange}</legend>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="min-level" className="text-xs font-medium text-muted-foreground">
                {i18n.from}
              </label>
              <select
                id="min-level"
                value={minLevel}
                onChange={(e) => handleMin(Number(e.currentTarget.value) as Level)}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm shadow-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
              >
                {LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>{levelLabel(l.value)}</option>
                ))}
              </select>
            </div>
            <span className="pb-2 text-sm text-muted-foreground">
              {i18n.rangeArrow}
            </span>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="max-level" className="text-xs font-medium text-muted-foreground">
                {i18n.to}
              </label>
              <select
                id="max-level"
                value={maxLevel}
                onChange={(e) => handleMax(Number(e.currentTarget.value) as Level)}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm shadow-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
              >
                {LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>{levelLabel(l.value)}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        {/* ── Session length ── */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">
            {isMock ? i18n.sessionLength : i18n.cardLimit}
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

        {/* ── Timer (mock only) ── */}
        {isMock && (
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">{i18n.timerPerQuestion}</legend>
            <div className="inline-flex overflow-hidden rounded-md border border-input">
              {TIMER_OPTIONS.map((t) => {
                const checked = timer === t;
                return (
                  <label
                    key={t}
                    className={cn(
                      "cursor-pointer px-4 py-1.5 text-sm font-medium transition",
                      checked
                        ? "bg-foreground text-background"
                        : "bg-background text-foreground hover:bg-accent",
                    )}
                  >
                    <input
                      type="radio"
                      name="timer"
                      value={t}
                      checked={checked}
                      onChange={() => setTimer(t)}
                      className="sr-only"
                    />
                    {t === 0 ? i18n.timerOff : `${t}s`}
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}

        {/* ── Start ── */}
        <div className="border-t border-border pt-4">
          {isMock && (
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {mockAvailable === 0
                ? i18n.noMatch
                : i18n.available(mockAvailable, mockEffective)}
            </p>
          )}
          {!isMock && (
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {flashSelected.size === 0
                ? i18n.selectAtLeastOne
                : i18n.flashSelected(flashSelected.size, length)}
            </p>
          )}
          <button
            type="button"
            onClick={start}
            disabled={isMock ? !canStartMock : !canStartFlash}
            className="mt-4 w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isStarting
              ? i18n.starting
              : isMock
                ? i18n.startMock
                : i18n.startFlashcard}
          </button>
        </div>
      </div>
    </div>
  );
}
