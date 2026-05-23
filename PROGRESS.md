# Progress

Last updated: 2026-05-23 (HTML5 bank complete — 51 questions ids 601–651, 7 batch files, Topic type updated)

---

## Quick Reference (Spec Summary)

**Stack:** Next.js 16 · TypeScript strict · TailwindCSS 4.3 · shadcn/ui · Radix UI · Supabase · NextAuth v5 · pnpm

**ID ranges:** React 1–20, 201–250 · TypeScript 101–143 · Next.js 301–322 · Redux 401–435 · JS 501–586 · HTML5 601–651

**Question schema:** `id · topic · level (1–5) · question · answerGeneral · answerGeneralTr · answerPersonal · detailMd · detailMdTr · mock_options[]`

**Seed flow:** Add JSON to `data/seed-questions/` → `pnpm seed` (upserts by topic+question)

**Mock options rule:** Exactly 4 options, exactly 1 correct → topic becomes selectable in `/mock`

**Topics enum:** `react | typescript | nextjs | redux | javascript | html5` (extend in `src/lib/supabase/types.ts` + migration)

**File conventions:** kebab-case files · PascalCase components · server queries in `src/lib/*.ts` · client components in `_components/`

**Auth:** Google + GitHub, `allowDangerousEmailAccountLinking: true` · JWT sessions · role from `public.users`

**Glossary:** terms in `data/seed-terms.json` · first mention auto-wrapped via `glossary-match.ts` · `pnpm seed` imports

---

## Completed Phases

| Phase | Summary |
| --- | --- |
| Phase 1 — Foundation | Next.js 16 + TS + Tailwind + shadcn/ui + Supabase migrations + NextAuth (Google/GitHub) + seed script. |
| Phase 2 — Reading experience | `/questions` list + filters + EN/TR toggle · expandable cards · `/questions/[id]` detail · `TermTooltip` + `/glossary`. Auto-glossary via `glossary-match.ts` + `rehype-glossary.ts`. |
| Phase 3 — Mock interview (React only) | `/mock` config page + `/mock/session` end screen. React mock options seeded (20 q, 4 options each). TypeScript/Next.js topics disabled until their seed files land. |
| TypeScript bank | 43 new questions (ids 101–143), all `detailMd` written. `pnpm seed` ⬜ pending. |
| React bank | 50 new questions (ids 201–250), all `detailMd` written. `pnpm seed` ⬜ pending. |
| Next.js bank | 22 new questions (ids 301–322), all `detailMd` written. `pnpm seed` ⬜ pending. |
| Redux bank + glossary | 35 questions (ids 401–435) + 13 glossary terms. `pnpm seed` ⬜ pending. |
| JavaScript bank + glossary | 86 questions (ids 501–586, all levels) + 15 glossary terms. Full `detailMd` + `detailMdTr`. `pnpm seed` ⬜ pending. |
| HTML5 bank | 51 questions (ids 601–651, 7 batches). `answerPersonal` on id 648 (WCAG/ReciteMe). `pnpm seed` ⬜ pending. |

---

## Pending

- `pnpm seed` — run once to import all `data/seed-questions/*.json` batches and updated `data/seed-terms.json` into Supabase.
- Mock options seed files still missing: `seed-mock-typescript.json`, `seed-mock-nextjs.json`, `seed-mock-redux.json`, `seed-mock-javascript.json`, `seed-mock-html5.json` — these topics remain disabled in `/mock` until created.
- `detailMdTr` — Turkish deep dives unset for TypeScript, React, Next.js, Redux, HTML5 batches (optional).
