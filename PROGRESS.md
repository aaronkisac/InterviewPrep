# Progress

Last updated: 2026-05-21 (TypeScript + React banks — 88 new questions, short answers + detailMd)

## Stack (per spec v1.1)

- Next.js **16** (App Router, Turbopack) — `src/proxy.ts` for route protection
- TypeScript strict (`tsconfig.json` enables `noUncheckedIndexedAccess` and `noImplicitOverride`)
- TailwindCSS **4.3**
- `radix-ui` unified package
- shadcn/ui (config in `components.json`)
- Supabase (Postgres + RLS + `next_auth` schema for AuthJS adapter)
- NextAuth v5 beta — Google + GitHub, Supabase adapter, JWT sessions
- pnpm

## Phase 1 — Foundation ✅ COMPLETE

| Step | Status | Notes |
| --- | --- | --- |
| 1. Initialise Next.js 16 + TypeScript strict + Tailwind 4.3 + shadcn/ui + pnpm | ✅ | Verified with `pnpm dev` boot. |
| 2. Supabase migrations | ✅ | `20260517000001_init.sql` (4 app tables + indexes), `20260517000002_rls.sql` (RLS), `20260517000003_next_auth.sql` (NextAuth schema + sync trigger to `public.users`). Applied with `supabase db push`. |
| 3. NextAuth v5 (Google + GitHub + Supabase adapter) | ✅ | Both providers tested end-to-end. `allowDangerousEmailAccountLinking: true` on both — safe since they verify email. Required Supabase setting: **API → Exposed schemas** includes `next_auth`. |
| 4. Seed script (3 JSON → questions) | ✅ | `pnpm seed` imports 60 questions (20 per topic). |

## Phase 2 — Core reading experience ✅ COMPLETE

| Step | Status | Notes |
| --- | --- | --- |
| 1. `/questions` list — topic + level filters, keyword search, EN/TR toggle | ✅ | searchParams drive filters; `force-dynamic`. |
| 2. Expandable question cards | ✅ | Clicking a card opens the answer inline (no navigation); collapsible personal example. |
| 3. Question detail `/questions/[id]` | ✅ | Summary (short answer) + deep-dive markdown (`detail_md`) + personal example. |
| 4. `TermTooltip` (radix `Popover`) + `/glossary` index + `/glossary/[slug]` | ✅ | Hover/focus popover with glossary deep link. |
| 5. Auto-glossary tooltips everywhere | ✅ | First mention of any seeded term is wrapped automatically. |

### Auto-glossary implementation

- `src/lib/glossary-match.ts` — pure matcher (no server deps); builds a word-boundary regex from term labels, links the first occurrence per document.
- `src/lib/rehype-glossary.ts` — rehype plugin; wraps terms inside deep-dive markdown, skipping `code`/`pre`/`a`.
- `src/components/glossary-text.tsx` — wraps glossary terms in plain-text strings (short answers, definitions).
- Wired into: question cards, question detail (summary + deep dive), glossary term definition.

### Run before this renders

- `pnpm seed` — populates the `terms` table (15 terms). Tooltips stay invisible until terms exist; the matcher degrades gracefully (plain text) when the table is empty.

### Notes

- Seed JSON carries `answerGeneral`/`answerPersonal` + `*_tr` + `detail_md`/`detail_md_tr`.
- Role lookup: `jwt` callback queries `public.users` on sign-in via `readRole()`.

## Phase 3 — Mock interview ✅ COMPLETE (React only)

Scoped to React for this pass. TypeScript and Next.js mock options are not seeded
yet — those topics show as disabled on the config page until their seed files land.

| Step | Status | Notes |
| --- | --- | --- |
| 1. Mock option seed data | ✅ | `data/seed-mock-react.json` — all 20 React questions, 4 options each (1 correct) with per-option explanations. |
| 2. Seed script extension | ✅ | `scripts/seed.ts` loads `data/seed-mock-*.json`, matches questions by (topic, question), and replaces `mock_options` rows so re-runs stay idempotent. |
| 3. `/mock` config page | ✅ | Topic checkboxes, difficulty range, session length (5/10/20), live availability count. Topics with no seeded options are disabled. |
| 4. `/mock/session` + end screen | ✅ | One question at a time, A–D options, reveal (green/red + explanation), Next-only navigation. End screen shows score and a missed-question review. |

### Mock implementation

- `src/lib/mock-shared.ts` — pure types, `SESSION_LENGTHS`, and query-param parsers (client-safe, no server deps).
- `src/lib/mock.ts` — server queries. `getMockReadyMeta()` feeds the config page; `getMockSessionQuestions()` draws and shuffles a session. A question is "mock-ready" only with exactly 4 options and exactly 1 correct.
- Session state is in-memory only (spec V1 — nothing persisted). "Restart" re-draws via `router.refresh()` plus a fresh server-side `key` that remounts the session.

### Run before this renders

- `pnpm seed` — now also populates `mock_options` for the 20 React questions. `/mock` shows an empty state until seeded.

### Not done (out of React-only scope)

- `data/seed-mock-typescript.json` and `data/seed-mock-nextjs.json` — needed before TypeScript and Next.js become selectable mock topics.

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
