-- Long-form detail content (markdown) for the question detail page.
-- Rendered with react-markdown + rehype-highlight on the server.
-- Falls back to answer_general when null/empty.

alter table public.questions
  add column if not exists detail_md text,
  add column if not exists detail_md_tr text;
