-- Add super_admin role — sits above admin, cannot be modified by regular admins.

-- ============================================================================
-- 1. Extend the role check constraint
-- ============================================================================
alter table public.users
  drop constraint if exists users_role_check;

alter table public.users
  add constraint users_role_check
  check (role in ('user', 'admin', 'super_admin'));

-- ============================================================================
-- 2. Promote harunk3uk@gmail.com to super_admin
-- ============================================================================
update public.users
  set role = 'super_admin'
  where email = 'harunk3uk@gmail.com';
