// Hand-written types for the V1 tables.
// Regenerate from Supabase with `supabase gen types typescript` once the
// project is linked.

// Topic is now dynamic — driven by the system_topics table.
// BuiltinTopic lists the original 15 slugs for reference; new admin-created
// topics are plain strings.
export type BuiltinTopic = "react" | "typescript" | "nextjs" | "redux" | "javascript" | "html5" | "css" | "react-hooks" | "git" | "agile-scrum" | "websockets" | "unit-testing" | "design-patterns" | "software-architecture" | "api-design";
export type Topic = string;
export type LevelLabel = "Entry" | "Junior" | "Mid" | "Senior" | "Expert";
export type QuestionStatus = "active" | "pending" | "rejected";
export type UserRole = "user" | "admin" | "super_admin";

export type QuestionRow = {
  id: string;
  topic: Topic;
  level: 1 | 2 | 3 | 4 | 5;
  level_label: LevelLabel;
  question: string;
  question_tr: string;
  answer_general: string;
  answer_personal: string | null;
  answer_general_tr: string;
  answer_personal_tr: string | null;
  detail_md: string | null;
  detail_md_tr: string | null;
  is_seed: boolean;
  is_shared: boolean;
  status: QuestionStatus;
  created_by: string | null;
  created_at: string;
};

export type Language = "en" | "tr";

export type MockOptionRow = {
  id: string;
  question_id: string;
  option_text: string;
  option_text_tr: string;
  is_correct: boolean;
  explanation: string;
  explanation_tr: string;
};

export type TermRow = {
  id: string;
  slug: string;
  label: string;
  tooltip: string;
  tooltip_tr: string;
  definition: string;
  definition_tr: string;
  code_example: string | null;
  topic: Topic | null;
  related_slugs: string[];
};

export type UserRow = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  created_at: string;
};

export type MockSessionRow = {
  id: string;
  user_id: string;
  score: number;
  total: number;
  topics: Topic[];
  created_at: string;
};

export type UserQuestionProgressRow = {
  user_id: string;
  question_id: string;
  correct: boolean | null;
  answered_at: string;
};

export type BookmarkRow = {
  user_id: string;
  question_id: string;
  created_at: string;
};
