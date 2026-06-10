# Production Deploy — Checklist

One-time setup to get the app live on Vercel + Supabase. Run the CLI steps locally (Windows), not in CI.

## 1. Supabase (production project)

- [ ] Create a new project at app.supabase.com (region: London `eu-west-2`)
- [ ] Link + push migrations:
  ```bash
  supabase link --project-ref <prod-ref>
  supabase db push          # applies all 25 migrations
  ```
- [ ] Point `.env.local` at the prod project (URL + anon + service role keys), then seed:
  ```bash
  pnpm seed                 # ~600 questions, 129 glossary terms, mock options
  ```
- [ ] Verify in Supabase Studio: `questions` row count, `terms` row count, `system_topics` has 15 rows
- [ ] Admin role: migration `20260524000002_seed_admin.sql` sets harunk3uk@gmail.com — sign in once, then check `public.users.role = 'admin'`

## 2. OAuth apps (production redirect URLs)

- [ ] Google: console.cloud.google.com → add redirect URI `https://<domain>/api/auth/callback/google`
- [ ] GitHub: github.com/settings/developers → either add the prod callback to the existing app or create a second OAuth app for prod (`https://<domain>/api/auth/callback/github`)

## 3. Vercel

- [ ] Import `aaronkisac/InterviewPrep` at vercel.com/new (framework auto-detects Next.js, pnpm via `packageManager`)
- [ ] Set env vars (Production scope) — same names as `.env.example`:
  `NEXTAUTH_SECRET`, `AUTH_SECRET` (generate fresh: `openssl rand -base64 32`),
  `NEXTAUTH_URL=https://<domain>`,
  `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_ID`, `GITHUB_SECRET`,
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Deploy, then set `NEXTAUTH_URL` to the final domain and redeploy if it changed

## 4. Post-deploy smoke test

- [ ] Sign in with Google AND GitHub
- [ ] `/questions` loads with all 15 topics; guest sees only level 1–2 + upsell banner
- [ ] `/mock` — run a short React session end-to-end (score saves, shows in `/dashboard`)
- [ ] Language toggle EN→TR persists across pages
- [ ] Glossary tooltip renders on a question card
- [ ] `/admin` reachable as admin; blocked for a normal account
- [ ] Response headers include `X-Frame-Options: DENY` (curl -sI https://<domain>)

## Notes

- `PLAYWRIGHT_TEST` must NOT be set in Vercel — it gates the test-only session endpoint (`/api/test/set-session`).
- Custom domain (optional): add in Vercel → update `NEXTAUTH_URL` + both OAuth redirect URIs.
