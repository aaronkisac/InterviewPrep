// Pure constants, types, and parsers for mock interview mode.
// Keep this file free of server-only dependencies (no next/headers, no
// supabase/server) so Client Components can import it safely.

import type { Topic } from "@/lib/supabase/types";

export const SESSION_LENGTHS = [5, 10, 20] as const;
export type SessionLength = (typeof SESSION_LENGTHS)[number];

export type Level = 1 | 2 | 3 | 4 | 5;

export type MockOption = {
  id: string;
  text: string;
  textTr: string;
  isCorrect: boolean;
  explanation: string;
  explanationTr: string;
};

export type MockQuestion = {
  id: string;
  topic: Topic;
  level: Level;
  /** Localized display label (from DB or i18nLevels). */
  levelLabel: string;
  question: string;
  options: MockOption[];
};

/** Lightweight shape for the config page — just enough to count availability. */
export type MockReadyMeta = { topic: Topic; level: Level };

export type MockSessionConfig = {
  topics: Topic[];
  minLevel: Level;
  maxLevel: Level;
  /** Omit to return the full filtered pool (used for 80/20 pre-fetch). */
  length?: SessionLength;
};

/** Parses a comma-separated topic list (e.g. "react,nextjs") from a query param. */
export function parseTopicList(value: string | undefined): Topic[] {
  if (!value) return [];
  return value.split(",").map((s) => s.trim()).filter(Boolean) as Topic[];
}

export function parseLevelOr(
  value: string | undefined,
  fallback: Level,
): Level {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 5 ? (n as Level) : fallback;
}

export function parseSessionLength(value: string | undefined): SessionLength {
  const n = Number(value);
  return (SESSION_LENGTHS as readonly number[]).includes(n)
    ? (n as SessionLength)
    : 10;
}
