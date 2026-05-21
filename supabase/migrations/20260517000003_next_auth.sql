-- NextAuth.js Supabase adapter schema
-- Source: https://authjs.dev/getting-started/adapters/supabase
-- The adapter writes OAuth identities, sessions, and verification tokens into
-- a dedicated `next_auth` schema. Our app-level user data (role etc.) lives
-- in public.users — a trigger syncs id + email + name across.

-- pgcrypto provides gen_random_uuid(); enabled in migration 0001_init.

-- ============================================================================
-- next_auth schema
-- ============================================================================
create schema if not exists next_auth;

grant usage on schema next_auth to service_role;
grant all on schema next_auth to postgres;

-- helper: read the JWT subject as uuid (for RLS in this schema if needed later)
create or replace function next_auth.uid() returns uuid
  language sql stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;

-- ---- users ----
create table if not exists next_auth.users (
  id              uuid primary key default gen_random_uuid(),
  name            text,
  email           text,
  "emailVerified" timestamptz,
  image           text,
  constraint users_email_unique unique (email)
);

grant all on table next_auth.users to postgres;
grant all on table next_auth.users to service_role;

-- ---- sessions ----
create table if not exists next_auth.sessions (
  id             uuid primary key default gen_random_uuid(),
  expires        timestamptz not null,
  "sessionToken" text not null,
  "userId"       uuid references next_auth.users(id) on delete cascade,
  constraint sessions_token_unique unique ("sessionToken")
);

grant all on table next_auth.sessions to postgres;
grant all on table next_auth.sessions to service_role;

-- ---- accounts ----
create table if not exists next_auth.accounts (
  id                  uuid primary key default gen_random_uuid(),
  type                text not null,
  provider            text not null,
  "providerAccountId" text not null,
  refresh_token       text,
  access_token        text,
  expires_at          bigint,
  token_type          text,
  scope               text,
  id_token            text,
  session_state       text,
  oauth_token_secret  text,
  oauth_token         text,
  "userId"            uuid references next_auth.users(id) on delete cascade,
  constraint accounts_provider_unique unique (provider, "providerAccountId")
);

grant all on table next_auth.accounts to postgres;
grant all on table next_auth.accounts to service_role;

-- ---- verification_tokens ----
create table if not exists next_auth.verification_tokens (
  identifier text,
  token      text primary key,
  expires    timestamptz not null,
  constraint verification_token_unique unique (token, identifier)
);

grant all on table next_auth.verification_tokens to postgres;
grant all on table next_auth.verification_tokens to service_role;

-- ============================================================================
-- Sync trigger: next_auth.users → public.users
-- Keeps the app-level user row (with role) in lockstep with the adapter's
-- canonical record. INSERT on first sign-in, UPDATE if email/name changes.
-- ============================================================================
create or replace function public.sync_next_auth_user()
  returns trigger
  language plpgsql
  security definer
  set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.users (id, email, name)
    values (new.id, coalesce(new.email, ''), new.name)
    on conflict (id) do update
      set email = excluded.email,
          name  = excluded.name;
  elsif (tg_op = 'UPDATE') then
    update public.users
      set email = coalesce(new.email, public.users.email),
          name  = new.name
    where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists sync_next_auth_user_trigger on next_auth.users;
create trigger sync_next_auth_user_trigger
  after insert or update on next_auth.users
  for each row execute function public.sync_next_auth_user();
