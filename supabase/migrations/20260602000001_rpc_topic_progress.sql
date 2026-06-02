-- RPC: get_user_topic_progress
-- Returns per-topic seen/correct counts for a given user.
-- Replaces the JS-side aggregation in getDashboardData that fetched all
-- user_question_progress rows and joined questions individually.

create or replace function get_user_topic_progress(p_user_id uuid)
returns table (
  topic text,
  seen  bigint,
  correct bigint
)
language sql
stable
security definer
as $$
  select
    q.topic::text,
    count(*)::bigint          as seen,
    count(*) filter (where uqp.correct = true)::bigint as correct
  from user_question_progress uqp
  join questions q on q.id = uqp.question_id
  where uqp.user_id = p_user_id
  group by q.topic;
$$;

grant execute on function get_user_topic_progress(uuid) to authenticated, service_role;
