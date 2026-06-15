-- ============================================================================
-- RLS: replace the `deny_direct` locks on user-owned tables with owner
-- policies, so the database enforces per-row ownership as a backstop to the
-- application-layer .eq("user_id") filters.
--
-- Auth is NextAuth (not Supabase Auth), so there is no Supabase session cookie.
-- The app now mints a short-lived, Supabase-compatible JWT per request
-- (see src/lib/supabase/server.ts) whose `sub` is the signed-in user id, so
-- auth.uid() resolves correctly under the authenticated role.
--
-- Note on types: user_id is `uuid` on most tables, but `text` on
-- user_topic_mastery and user_lesson_progress — those compare against
-- auth.uid()::text. The service-role admin client bypasses RLS, so existing
-- server-side paths that use it keep working unchanged.
-- ============================================================================

-- mock_sessions (user_id uuid) -----------------------------------------------
drop policy if exists "mock_sessions_deny_direct" on public.mock_sessions;
create policy "mock_sessions_owner"
  on public.mock_sessions for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- user_question_progress (user_id uuid) --------------------------------------
drop policy if exists "uqp_deny_direct" on public.user_question_progress;
create policy "uqp_owner"
  on public.user_question_progress for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- bookmarks (user_id uuid) ---------------------------------------------------
drop policy if exists "bookmarks_deny_direct" on public.bookmarks;
create policy "bookmarks_owner"
  on public.bookmarks for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- custom_topics (user_id uuid) -----------------------------------------------
drop policy if exists "custom_topics_deny_direct" on public.custom_topics;
create policy "custom_topics_owner"
  on public.custom_topics for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- custom_questions (user_id uuid) --------------------------------------------
drop policy if exists "custom_questions_deny_direct" on public.custom_questions;
create policy "custom_questions_owner"
  on public.custom_questions for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- user_topic_mastery (user_id text) ------------------------------------------
drop policy if exists "utm_deny_direct" on public.user_topic_mastery;
create policy "utm_owner"
  on public.user_topic_mastery for all
  to authenticated
  using ((select auth.uid())::text = user_id)
  with check ((select auth.uid())::text = user_id);

-- user_lesson_progress (user_id text) ----------------------------------------
drop policy if exists "ulp_deny_direct" on public.user_lesson_progress;
create policy "ulp_owner"
  on public.user_lesson_progress for all
  to authenticated
  using ((select auth.uid())::text = user_id)
  with check ((select auth.uid())::text = user_id);
