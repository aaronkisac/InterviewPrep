# Progress

Last updated: 2026-05-22 (Redux bank complete — 35 questions ids 401–435, 13 glossary terms, Topic type updated)

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

## Next.js question bank expansion ✅ COMPLETE

Source: 40 questions from external JSON. 14 overlapped with the existing 20
seeded questions and were dropped; 1 (versions 10 vs 11) was too outdated to
include. **22 new questions** written across 4 batch files.

| Step | Status | Notes |
| --- | --- | --- |
| Dedupe + level mapping | ✅ | 40 source → 20 already seeded, 1 dropped (outdated), 1 merged into existing, 22 new. |
| nextjs-batch-1 — L1 Entry (6 q) | ✅ | ids 301–306. Benefits, Link, static files, Fast Refresh, built-in optimisations, next.config.js. |
| nextjs-batch-2 — L2 Junior (7 q) | ✅ | ids 307–313. Env vars, TypeScript, error handling, Metadata API, CSS/styling, dynamic imports, code splitting. |
| nextjs-batch-3 — L3 Mid (6 q) | ✅ | ids 314–319. State management, auth, SEO, deployment, analytics, i18n. |
| nextjs-batch-4 — L4 Senior (3 q) | ✅ | ids 320–322. _app/_document (Pages Router), Draft Mode, security. |
| `pnpm seed` import | ⬜ | Seed script auto-loads every `data/seed-questions/*.json`, upserts by (topic, question). |

### Notes

- New Next.js ids start at 301 — clear of base seed (1–20), TypeScript (101–143), React (201–250).
- Level split: L1 Entry (ids 301–305), L2 Junior (ids 306–313), L3 Mid (ids 314–319), L4 Senior (ids 320–322).
- `answerPersonal` is set on 4 questions (ids 301, 305, 316, 319) where Butlin's or Heyman Al proof points fit naturally; the rest are `null`.
- All answers are App Router-aware (Next.js 13+/15+); Pages Router concepts are covered where interviewers still ask about them (ids 320–321).
- `detailMdTr` is unset across all 22 — English-only deep dives, same as TypeScript and React batches.
- `data/seed-mock-nextjs.json` is still missing — Next.js topic remains disabled in `/mock` until mock options are seeded.

## Redux question bank ✅ COMPLETE

35 new questions across 5 batches. `Topic` type extended with `"redux"` in `src/lib/supabase/types.ts`.

| Step | Status | Notes |
| --- | --- | --- |
| redux-batch-1 — L1 Entry (6 q) | ✅ | ids 401–406. What is Redux, Flux, core principles, store, reducers, reducer concept. |
| redux-batch-2 — L2 Junior (9 q) | ✅ | ids 407–415. DevTools, DevTools features, Thunk, Thunk uses, initial state, Container vs Component, reducer naming, constants, connect(). |
| redux-batch-3 — L3 Mid (9 q) | ✅ | ids 416–424. All state in Redux?, redux-saga, selectors, multiple middleware, Context vs Redux, Redux Form, Redux Form features, async middleware choices, Ajax requests. |
| redux-batch-4 — L4 Senior (7 q) | ✅ | ids 425–431. Directory structure, saga vs thunk, Redux downsides, store access outside React, reset state, proper store access, @ decorator. |
| redux-batch-5 — L5 Expert (4 q) | ✅ | ids 432–435. Redux vs RxJS, call vs put in saga, saga mental model, Relay vs Redux. |
| `pnpm seed` import | ⬜ | Seed script auto-loads every `data/seed-questions/*.json`, upserts by (topic, question). |

### Notes

- Redux ids start at 401 — clear of React (1–20, 201–250), TypeScript (101–143), Next.js (301–322).
- Level split: L1 Entry (401–406), L2 Junior (407–415), L3 Mid (416–424), L4 Senior (425–431), L5 Expert (432–435).
- All `answerPersonal` fields are `null` — no Aaron-specific Redux proof points in the current job history.
- `detailMdTr` is unset — English-only deep dives, consistent with React/TypeScript/Next.js batches.
- `data/seed-mock-redux.json` not yet created — Redux topic will be disabled in `/mock` until mock options are seeded.

## Redux glossary terms ✅ COMPLETE

13 new terms added to `data/seed-terms.json`. Slugs: `redux-store`, `redux-reducer`, `redux-action`, `redux-dispatch`, `thunk`, `redux-selector`, `redux-middleware`, `redux-saga`, `flux`, `redux-toolkit`, `immer`, `reselect`, `combine-reducers`.

All terms carry `topic: "redux"`, a tooltip (used in hover popover), a full `definition`, a `codeExample` where relevant, and `relatedSlugs` cross-linking related terms. Run `pnpm seed` to import.

## JavaScript question bank ✅ COMPLETE (Adım 1)

86 new questions across 8 batches (ids 501–586). `Topic` type extended with `"javascript"` in `src/lib/supabase/types.ts`.
6 duplicate/unusable questions from the 92-question source were merged or dropped.

| Step | Status | Notes |
| --- | --- | --- |
| js-batch-1 — L1 Entry (10 q) | ✅ | ids 501–510. Object type, typeof, arrays, equality, scope, == vs ===, values/types, null/undefined, let, undefined vs not defined. |
| js-batch-2 — L2 Junior pt1 (9 q) | ✅ | ids 511–519. Host vs native objects, strict mode (merged), event bubbling, iteration, polyfill, let vs var, arrow fn advantages, use strict pros/cons, anonymous fn. |
| js-batch-3 — L2 Junior pt2 (9 q) | ✅ | ids 520–528. Set dedup, anonymous vs named fns, shim vs polyfill, coercion, IIFE, export default, arrow fn use cases, spread vs rest, destructuring. |
| js-batch-4 — L3 Mid pt1 (11 q) | ✅ | ids 529–539. throw vs new Error, same-origin, load event, callback hell, compile-to-JS, Symbol, generators intro, extending builtins, generators use cases, closure (merged), Object.freeze vs const. |
| js-batch-5 — L3 Mid pt2 (11 q) | ✅ | ids 540–550. ES6 classes benefits, class vs ES5 constructors, currying, DOMContentLoaded, AMD vs CJS, HOF, bind, ES5 vs ES6, global scope, linear search, binary search. |
| js-batch-6 — L4 Senior pt1 (10 q) | ✅ | ids 551–560. Event delegation, prototypal inheritance, `this` keyword, Promises, async/await, event loop, hoisting, debounce, throttle, memoization. |
| js-batch-7 — L4 Senior pt2 (10 q) | ✅ | ids 561–570. Map vs WeakMap, Proxy, pass by value vs reference, memory leaks, garbage collection, pure functions & immutability, module pattern, Observer pattern, TCO, Web Workers. |
| js-batch-8 — L5 Expert (16 q) | ✅ | ids 571–586. Optional chaining & ??, iterators & iterables, tagged template literals, BigInt, Intl API, Symbol advanced, microtasks vs macrotasks, type coercion, generators advanced, Reflect API, WebAssembly, Service Workers, performance optimisations, WeakRef & FinalizationRegistry, V8 hidden classes, Temporal API. |
| `pnpm seed` import | ⬜ | Seed script auto-loads every `data/seed-questions/*.json`, upserts by (topic, question). |

### Notes

- JavaScript ids start at 501 — clear of React (1–20, 201–250), TypeScript (101–143), Next.js (301–322), Redux (401–435).
- Level split: L1 Entry (501–510), L2 Junior (511–528), L3 Mid (529–550), L4 Senior (551–570), L5 Expert (571–586).
- `answerPersonal` is set on several questions where Aaron's experience is directly relevant.
- All batches include full `detailMd` and `detailMdTr` — JavaScript is the first topic with complete Turkish deep dives.
- `data/seed-mock-javascript.json` not yet created — JavaScript topic will be disabled in `/mock` until mock options are seeded.

## JavaScript glossary terms ✅ COMPLETE (Adım 2)

15 new terms added to `data/seed-terms.json`. Slugs: `closure`, `scope`, `hoisting-js`, `iife`, `event-loop`, `promise-js`, `async-await`, `prototype-chain`, `event-delegation`, `debounce`, `throttle`, `generator-js`, `symbol-js`, `web-worker`.

All terms carry `topic: "javascript"`, a tooltip, a full `definition`, a `codeExample`, and `relatedSlugs`. Run `pnpm seed` to import.
