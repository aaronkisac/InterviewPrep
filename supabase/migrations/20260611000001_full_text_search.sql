-- Full-text search over questions.
-- Generated tsvector columns (auto-maintained by Postgres) + GIN indexes.
-- EN vector: question + answer_general + detail_md
-- TR vector: question_tr + answer_general_tr + detail_md_tr ('simple' config —
-- Postgres has no Turkish stemmer built in everywhere; 'simple' still gives
-- word-level matching without stemming surprises).

alter table public.questions
  add column if not exists search_vector tsvector
    generated always as (
      to_tsvector(
        'english',
        coalesce(question, '') || ' ' ||
        coalesce(answer_general, '') || ' ' ||
        coalesce(detail_md, '')
      )
    ) stored;

alter table public.questions
  add column if not exists search_vector_tr tsvector
    generated always as (
      to_tsvector(
        'simple',
        coalesce(question_tr, '') || ' ' ||
        coalesce(answer_general_tr, '') || ' ' ||
        coalesce(detail_md_tr, '')
      )
    ) stored;

create index if not exists questions_search_vector_idx
  on public.questions using gin (search_vector);

create index if not exists questions_search_vector_tr_idx
  on public.questions using gin (search_vector_tr);

comment on column public.questions.search_vector is
  'Generated FTS vector (english) over question + answer_general + detail_md';
comment on column public.questions.search_vector_tr is
  'Generated FTS vector (simple) over question_tr + answer_general_tr + detail_md_tr';
