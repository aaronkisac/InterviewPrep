-- User tracking tables: mock session history, question progress, bookmarks
-- All writes go through the service-role key in server actions.
-- RLS is enabled but service role bypasses it; no anon/authenticated direct access.

-- ============================================================================
-- mock_sessions — stores completed mock interview results
-- ============================================================================
create table if not exists public.mock_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  score      int  not null check (score >= 0),
  total      int  not null check (total > 0),
  topics     text[] not null,
  created_at timestamptz not null default now()
);

create index if not exists mock_sessions_user_id_idx
  on public.mock_sessions(user_id);

alter table public.mock_sessions enable row level security;

-- Service role bypasses RLS; deny direct anon/authenticated access
drop policy if exists "mock_sessions_deny_direct" on public.mock_sessions;
create policy "mock_sessions_deny_direct"
  on public.mock_sessions for all
  to anon, authenticated
  using (false)
  with check (false);

-- ============================================================================
-- user_question_progress — tracks seen / correct / incorrect per question
-- ============================================================================
create table if not exists public.user_question_progress (
  user_id     uuid not null references public.users(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  correct     boolean,                             -- null = seen only
  answered_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create index if not exists uqp_user_id_idx
  on public.user_question_progress(user_id);

alter table public.user_question_progress enable row level security;

drop policy if exists "uqp_deny_direct" on public.user_question_progress;
create policy "uqp_deny_direct"
  on public.user_question_progress for all
  to anon, authenticated
  using (false)
  with check (false);

-- ============================================================================
-- bookmarks — saved questions per user
-- ============================================================================
create table if not exists public.bookmarks (
  user_id     uuid not null references public.users(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, question_id)
);

create index if not exists bookmarks_user_id_idx
  on public.bookmarks(user_id);

alter table public.bookmarks enable row level security;

drop policy if exists "bookmarks_deny_direct" on public.bookmarks;
create policy "bookmarks_deny_direct"
  on public.bookmarks for all
  to anon, authenticated
  using (false)
  with check (false);
