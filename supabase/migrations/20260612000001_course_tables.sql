-- Course experience (learning map): units → lessons → steps (JSONB).
-- See .docs/learning-map-spec.md. React is the pilot course.

-- ============================================================================
-- 1. units — ordered concept areas within a topic
-- ============================================================================
create table if not exists public.units (
  id          uuid primary key default gen_random_uuid(),
  topic_slug  text not null references public.system_topics(slug) on delete cascade,
  slug        text not null,
  title       text not null,
  title_tr    text not null,
  section     text not null check (section in ('foundations', 'core', 'advanced', 'interview')),
  position    int  not null,
  created_at  timestamptz not null default now(),
  unique (topic_slug, slug),
  unique (topic_slug, position)
);

-- ============================================================================
-- 2. lessons — ordered sessions within a unit; steps stored as validated JSONB
-- ============================================================================
create table if not exists public.lessons (
  id          uuid primary key default gen_random_uuid(),
  unit_id     uuid not null references public.units(id) on delete cascade,
  slug        text not null,
  title       text not null,
  title_tr    text not null,
  position    int  not null,
  steps       jsonb not null,
  created_at  timestamptz not null default now(),
  unique (unit_id, slug),
  unique (unit_id, position)
);

create index if not exists lessons_unit_idx on public.lessons (unit_id, position);

-- ============================================================================
-- 3. user_lesson_progress — completion only; lock state is always derived
-- ============================================================================
create table if not exists public.user_lesson_progress (
  user_id      text not null,
  lesson_id    uuid not null references public.lessons(id) on delete cascade,
  best_pct     int  not null default 0 check (best_pct between 0 and 100),
  attempts     int  not null default 0,
  completed_at timestamptz,
  updated_at   timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create index if not exists ulp_user_idx on public.user_lesson_progress (user_id, updated_at desc);

-- ============================================================================
-- 4. RLS — deny direct client access; server actions use the service role
-- ============================================================================
alter table public.units enable row level security;
alter table public.lessons enable row level security;
alter table public.user_lesson_progress enable row level security;

drop policy if exists "units_deny_direct" on public.units;
create policy "units_deny_direct"
  on public.units for all
  to anon, authenticated
  using (false)
  with check (false);

drop policy if exists "lessons_deny_direct" on public.lessons;
create policy "lessons_deny_direct"
  on public.lessons for all
  to anon, authenticated
  using (false)
  with check (false);

drop policy if exists "ulp_deny_direct" on public.user_lesson_progress;
create policy "ulp_deny_direct"
  on public.user_lesson_progress for all
  to anon, authenticated
  using (false)
  with check (false);

comment on table public.units is 'Course units (concept areas) per topic — see .docs/learning-map-spec.md';
comment on column public.lessons.steps is 'Ordered step array, validated by src/lib/course/step-schema.ts at seed time';
comment on column public.user_lesson_progress.completed_at is 'Set on first finish (finish-to-pass model); lock state is derived, never stored';
