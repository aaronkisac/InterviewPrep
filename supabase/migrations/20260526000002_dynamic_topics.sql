-- Make topics dynamic: drop hardcoded CHECK constraint, add system_topics table.
-- Existing questions are untouched — their topic slugs remain valid.

-- ============================================================================
-- 1. Drop the enum-style check constraint so admins can add new topic slugs
-- ============================================================================
alter table public.questions
  drop constraint if exists questions_topic_check;

-- ============================================================================
-- 2. system_topics — source of truth for all topic slugs
-- ============================================================================
create table if not exists public.system_topics (
  slug        text primary key,
  name        text not null,
  is_builtin  boolean not null default false,
  created_by  uuid references public.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

alter table public.system_topics enable row level security;

drop policy if exists "system_topics_deny_direct" on public.system_topics;
create policy "system_topics_deny_direct"
  on public.system_topics for all
  to anon, authenticated
  using (false)
  with check (false);

-- ============================================================================
-- 3. Seed the 15 builtin topics
-- ============================================================================
insert into public.system_topics (slug, name, is_builtin) values
  ('react',                 'React',                 true),
  ('typescript',            'TypeScript',            true),
  ('nextjs',                'Next.js',               true),
  ('javascript',            'JavaScript',            true),
  ('redux',                 'Redux',                 true),
  ('html5',                 'HTML5',                 true),
  ('css',                   'CSS',                   true),
  ('react-hooks',           'React Hooks',           true),
  ('git',                   'Git',                   true),
  ('agile-scrum',           'Agile & Scrum',         true),
  ('websockets',            'WebSockets',            true),
  ('unit-testing',          'Unit Testing',          true),
  ('design-patterns',       'Design Patterns',       true),
  ('software-architecture', 'Software Architecture', true),
  ('api-design',            'API Design',            true)
on conflict (slug) do nothing;
