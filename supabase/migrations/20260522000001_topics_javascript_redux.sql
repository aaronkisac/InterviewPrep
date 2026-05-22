-- Extend allowed question/glossary topics for JavaScript and Redux seed batches.

alter table public.questions
  drop constraint questions_topic_check;

alter table public.questions
  add constraint questions_topic_check
  check (topic in ('react', 'typescript', 'nextjs', 'javascript', 'redux'));

alter table public.terms
  drop constraint terms_topic_check;

alter table public.terms
  add constraint terms_topic_check
  check (topic in ('react', 'typescript', 'nextjs', 'javascript', 'redux'));
