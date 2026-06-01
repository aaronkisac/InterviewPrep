import { i18nCommon } from "@/lib/i18n";
import type { Language } from "@/lib/supabase/types";

export type Grade = {
  label: string;
  chipClass: string;
  textClass: string;
  barClass: string;
};

export function getGrade(pct: number, lang: Language): Grade {
  const common = i18nCommon[lang];
  if (pct === 100) {
    return {
      label: common.perfect,
      chipClass:
        "border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
      textClass: "text-emerald-600 dark:text-emerald-400",
      barClass: "bg-emerald-500",
    };
  }
  if (pct >= 80) {
    return {
      label: common.strong,
      chipClass:
        "border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
      textClass: "text-emerald-600 dark:text-emerald-400",
      barClass: "bg-emerald-500",
    };
  }
  if (pct >= 60) {
    return {
      label: common.decent,
      chipClass:
        "border-amber-500/40 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
      textClass: "text-amber-600 dark:text-amber-400",
      barClass: "bg-amber-500",
    };
  }
  return {
    label: common.needsWork,
    chipClass:
      "border-rose-500/40 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
    textClass: "text-rose-600 dark:text-rose-400",
    barClass: "bg-rose-500",
  };
}
