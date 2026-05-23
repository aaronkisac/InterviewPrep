# Progress

Last updated: 2026-05-22 (Redux bank complete — 35 questions ids 401–435, 13 glossary terms, Topic type updated)

---

## Quick Reference (Spec Summary)

**Stack:** Next.js 16 · TypeScript strict · TailwindCSS 4.3 · shadcn/ui · Radix UI · Supabase · NextAuth v5 · pnpm

**ID ranges:** React 1–20, 201–250 · TypeScript 101–143 · Next.js 301–322 · Redux 401–435 · JS 501–586

**Question schema:** `id · topic · level (1–5) · question · answerGeneral · answerGeneralTr · answerPersonal · detailMd · detailMdTr · mock_options[]`

**Seed flow:** Add JSON to `data/seed-questions/` → `pnpm seed` (upserts by topic+question)

**Mock options rule:** Exactly 4 options, exactly 1 correct → topic becomes selectable in `/mock`

**Topics enum:** `react | typescript | nextjs | redux | javascript` (extend in `src/lib/supabase/types.ts` + migration)

**File conventions:** kebab-case files · PascalCase components · server queries in `src/lib/*.ts` · client components in `_components/`

**Auth:** Google + GitHub, `allowDangerousEmailAccountLinking: true` · JWT sessions · role from `public.users`

**Glossary:** terms in `data/seed-terms.json` · first mention auto-wrapped via `glossary-match.ts` · `pnpm seed` imports

---

## Stack (per spec v1.1)

- Next.js **16** (App Router, Turbopack) — `src/proxy.ts` for route protection
- TypeScript strict (`tsconfig.json` enables `noUncheckedIndexedAccess` and `noImplicitOverride`)
- TailwindCSS **4.3**
- `radix-ui` unified package
- shadcn/ui (config in `components.json`)
- Supabase (Postgres + RLS + `next_auth` schema for AuthJS adapter)
- NextAuth v5 beta — Google + GitHub, Supabase adapter, JWT sessions
- pnpm

## TypeScript question bank expansion 🔄 IN PROGRESS

Goal: grow the seeded TypeScript bank beyond the original 20. Source is
`data/raw/typescript-questions-source.json` (81 questions); the dedupe
decisions and import worklist live in `data/raw/curated-typescript.md` —
81 source → 20 already seeded, 43 new, 11 merged, 7 dropped. Curated
bank = **63 questions**.

| Step | Status | Notes |
| --- | --- | --- |
| Dedupe + worklist | ✅ | `curated-typescript.md`. |
| batch-1 — Level 1 Entry (5 q) | ✅ | ids 101–105. `answerGeneral` + `detailMd` + EN/TR short answers. |
| batch-2…9 — Levels 2–5 (38 q) | ✅ | ids 106–143. `answerGeneral` + `answerGeneralTr` + `detailMd`. |
| Deep-dive `detailMd` for batch-2…9 | ✅ | All 38 done — markdown deep dives for the `/questions/[id]` detail pages. |
| `pnpm seed` import | ⬜ | Run to import — seed script auto-loads every `data/seed-questions/*.json` and upserts by (topic, question). |
| Turkish deep-dive `detailMdTr` | ⬜ optional | batch-1…9 detail pages are English-only; `detailMdTr` is unset (same as batch-1). A TR pass would fill the EN/TR toggle on detail pages. |

### Notes

- batch-2…9 split: Level 2 Junior (batch-2/3/4, ids 106–119), Level 3 Mid
  (batch-5/6/7, ids 120–133), Level 4 Senior (batch-8, ids 134–137),
  Level 5 Expert (batch-9, ids 138–143).
- `answerPersonal` is set on 2 of the 38 (ids 116, 134) where one of Aaron's
  proof points fits naturally; the rest are `null`.
- `detailMd` deep dives: all 38 written (~1.4k chars each, `##` sections with
  `ts`/`jsonc` code blocks), matching batch-1's style. `detailMdTr` is unset.

## React question bank expansion 🔄 IN PROGRESS

Same flow as the TypeScript bank. Source is `data/raw/react-questions-source.md`
(92 questions); dedupe decisions and the worklist are in
`data/raw/curated-react.md` — 92 source → 20 already seeded, 50 new, 13 merged,
9 dropped. Curated React bank = **70 questions**.

| Step | Status | Notes |
| --- | --- | --- |
| Dedupe + worklist | ✅ | `curated-react.md` — 3 source star-tiers mapped onto the app's 5 levels. |
| react-batch-1…9 — 50 new questions | ✅ | ids 201–250. `answerGeneral` + `answerGeneralTr` + `detailMd`. |
| Deep-dive `detailMd` for react-batch-1…9 | ✅ | All 50 done — markdown deep dives (~1.2k chars each) for the `/questions/[id]` detail pages. |
| `pnpm seed` import | ⬜ | Seed script auto-loads every `data/seed-questions/*.json`, upserts by (topic, question). |
| Turkish deep-dive `detailMdTr` | ⬜ optional | React + TypeScript detail pages are English-only; `detailMdTr` is unset. |

### Notes

- react-batch split: L1 Entry (batch-1, ids 201–205), L2 Junior (batch-2/3,
  ids 206–216), L3 Mid (batch-4/5/6, ids 217–232), L4 Senior (batch-7/8,
  ids 233–244), L5 Expert (batch-9, ids 245–250).
- New React ids start at 201 to stay clear of the seeded React rows (1–20)
  and the TypeScript batches (101–143).
- `answerPersonal` is set on 1 of the 50 (id 233, HOC — Heyman Al component
  library); the rest are `null`.
- Answers are written modern (hooks-era) even where the source phrasing is
  class-component-dated.
