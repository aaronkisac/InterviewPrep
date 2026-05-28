-- Upgrade custom_questions: add level, answer_personal, mock_options
-- These fields mirror the system questions schema so users can enter
-- structured data (level, personal notes, mock options) from the dashboard.

alter table public.custom_questions
  add column if not exists level          smallint not null default 1
    check (level between 1 and 5),
  add column if not exists answer_personal text,
  add column if not exists mock_options   jsonb;

comment on column public.custom_questions.level           is '1=Entry 2=Junior 3=Mid 4=Senior 5=Expert';
comment on column public.custom_questions.answer_personal is 'Personal note / experience (private)';
comment on column public.custom_questions.mock_options    is 'Array of {optionText,isCorrect,explanation} — exactly 4 with 1 correct enables standard mock';
