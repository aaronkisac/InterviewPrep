-- Add Turkish translation of the question text itself.
-- Used in mock session to show the question in the user's preferred language.

alter table public.questions
  add column if not exists question_tr text not null default '';

comment on column public.questions.question_tr is 'Turkish translation of the question text';
