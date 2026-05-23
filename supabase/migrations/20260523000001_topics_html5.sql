-- Extend allowed question/glossary topics to include html5.
-- (javascript and redux were added in 20260522000001 — this migration
--  is safe to run even if that one was not yet applied, because we
--  drop and recreate the constraint with all topics together.)

alter table public.questions
  drop constraint if exists questions_topic_check;

alter table public.questions
  add constraint questions_topic_check
  check (topic in ('react', 'typescript', 'nextjs', 'javascript', 'redux', 'html5'));

alter table public.terms
  drop constraint if exists terms_topic_check;

alter table public.terms
  add constraint terms_topic_check
  check (topic in ('react', 'typescript', 'nextjs', 'javascript', 'redux', 'html5'));
