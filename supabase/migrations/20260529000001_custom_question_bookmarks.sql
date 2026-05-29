-- Bookmarks for user-created (custom) questions.
-- Separate from public.bookmarks which references public.questions (system questions only).

create table if not exists public.custom_question_bookmarks (
  user_id             uuid not null references public.users(id) on delete cascade,
  custom_question_id  uuid not null references public.custom_questions(id) on delete cascade,
  created_at          timestamptz not null default now(),
  primary key (user_id, custom_question_id)
);

create index if not exists custom_question_bookmarks_user_id_idx
  on public.custom_question_bookmarks(user_id);

alter table public.custom_question_bookmarks enable row level security;

drop policy if exists "custom_question_bookmarks_deny_direct" on public.custom_question_bookmarks;
create policy "custom_question_bookmarks_deny_direct"
  on public.custom_question_bookmarks for all
  to anon, authenticated
  using (false)
  with check (false);
