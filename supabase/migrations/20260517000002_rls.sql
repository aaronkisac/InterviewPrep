-- Row Level Security policies
-- Reads use the anon/authenticated role via the public JS client.
-- Writes use the service-role key from server actions / API routes.

-- ============================================================================
-- users
-- Read: any authenticated user can read their own row.
-- Write: handled exclusively via service role (NextAuth adapter on the server).
-- ============================================================================
alter table public.users enable row level security;

drop policy if exists "users_read_self" on public.users;
create policy "users_read_self"
  on public.users for select
  to authenticated
  using (auth.uid() = id);

-- ============================================================================
-- questions
-- Read:
--   - anyone (anon + authenticated) can read shared, active questions
--   - authenticated users can read their own private questions, regardless of status
-- Write: authenticated users can insert their own questions (defaults enforce status/is_shared)
-- Update/delete: only the owner can mutate their own non-seed rows
-- ============================================================================
alter table public.questions enable row level security;

drop policy if exists "questions_read_shared" on public.questions;
create policy "questions_read_shared"
  on public.questions for select
  to anon, authenticated
  using (is_shared = true and status = 'active');

drop policy if exists "questions_read_own" on public.questions;
create policy "questions_read_own"
  on public.questions for select
  to authenticated
  using (created_by = auth.uid());

drop policy if exists "questions_insert_own" on public.questions;
create policy "questions_insert_own"
  on public.questions for insert
  to authenticated
  with check (created_by = auth.uid() and is_seed = false);

drop policy if exists "questions_update_own" on public.questions;
create policy "questions_update_own"
  on public.questions for update
  to authenticated
  using (created_by = auth.uid() and is_seed = false)
  with check (created_by = auth.uid() and is_seed = false);

drop policy if exists "questions_delete_own" on public.questions;
create policy "questions_delete_own"
  on public.questions for delete
  to authenticated
  using (created_by = auth.uid() and is_seed = false);

-- ============================================================================
-- mock_options
-- Read: anyone if the parent question is publicly readable.
-- Write: service role only (admin curates options in V1).
-- ============================================================================
alter table public.mock_options enable row level security;

drop policy if exists "mock_options_read" on public.mock_options;
create policy "mock_options_read"
  on public.mock_options for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.questions q
      where q.id = mock_options.question_id
        and (
          (q.is_shared = true and q.status = 'active')
          or q.created_by = auth.uid()
        )
    )
  );

-- ============================================================================
-- terms
-- Read: public to anyone.
-- Write: service role only.
-- ============================================================================
alter table public.terms enable row level security;

drop policy if exists "terms_read_all" on public.terms;
create policy "terms_read_all"
  on public.terms for select
  to anon, authenticated
  using (true);
