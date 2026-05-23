// Hand-written types for the V1 tables.
// Regenerate from Supabase with `supabase gen types typescript` once the
// project is linked.

export type Topic = "react" | "typescript" | "nextjs" | "redux" | "javascript" | "html5" | "css" | "react-hooks" | "git" | "agile-scrum" | "websockets" | "unit-testing" | "design-patterns";
export type LevelLabel = "Entry" | "Junior" | "Mid" | "Senior" | "Expert";
export type QuestionStatus = "active" | "pending" | "rejected";
export type UserRole = "user" | "admin";

export type QuestionRow = {
  id: string;
  topic: Topic;
  level: 1 | 2 | 3 | 4 | 5;
  level_label: LevelLabel;
  question: string;
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
  is_correct: boolean;
  explanation: string;
};

export type TermRow = {
  id: string;
  slug: string;
  label: string;
  tooltip: string;
  definition: string;
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
