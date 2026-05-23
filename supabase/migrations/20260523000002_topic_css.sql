-- Add css to allowed topics for questions and terms tables.

alter table public.questions
  drop constraint if exists questions_topic_check;

alter table public.questions
  add constraint questions_topic_check
  check (topic in ('react', 'typescript', 'nextjs', 'javascript', 'redux', 'html5', 'css'));

alter table public.terms
  drop constraint if exists terms_topic_check;

alter table public.terms
  add constraint terms_topic_check
  check (topic in ('react', 'typescript', 'nextjs', 'javascript', 'redux', 'html5', 'css'));
