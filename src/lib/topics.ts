// Pure constants — safe to import from Client Components.
// Keep this file free of server-only dependencies (no next/headers, no supabase/server).

import type { Language, LevelLabel, Topic } from "@/lib/supabase/types";

export const LANGUAGES: ReadonlyArray<{ value: Language; label: string }> = [
  { value: "en", label: "EN" },
  { value: "tr", label: "TR" },
];

export function parseLanguage(value: string | undefined): Language {
  return value === "tr" ? "tr" : "en";
}

export const TR_FALLBACK = "TR çevirisi yakında.";

export const TOPICS: readonly Topic[] = [
  "react",
  "typescript",
  "nextjs",
  "javascript",
  "redux",
  "html5",
  "css",
  "react-hooks",
];

export const TOPIC_LABELS: Record<Topic, string> = {
  react: "React",
  typescript: "TypeScript",
  nextjs: "Next.js",
  javascript: "JavaScript",
  redux: "Redux",
  html5: "HTML5",
  css: "CSS",
  "react-hooks": "React Hooks",
};

export const LEVELS: ReadonlyArray<{
  value: 1 | 2 | 3 | 4 | 5;
  label: LevelLabel;
}> = [
  { value: 1, label: "Entry" },
  { value: 2, label: "Junior" },
  { value: 3, label: "Mid" },
  { value: 4, label: "Senior" },
  { value: 5, label: "Expert" },
];
