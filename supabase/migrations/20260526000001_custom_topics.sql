-- Custom topics & questions — private per-user notes
-- All access goes through service-role key in server actions (RLS denies direct access).

-- ============================================================================
-- custom_topics
-- ============================================================================
create table if not exists public.custom_topics (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  name       text not null check (char_length(trim(name)) > 0),
  slug       text not null check (char_length(trim(slug)) > 0),
  created_at timestamptz not null default now(),
  unique (user_id, slug)
);

create index if not exists custom_topics_user_id_idx
  on public.custom_topics(user_id);

alter table public.custom_topics enable row level security;

drop policy if exists "custom_topics_deny_direct" on public.custom_topics;
create policy "custom_topics_deny_direct"
  on public.custom_topics for all
  to anon, authenticated
  using (false)
  with check (false);

-- ============================================================================
-- custom_questions
-- ============================================================================
create table if not exists public.custom_questions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  topic_id   uuid not null references public.custom_topics(id) on delete cascade,
  question   text not null check (char_length(trim(question)) > 0),
  answer     text not null default '',
  position   int  not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists custom_questions_topic_id_idx
  on public.custom_questions(topic_id);

create index if not exists custom_questions_user_id_idx
  on public.custom_questions(user_id);

alter table public.custom_questions enable row level security;

drop policy if exists "custom_questions_deny_direct" on public.custom_questions;
create policy "custom_questions_deny_direct"
  on public.custom_questions for all
  to anon, authenticated
  using (false)
  with check (false);
