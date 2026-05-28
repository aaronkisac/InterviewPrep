-- user_topic_mastery: adaptive learning tracking for mock + flashcard
-- Separate from user_question_progress (which only covers system mock questions).
-- Uses text question_id (no FK) to support custom questions too.
create table if not exists public.user_topic_mastery (
  user_id     text        not null,
  question_id text        not null,  -- UUID as text; no FK so custom questions work
  topic       text        not null,  -- slug or "custom:slug"
  mode        text        not null check (mode in ('mock', 'flashcard')),
  mastered    boolean     not null default false,
  attempts    int         not null default 1,
  updated_at  timestamptz not null default now(),

  primary key (user_id, question_id, mode)
);

-- Fast lookup: all mastered IDs for a user in a topic+mode
create index if not exists utm_mastered_lookup_idx
  on public.user_topic_mastery (user_id, topic, mode)
  where mastered = true;

-- RLS: service role bypasses; deny direct client access
alter table public.user_topic_mastery enable row level security;

drop policy if exists "utm_deny_direct" on public.user_topic_mastery;
create policy "utm_deny_direct"
  on public.user_topic_mastery for all
  to anon, authenticated
  using (false)
  with check (false);
