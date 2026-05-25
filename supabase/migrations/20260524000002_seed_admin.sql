-- Grant admin role to the primary account.
-- Runs as a no-op if the user hasn't signed in yet (row won't exist),
-- so re-run after first login if needed.
update public.users
set role = 'admin'
where email = 'harunk3uk@gmail.com';
