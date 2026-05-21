-- Interview Prep App — initial schema
-- Tables: users, questions, mock_options, terms
-- Reference: interview-prep-spec.docx Section 6

-- Enable extensions we rely on
create extension if not exists "pgcrypto";

-- ============================================================================
-- users
-- Mirrors NextAuth user records. Role assigned manually in V1.
-- ============================================================================
create table if not exists public.users (
  id          uuid primary key,
  email       text not null unique,
  name        text,
  role        text not null default 'user' check (role in ('user', 'admin')),
  created_at  timestamptz not null default now()
);

comment on table public.users is 'App users — id matches NextAuth user id';

-- ============================================================================
-- questions
-- Seed + user-contributed questions. Difficulty 1..5.
-- ============================================================================
create table if not exists public.questions (
  id              uuid primary key default gen_random_uuid(),
  topic           text not null check (topic in ('react', 'typescript', 'nextjs')),
  level           int2 not null check (level between 1 and 5),
  level_label     text not null check (level_label in ('Entry', 'Junior', 'Mid', 'Senior', 'Expert')),
  question        text not null,
  answer_general  text not null default '',
  answer_personal text,
  is_seed         boolean not null default false,
  is_shared       boolean not null default true,
  status          text not null default 'active' check (status in ('active', 'pending', 'rejected')),
  created_by      uuid references public.users(id) on delete set null,
  created_at      timestamptz not null default now()
);

create index if not exists questions_topic_level_idx
  on public.questions (topic, level);

create index if not exists questions_status_idx
  on public.questions (status);

create index if not exists questions_created_by_idx
  on public.questions (created_by);

comment on table public.questions is 'All questions — seed + private + community-suggested';

-- ============================================================================
-- mock_options
-- Multiple-choice options for mock interview mode. Exactly one is_correct=true.
-- ============================================================================
create table if not exists public.mock_options (
  id           uuid primary key default gen_random_uuid(),
  question_id  uuid not null references public.questions(id) on delete cascade,
  option_text  text not null,
  is_correct   boolean not null default false,
  explanation  text not null default ''
);

create index if not exists mock_options_question_id_idx
  on public.mock_options (question_id);

comment on table public.mock_options is 'Multiple-choice options for mock interview sessions';

-- ============================================================================
-- terms
-- Glossary terms shared across topics.
-- ============================================================================
create table if not exists public.terms (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  label         text not null,
  tooltip       text not null,
  definition    text not null,
  code_example  text,
  topic         text check (topic in ('react', 'typescript', 'nextjs')),
  related_slugs text[] not null default '{}'
);

create index if not exists terms_topic_idx on public.terms (topic);

comment on table public.terms is 'Glossary terms — hover tooltip + full page';
