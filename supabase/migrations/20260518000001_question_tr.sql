-- Add Turkish translation columns to questions table.
-- answer_general_tr defaults to '' (empty string) so the NOT NULL constraint
-- shape matches answer_general. answer_personal_tr stays nullable like its EN
-- counterpart.

alter table public.questions
  add column if not exists answer_general_tr text not null default '',
  add column if not exists answer_personal_tr text;

-- Allow ILIKE search on the Turkish column too if we later expose it.
create index if not exists idx_questions_answer_general_tr_search
  on public.questions using gin (to_tsvector('simple', answer_general_tr));
