-- Leitner spaced repetition on top of user_topic_mastery.
-- box 1–5: correct answer promotes (+1, max 5), wrong answer demotes to 1.
-- due_at: when the question should resurface (box interval from last answer).

alter table public.user_topic_mastery
  add column if not exists box smallint not null default 1,
  add column if not exists due_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'utm_box_range'
  ) then
    alter table public.user_topic_mastery
      add constraint utm_box_range check (box between 1 and 5);
  end if;
end $$;

-- Review queue lookup: due rows for a user, earliest first
create index if not exists utm_due_idx
  on public.user_topic_mastery (user_id, due_at);

comment on column public.user_topic_mastery.box is
  'Leitner box 1-5; intervals 0/1/3/7/21 days';
comment on column public.user_topic_mastery.due_at is
  'Next review due timestamp (now + box interval at last answer)';
