import type { CustomQuestion, CustomTopic } from "@/lib/actions/custom-topics";
import type { i18nMyTopics } from "@/lib/i18n";
import type { Language } from "@/lib/supabase/types";

export type MyTopicsI18n = (typeof i18nMyTopics)[Language];

export type MyTopicsSectionProps = {
  initialTopics: CustomTopic[];
  initialQuestionsMap: Record<string, CustomQuestion[]>;
  lang: Language;
};
