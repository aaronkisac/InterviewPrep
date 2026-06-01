import { i18nLevels } from "@/lib/i18n";
import type { Language } from "@/lib/supabase/types";

/** English level label stored in the DB (level_label column). */
export function getLevelLabelEn(level: number): string {
  return i18nLevels.en[level as keyof typeof i18nLevels.en] ?? "Entry";
}

export function getLevelLabel(level: number, lang: Language): string {
  return i18nLevels[lang][level as keyof typeof i18nLevels.en] ?? getLevelLabelEn(level);
}
