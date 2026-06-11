# Progress

Last updated: 2026-06-11 (P3 retry-missed mode)

---

## Quick Reference (Spec Summary)

**Stack:** Next.js 15 · TypeScript strict · TailwindCSS v4 · shadcn/ui · Radix UI · Supabase · NextAuth v5 · pnpm

**ID ranges:**
- React 1–20, 201–250
- TypeScript 101–143
- Next.js 301–322
- Redux 401–435
- JavaScript 501–586
- HTML5 601–651
- CSS 701–733
- React Hooks 801–829
- Git 901–921
- Agile & Scrum 1001–1026
- WebSockets 1101–1118
- Unit Testing 1201–1216
- Design Patterns 1301–1316
- Software Architecture 1401–1489
- API Design 1501–1546

**Question schema:** `id · topic · level (1–5) · question · answerGeneral · answerGeneralTr · answerPersonal · detailMd · detailMdTr · mock_options[]`

**Seed flow:** Add JSON to `data/seed-questions/` → `pnpm seed` (upserts by topic+question)

**Mock options rule:** Exactly 4 options, exactly 1 correct → topic becomes selectable in `/mock`

**Topics enum (current):** `react | typescript | nextjs | redux | javascript | html5 | css | react-hooks | git | agile-scrum | websockets | unit-testing | design-patterns | software-architecture | api-design`

**File conventions:** kebab-case files · PascalCase components · server queries in `src/lib/*.ts` · client components in `_components/`

**Auth:** Google + GitHub, `allowDangerousEmailAccountLinking: true` · JWT sessions · role from `public.users`

**Glossary:** terms in `data/seed-terms.json` (129 terms total) · first mention auto-wrapped via `glossary-match.ts` · `pnpm seed` imports

---

## Completed Phases

| Phase | Summary |
| --- | --- |
| Phase 1 — Foundation | Next.js 15 + TS + Tailwind + shadcn/ui + Supabase migrations + NextAuth (Google/GitHub) + seed script. |
| Phase 2 — Reading experience | `/questions` list + filters + EN/TR toggle · expandable cards · `/questions/[id]` detail · `TermTooltip` + `/glossary`. Auto-glossary via `glossary-match.ts` + `rehype-glossary.ts`. |
| Phase 3 — Mock interview (React only) | `/mock` config page + `/mock/session` end screen. React mock options seeded (20 q, 4 options each). TypeScript/Next.js topics disabled until their seed files land. |
| TypeScript bank | 43 questions (ids 101–143), all `detailMd` written. |
| React bank | 50 questions (ids 201–250), all `detailMd` written. |
| Next.js bank | 22 questions (ids 301–322), all `detailMd` written. |
| Redux bank + glossary | 35 questions (ids 401–435) + 13 glossary terms. |
| JavaScript bank + glossary | 86 questions (ids 501–586, all levels) + 15 glossary terms. Full `detailMd` + `detailMdTr`. |
| HTML5 bank | 51 questions (ids 601–651, 7 batches). `answerPersonal` on id 648 (WCAG/ReciteMe). |
| CSS bank + glossary | 33 questions (ids 701–733, 5 batches, all levels). 10 glossary terms. Migration: `20260523000001_topic_css.sql`. |
| React Hooks bank + glossary | 29 questions (ids 801–829, 5 batches, all levels). 10 glossary terms. Migration: `20260523000002_topic_react_hooks.sql`. |
| Git bank + glossary | 21 questions (ids 901–921, 5 batches, all levels). 9 glossary terms. Migration: `20260523000004_topic_git.sql`. |
| Agile & Scrum bank + glossary | 26 questions (ids 1001–1026, 5 batches, all levels). 10 glossary terms. Migration: `20260523000005_topic_agile_scrum.sql`. |
| WebSockets bank + glossary | 18 questions (ids 1101–1118, 5 batches, all levels). 6 glossary terms. Migration: `20260523000006_topic_websockets.sql`. |
| Unit Testing bank + glossary | 16 questions (ids 1201–1216, 5 batches, all levels). 8 glossary terms. |
| Design Patterns bank + glossary | 16 questions (ids 1301–1316, 5 batches, all levels). 8 glossary terms. |
| Types + Topics update | `src/lib/supabase/types.ts` and `src/lib/topics.ts` updated with all 13 topics. |
| User tracking | `mock_sessions` + `user_question_progress` + `bookmarks` tables. Server actions in `src/lib/actions/user-tracking.ts`. Bookmark button on question cards. `/dashboard` page with session history + topic progress + bookmark count. |
| Homepage redesign | Hero + feature cards + topic grid + login-aware welcome banner. `getTopicStats()` added to `questions.ts`. |
| User submissions | `/questions/new` form (private or submit for review). `src/lib/actions/questions.ts`: submitQuestion, getUserSubmissions, approveQuestion, rejectQuestion. `/admin/questions` review queue (admin role guard). Dashboard "My submissions" section with status chips. Questions page "+ Submit question" button for logged-in users. |
| Admin panel | `src/app/admin/layout.tsx` — shared header + role guard. `/admin/questions` — pending review queue. `/admin/users` — list all users, promote/demote admin role. `src/lib/actions/admin.ts`: listAllUsers, setUserRole. Migration `20260524000002_seed_admin.sql` sets harunk3uk@gmail.com to admin. Dashboard shows "Admin" link for admin users. |
| Combined migration | `20260523000007_topic_unit_testing_design_patterns.sql` — adds unit-testing + design-patterns to DB constraints. |
| Software Architecture bank | 89 questions (ids 1401–1489, 5 batches, all levels). Migration: `20260525000001_topic_software_architecture_api_design.sql`. |
| API Design bank | 46 questions (ids 1501–1546, 5 batches, all levels). Covers REST, GraphQL, auth, rate limiting, pagination, webhooks, BFF, OpenAPI, tRPC, observability. |
| Guest access restrictions | `src/middleware.ts` protects `/mock`, `/glossary`, `/dashboard`, `/admin`, `/questions/new`, `/questions/[id]`. `/questions` shows only level 1–2 for guests + upsell banner. Bookmark/detail-page/glossary-definition buttons redirect to `/signin` for guests. |
| Custom Topics | Dashboard accordion — users create private topics, add/edit/delete/JSON-import questions. Actions: `src/lib/actions/custom-topics.ts`. Migration: `20260526000001_custom_topics.sql`. |
| Dynamic Topics + Admin Import | `Topic` type → `string`. `system_topics` table (migration `20260526000002`). Admin `/admin/topics`: create/delete topics, JSON bulk import per topic (client-side validation + live count). Dashboard JSON import for custom topics. Required fields: admin (question, level 1-5, answerGeneral); user (question). |
| DB-driven topic lists | All hardcoded `TOPICS`/`TOPIC_LABELS` removed from every page and component. Topic names now fetched via `listSystemTopics()` everywhere: questions list, question detail, mock config, mock session, homepage topic grid, dashboard, glossary, admin questions, `/questions/new`. `mock-shared.ts` `parseTopicList` no longer filters against hardcoded array. |
| Custom topic question fixes | `CustomQuestionCard` now shows `LevelDots`. Custom questions can now be bookmarked via new `custom_question_bookmarks` table (migration `20260529000001`). `toggleCustomBookmark` + `getCustomBookmarkIds` actions added to `custom-topics.ts`. |
| Mock options audit + glossary expansion | Fixed seed-mock question text mismatches across 8 topics (api-design 13/16, software-architecture 16/16, agile-scrum 2, css/html5/nextjs/websockets/design-patterns 1 each). Added 5 new batch questions: `api-design-batch-6` (JWT, id 1547), `software-architecture-batch-6` (CDN, stateful/stateless, circuit breaker, sync/async comm, message queue, ids 1490–1494). Added new `agile-scrum-batch-6` (Kanban, id 1027). Glossary expanded from 105 → 129 terms: 10 software-architecture, 10 api-design, 4 additions to react/typescript/nextjs. |
| Full mock_options coverage | Generated mock_options for all previously uncovered questions. New seed files: `seed-mock-react-extra.json` (19 q), `seed-mock-software-architecture-extra-1.json` (46 q), `seed-mock-software-architecture-extra-2.json` (32 q), `seed-mock-design-patterns-extra.json` (1 q). Total mock-ready: React 70, SA 94, all others unchanged. 608 questions now mock-ready across all 15 topics. |
| detailMdTr complete | Turkish deep-dive translations added to all remaining topics. React (50 q, batches 1–9), HTML5 (51 q, batches 1–7), Software Architecture (94 q, batches 1–6), API Design (47 q, batches 1–6). All topics now have full `detailMdTr` coverage. Previously complete: TypeScript, Next.js, Redux, CSS, React Hooks, Git, Agile & Scrum, WebSockets, Unit Testing, Design Patterns. JavaScript had `detailMdTr` from the start. |
| Global TR support | Cookie-based language preference (`preferred_lang`). `src/lib/lang.ts` + `src/lib/actions/lang.ts`. Central `src/lib/i18n.ts` dictionary (all UI strings). `LangToggle` in Navbar persists lang across all pages. All server pages (homepage, dashboard, glossary, signin, questions, mock, flashcard) + all client components (MockConfigTabs, MockSession, FlashcardSession, QuestionCard) fully translated. |
| Full mock TR support | `question_tr` column added (migration `20260601000002`). Mock session shows question, options and explanations in Turkish when lang=tr. `mock_options` table gains `option_text_tr` + `explanation_tr` columns (migration `20260601000001`). `terms` table gains `tooltip_tr` + `definition_tr`. All 588 seed questions have `questionTr`. All 129 glossary terms have `tooltipTr` + `definitionTr`. All seed-mock files have `optionTextTr` + `explanationTr` for every option. |
| P0 hygiene + security headers | Removed stray `_tmp_` files, fixed `.gitignore`, security headers + `poweredByHeader:false` in `next.config.ts`. Added `DEVELOPMENT_PLAN.md` (prioritized plan) + `DEPLOY.md` (prod deploy checklist). |
| P1 resilience + unit tests | Root `error.tsx`/`global-error.tsx`/`not-found.tsx` (EN/TR). Vitest + 5 unit suites (`src/lib/__tests__`). CI `checks` job (lint+typegen+typecheck+unit) gates e2e. `lang-toggle.spec.ts` e2e. Lint script → `eslint .`. Typecheck fixes in `db-seed.spec.ts`. |
| P2 pagination + cache tags | `/questions` DB-level pagination (50/sayfa, `listQuestionsPage`, stable ordering). Guest level filter pushed into query. `Pagination` component (EN/TR). All question caches tagged `questions`; approve/reject/delete/import actions call `revalidateTag`. Pagination e2e specs. |
| P2 full-text search | Migration `20260611000001_full_text_search.sql` (generated tsvector EN+TR, GIN). Hybrid search in `listQuestions`/`listQuestionsPage`: title ILIKE OR `wfts` on vector. `buildSearchOrFilter` + unit tests. **Needs `supabase db push`.** |
| P2 a11y pass | WCAG 2.1 AA static audit (`.docs/a11y-audit-2026-06-11.md`). 9 fixes: skip link, aria-disabled mock options + sr-only result text, LevelDots aria-label, labeled filters, aria-pressed tabs/pills, named progressbar, Escape on mobile nav. Manual follow-ups listed in report. |
| P3 spaced repetition | Leitner boxes on `user_topic_mastery` (migration `20260611000002`, **needs `supabase db push`**). `src/lib/leitner.ts` + tests. Correct answer promotes box (0/1/3/7/21d intervals), wrong demotes. `/mock/review` flashcard session over due questions. Dashboard review card. |
| P3 retry-missed mode | End screen "Retry missed (N)" button — wrong answers re-run as a fresh client-side round, recorded as its own session (feeds Leitner). Topic breakdown already existed. |

---

## Pending — Must run locally

```bash
# 1. Apply all pending migrations (adds new topics to DB check constraints)
supabase db push

# 2. Import all question + glossary data into Supabase
pnpm seed
```

### After seed runs, these should be live:
- CSS, React Hooks, Git, Agile & Scrum, WebSockets, Unit Testing, Design Patterns topics visible in `/questions`
- Glossary tooltips for 58 terms across all topics

### E2E test setup (done — run after seed):
```bash
pnpm install          # picks up @playwright/test
pnpm exec playwright install --with-deps chromium
pnpm test:e2e
```
GitHub Secrets needed: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXTAUTH_SECRET`, `AUTH_SECRET`

### Still missing (optional / future):
- `answerPersonal` / `answerPersonalTr` for most questions (add from Aaron's real interview experience)

---

## Mock Options — All Topics Complete

All 15 topics now have mock seed files (263 questions total). After `pnpm seed` runs, all topics will appear in `/mock`.

| File | Questions |
| --- | --- |
| seed-mock-react.json | 20 |
| seed-mock-typescript.json | 20 |
| seed-mock-nextjs.json | 21 |
| seed-mock-redux.json | 16 |
| seed-mock-javascript.json | 20 |
| seed-mock-html5.json | 20 |
| seed-mock-css.json | 16 |
| seed-mock-react-hooks.json | 16 |
| seed-mock-git.json | 16 |
| seed-mock-agile-scrum.json | 16 |
| seed-mock-websockets.json | 18 |
| seed-mock-unit-testing.json | 16 |
| seed-mock-design-patterns.json | 16 |
| seed-mock-software-architecture.json | 16 |
| seed-mock-api-design.json | 16 |
