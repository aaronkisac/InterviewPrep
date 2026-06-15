# Progress

Last updated: 2026-06-15 (security hardening: server-side challenge whitelist + RLS owner policies / NextAuth→Supabase JWT bridge)

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

**Seed flow:** Add JSON to `data/seed-questions/` → `pnpm seed` (upserts by topic+question). Selective: `pnpm seed courses` / `mock` / `questions` / `terms`. Batched: one question-map prefetch + chunked writes (~30 requests instead of ~4000).

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
| P3 mock timer | Optional per-question countdown (Off/30/60/90s) in mock config (`?t=`). `Countdown` in QuestionView (keyed per question, red <10s, `role=timer`). Timeout = unanswered via `""` sentinel + "Time's up!" feedback. |
| Topic badges + glossary pagination | `/questions` All tab shows topic badge per card. `/glossary` All view flattened (stable section order) with topic badges + pagination (`?page=/?per=`). `Pagination`/`PageSizeSelect` generalized to `src/components/` with `basePath`. |
| P3 dashboard score trend | `getSessionTrend` (son 30 oturum) + `ProgressChart` — bağımlılıksız, grade renkli bar chart, native tooltip, `role=img`. 2+ oturumda görünür. |
| P3 answerPersonal (pass 1+2) | 26 questions: React (206, 214, 217, 227, 228, 234, 242, 244, 245, 248), Next.js (309, 310, 312, 315, 319), Hooks (808, 814, 816, 817), Testing (1205, 1208, 1209, 1214), HTML5 (601, 622, 642). EN, IC voice, real proof points. TR + TS/JS topics pending. **Needs `pnpm seed`.** |
| UI polish pass | globals.css: `card-lift` hover-elevation utility (theme-aware via color-mix, reduced-motion safe), global `:focus-visible` ring, `::selection` tint. Homepage: gradient headline, CTA active-scale, card-lift on feature/topic cards. QuestionCard subtle hover shadow. Navbar "ip" brand mark. |
| SEO setup | `src/lib/site.ts` (SITE_NAME/DESCRIPTION + `getSiteUrl()` from `NEXT_PUBLIC_SITE_URL`→`NEXTAUTH_URL`). Root metadata: metadataBase, title template, keywords, OG (en_GB + tr_TR), twitter card, robots. `robots.ts` (gated routes disallowed; `/questions/` blocked but `/questions` crawlable), `sitemap.ts` (public routes only), `opengraph-image.tsx` (1200×630, logo + tagline via next/og). JSON-LD WebSite schema + dynamic `<html lang>` (en/tr) in layout. Canonical on `/` + `/questions`; noindex metadata on dashboard/glossary/mock/admin. `.env.example` gains `NEXT_PUBLIC_SITE_URL`. |
| Topic + nav icons | `src/lib/topic-icons.ts` — slug→Lucide map (15 topics, BookOpen fallback for custom/unknown). Homepage topic grid + `/questions` TopicTabs (system tabs + Bookmark tab; custom tabs keep Lock) show icons. Navbar `NavLink` now inline-flex; Questions/Mock/Glossary/Dashboard/Admin links + MobileNav get matching icons. |
| Logo | `src/components/logo.tsx` — iconic mark: question mark whose dot is a checkmark ("questions, answered") on a solid primary disc, mark strokes in `var(--primary-foreground)`. Server-safe; navbar uses `<Logo size={20} />`. `src/app/icon.svg` favicon = same disc version (hardcoded vintage colors + `prefers-color-scheme: dark` variant). Legacy favicon.ico fallback. |
| Course Milestone A — engine foundations | Migration `20260612000001_course_tables.sql` (`units`/`lessons`/`user_lesson_progress`, RLS deny-direct). `src/lib/course/`: `step-schema.ts` (8 step types, dependency-free validator — **no zod**, project stays zero-dep; no shiki either: code renders via existing react-markdown + rehype-highlight), `path-state.ts` (derived lock states), `lesson-queue.ts` (finish-to-pass re-queue, first-try accuracy). Seeder: `data/seed-courses/<topic>/<unit>.json` import (challenge text→UUID resolve, lesson prune). `pnpm course:coverage` script. 3 test suites. First content: `react/unit-01-components-jsx.json` (2 lessons, all 8 step types, 4 challenges). Row types added to `supabase/types.ts`. **Needs `supabase db push` + `pnpm seed`.** |
| Course Milestone C — map UI | `/learn` course grid (SVG progress rings, guest-visible) + `/learn/[topic]` winding map: section bands, unit banners, sine-offset lesson discs with SVG connectors (draw-in for unlocked segments), active-node pulse, staggered pop-in; states from shared `deriveCoursePath` (also reused server-side in `getContinueLearning` — no duplicated unlock logic). `listCourseSummaries` + `getContinueLearning` in `course-data.ts`. Dashboard "Continue learning" card (unit → lesson deep-link). First 2 diagram components: `src/components/course/visuals/` (`component-tree`, `props-flow`; registry + replay button, reduced-motion static) wired to concept `visual` field. Navbar + mobile nav "Learn" link (`GraduationCap`). Player exit/complete CTAs now go to the map. |
| Course Milestone B — lesson player | `/learn/[topic]/lesson/[lessonId]` full player. Deps: `motion` + `canvas-confetti` (lazy). `src/lib/course/motion.ts` (central motion vocabulary), `use-reduced-motion.ts`, `shuffle.ts` (seeded — hydration-safe shuffles). Server: `course-data.ts` (`getCourseUnits`, `getCompletedLessonIds`, `getLessonBundle` — hydrates challenge steps with questions+mock_options), `actions/course.ts` (`recordLessonResult` → lesson progress + `user_question_progress` + Leitner via `saveTopicMastery("mock")`, no schema change). Player: all 8 step types, check→feedback-banner→continue loop, wrong-answer re-queue, shake/pulse, animated progress bar, complete screen (confetti + staggered stats + next-lesson CTA), keyboard 1–5/Enter, `aria-live` feedback, reduced-motion fallbacks everywhere. `i18nCourse` EN/TR. Proxy: `/learn/:path*` matched; only `/learn/*/lesson/*` requires auth (map stays guest-visible for Milestone C). Exit goes to `/dashboard` until the map page lands. |
| Security — challenge whitelist + RLS owner policies | (1) `recordLessonResult` (`actions/course.ts`) now loads the lesson `steps`, builds the legit `questionId` set from its `challenge` steps, and filters the incoming payload (drops foreign/fabricated UUIDs, dedupes) before writing `user_question_progress`/mastery — a tampered client can no longer pollute its own Leitner queue. (2) **NextAuth→Supabase JWT bridge**: `createServerSupabaseClient` (`supabase/server.ts`) mints a short-lived HS256 JWT (`node:crypto`, `sub`=user id, role/aud=authenticated) signed with `SUPABASE_JWT_SECRET`, attached as `Authorization: Bearer`, so `auth.uid()` resolves. Migration `20260615000001_rls_owner_policies.sql` replaces `deny_direct` with owner policies (`auth.uid()=user_id`; `::text` cast for `user_topic_mastery`/`user_lesson_progress`) on all 7 user-owned tables. `custom-topics.ts` + `user-tracking.ts` switched from service-role admin client to the session client (RLS backstop; `.eq(user_id)` kept as defense-in-depth). Service-role paths (course writes, admin, questions bank) unchanged. **Needs `SUPABASE_JWT_SECRET` in `.env.local` + `supabase db push` + manual smoke.** |
| Navbar responsive fix | Bar overflowed off-screen 800–1200px (too many inline items, flex-nowrap). Progressive disclosure: 800–1200px nav links + Dashboard are icon-only (`sr-only min-[1200px]:not-sr-only` keeps accessible names), lang/theme controls collapse into a new `nav-settings.tsx` gear popover (`<1200px`), full labels + inline controls return `>=1200px`. Hamburger unchanged (`<800px`). |
| Guest first-unit trial + local progress | No-login access to the **first unit only**. `proxy.ts` no longer auth-gates `/learn/*/lesson/*` (removed from matcher); the lesson page (`learn/[topic]/lesson/[lessonId]/page.tsx`) allows guests when the lesson is in the course's first unit, else redirects to `/signin`. Guest progress persists in `localStorage` via `src/lib/course/guest-progress.ts` (key `ip:guest-course-progress`, shape = `RecordLessonResultInput` + `completedAt`). `course-map.tsx` derives **sequential** first-unit lock states client-side from localStorage (first not-done lesson active, rest locked); later units link to `/signin` with a "Sign in to start" hint. `lesson-player.tsx` takes `isGuest` and saves to localStorage instead of the server. On first sign-in, `GuestProgressMigrator` (mounted in `layout.tsx` for authed users) calls `migrateGuestProgress` (in `actions/course.ts`) which imports the local entries **only if the account has no existing `user_lesson_progress`** (existing accounts keep their own data), then clears localStorage. Updated guest e2e in `course-lesson.spec.ts`. |

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
- Learning Map / Course experience — spec v3 at `.docs/learning-map-spec.md`, **approved 2026-06-12, in progress**. React-first pilot, Milestones A–E. A (engine) + B (lesson player) + C (map UI) done — see Completed Phases. Now in **Milestone D** — React content batches. Done: unit-01 Components & JSX (2 lessons), unit-02 Props & State (3 lessons, 23 steps, 7 challenges, `props-flow` visual), unit-03 Rendering & Reconciliation (3 lessons, 21 steps, 7 challenges incl. legacy ids 3014/3015/3018, new `vdom-diff` visual), unit-04 Effects & Lifecycle (3 lessons, 18 steps, 4 challenges — react bank has few effect questions; useEffect interview qs live in react-hooks topic, out of pilot scope — new `effect-timeline` visual), unit-05 Hooks Deep Dive (2 lessons, 14 steps, 5 challenges: 214/219/208/221/243, new `hook-rules` visual), unit-06 Events, Context & Data Flow (4 lessons, 26 steps, 11 challenges: events 226/223/230, context 206, redux 238/236/247/3005/246, portals 217/232, new `context-tunnel` visual). unit-07 Performance (2 lessons, 12 steps, 4 challenges: 244/241/248/3013, new `memo-rerender` visual), unit-08 Patterns & Architecture (4 lessons, 34 steps, 19 challenges: JSX techniques 211/231/3002/3011, elements-vs-components 212/3019/3016/3009/3010, class-era 218/3017/3012/250/224, patterns 233/234/242/240/227). unit-09 Testing React (2 lessons, 9 steps, challenge 3003 — RTL philosophy + Jest anatomy), unit-10 Interview Gauntlet (2 lessons, 11 steps, 9 challenges: big-picture 3001/3004/3007/245, comparisons 235/249/237 + element-vs-component quote-variant dupes 3008/3021). **Course totals: 10 units, 27 lessons, 182+ steps, 72 challenges — `pnpm course:coverage` reports react 72/72.** Milestone E done: a11y fixes + notes (`.docs/course-a11y-notes-2026-06-12.md`), `tests/e2e/course-lesson.spec.ts` (map, player, wrong-answer re-queue, finish-to-pass, guest redirect), i18n audit clean (all course UI via `i18nCourse`). Finish-to-pass e2e flake fixed (2026-06-13): `AnimatePresence mode="wait"` keeps the dying step card in DOM with frozen `aria-disabled` feedback props — test now filters options to enabled-only and waits for `[aria-disabled="true"]` to detach after each banner Continue. All 7 specs green.

**Pilot retro (inputs for topic #2):**
- Deviations that stuck: hand-rolled validator (no zod), rehype-highlight (no shiki), exit/complete CTAs → map.
- Challenge texts must match DB byte-for-byte — quote-variant near-duplicates exist in the bank; the coverage script is the guard, always run it after authoring.
- Sweet spot: 5–9 steps/lesson, 2–4 lessons/unit; every lesson ends on 1–3 challenges.
- Deep hook/useEffect interview questions live in the react-hooks topic — TypeScript and Next.js courses will hit the same split; decide coverage scope per course before authoring.
- Authoring loop: `pnpm seed courses` (seconds) + `pnpm course:coverage`; full seed only when questions/options change.

**✅ Pilot signed off (Aaron, 2026-06-13):** full play-through + `pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e` green. Now in **Phase 2 scale-out — TypeScript course (content-only)**, 1 unit per batch: author → `pnpm seed courses` → `pnpm course:coverage` → play-test.

**TypeScript course plan** (bank: 43 modern ids 101–143 + 20 legacy ids 2001–2020 = 63 challenges target):
- unit-01 Fundamentals (foundations) — **done 2026-06-13**: 3 lessons, 20 steps, 8 challenges (2004/2008/2003 · 2002/2001/129 · 105/102). `data/seed-courses/typescript/unit-01-fundamentals.json`. **Needs `pnpm seed courses` + `pnpm course:coverage`.**
- unit-02 Types & Interfaces (foundations) — **done 2026-06-13**: 3 lessons (interfaces · type vs interface vs class · structural typing), 18 steps, 6 challenges (2009/131 · 2013/2007/2010 · 2015). `unit-02-types-interfaces.json`. **Needs `pnpm seed courses` + coverage.**
- unit-03 Unions & Narrowing (core) — **done 2026-06-13**: 4 lessons (union types · ?./??/short-circuit · null checks & ! · any/unknown/never), 23 steps, 10 challenges (107/128 · 2005/2006/124 · 115/126 · 2012/2018/2020). `unit-03-unions-narrowing.json`. **Needs `pnpm seed courses` + coverage.**
- unit-04 Classes & OOP (core) — **done 2026-06-13**: 4 lessons (constructors-inheritance · access-modifiers · abstract-accessors-constants · oop-principles-mixins), 25 steps, 10 challenges (101/112 · 132/123/133 · 119/118/117 · 122/137). `unit-04-classes-oop.json`.
- unit-05 Generics & Type-Level (advanced) — **done 2026-06-13**: 3 lessons (generics-and-index-signatures · conditional-types-and-infer · deriving-types), 8 challenges (104/120 · 2019/121/140 · 134/135/2014). `unit-05-generics-type-level.json`.
- unit-06 Enums, Assertions & Immutability (advanced) — **done 2026-06-13**: 3 lessons (enums · const-assertions-readonly · assertion-functions-overloads), 7 challenges (108/2016 · 2011/111 · 106/125/109). `unit-06-enums-assertions-immutability.json`.
- unit-07 Modules, Declarations & Interop (advanced) — **done 2026-06-13**: 3 lessons (modules-and-dynamic-import · js-libraries-and-declare · decorators-and-currying), 7 challenges (103/136/141 · 138/130 · 113/110). `unit-07-modules-declarations-interop.json`.
- unit-08 Compiler, Tooling & Ecosystem (interview) — **done 2026-06-13**: 3 lessons (compilation-and-erasure · tsconfig-and-build-performance · typescript-in-practice), 7 challenges (139/143 · 127/116/2017 · 2014/142). `unit-08-compiler-tooling-ecosystem.json`.
- **All 8 units authored. Run `pnpm seed courses && pnpm course:coverage` — expect 63/63 TypeScript coverage.**
Same retro rules apply: challenge texts byte-for-byte from seed JSON, 5–9 steps/lesson, lessons end on 1–3 challenges, no new visuals required (concept `visual` optional).

**Course scale-out beyond pilot (state as of 2026-06-14):** Next.js course (8 units, 19 lessons, 42 challenges) and JavaScript course (12 units, 36 lessons, 86 challenges) authored — `concept:coverage` reports 0 untaught concepts for both. Redux course **in progress**.

**Redux course plan** (bank: 35 questions, ids 401–435):
- unit-01 Fundamentals (foundations) — done: 2 lessons, 6 challenges (401/402/403 · 404/405/406).
- unit-02 Reducers, State & Conventions (core) — done: 2 lessons, 5 challenges (413/414 · 411/429/416).
- unit-03 Connecting React & Redux (core) — **done 2026-06-14**: 3 lessons (provider-connect-and-hooks · selectors-and-store-access · context-vs-redux-and-connect-decorator), 7 challenges (415/412 · 418/430/428 · 420/431). `unit-03-react-redux-integration.json` + 3 syllabus concepts.
- unit-04 Async & Middleware (advanced) — **done 2026-06-14**: 4 lessons (side-effects-and-thunk · ajax-requests-and-middleware-choices · composing-the-middleware-pipeline · redux-saga-in-depth), 9 challenges (409/410 · 424/423 · 419/417 · 434/433/426). Uses `order` + `match` step types. `unit-04-async-middleware.json` + 4 syllabus concepts. **Coverage 27/35. Needs `pnpm seed courses` + `pnpm course:coverage` + play-test.**
- unit-05 Tooling, Ecosystem & Comparisons (interview) — **done 2026-06-14**: 3 lessons (redux-devtools · project-structure-and-redux-form · redux-in-the-ecosystem), 8 challenges (407/408 · 425/421/422 · 427/432/435). `unit-05-tooling-ecosystem.json` + 3 syllabus concepts.
- **Redux course COMPLETE: 5 units, 14 lessons, 35 challenges — coverage 35/35. Needs `pnpm seed courses` + `pnpm course:coverage` + play-test.** Syllabus `$comment` updated (no longer WIP). Course scale-out status: React ✓, TypeScript ✓, Next.js ✓, JavaScript ✓, Redux ✓.

**React Hooks course plan** (bank: 29 questions, ids 801–829) — new course, started 2026-06-14. This is the home for the deep hook/useEffect interview questions the React pilot deliberately left out of scope. New dir `data/seed-courses/react-hooks/` + new syllabus `data/syllabi/react-hooks.json` (WIP).
- unit-01 Foundations (foundations) — **done 2026-06-14**: 2 lessons (what-are-hooks · usestate-basics), 5 challenges (801/805 · 802/810/811).
- unit-02 Effects & Lifecycle (core) — **done 2026-06-14**: 2 lessons (useeffect-and-lifecycle · batching-and-rerenders), 4 challenges (806/803 · 807/824).
- unit-03 Refs & the DOM (core) — **done 2026-06-14**: 2 lessons (refs-and-the-dom · useref-vs-usestate), 3 challenges (804/814 · 815).
- unit-04 Context & Reducer (core) — **done 2026-06-14**: 2 lessons (usecontext · usestate-vs-usereducer), 3 challenges (812/827 · 813).
- unit-05 Memoization & Performance (advanced) — **done 2026-06-14**: 2 lessons (usememo-and-usecallback · memo-pitfalls-and-when), 6 challenges (816/817/825 · 818/821/826).
- unit-06 Advanced Patterns & Custom Hooks (interview) — **done 2026-06-14**: 3 lessons (custom-hooks · hooks-vs-hoc-and-class-coverage · effect-escape-hatches), 8 challenges (808/809/829 · 819/820 · 822/823/828).
- **React Hooks course COMPLETE: 6 units, 13 lessons, 29 challenges — coverage 29/29.** Uses match step type (unit-03). Syllabus no longer WIP. **Needs `pnpm seed courses` + `pnpm course:coverage` + play-test.**

**HTML5 course COMPLETE** (bank 601–651, 51 q) — new course authored 2026-06-14. 8 units, 20 lessons, **51/51 coverage**. Dir `data/seed-courses/html5/` + syllabus `data/syllabi/html5.json`. Units: 01 Document Foundations (607/651/631 · 606/603/630 · 604/620), 02 Elements & Text Semantics (608/602 · 610/605/617), 03 Attributes & Metadata (613/616/615 · 611/619/621), 04 Semantic HTML5 (612/614/640 · 622/623/626), 05 Performance/Scripts/SEO (618/632 · 634/645 · 624/628), 06 Storage & Browser APIs (625/627 · 635/647 · 636/646), 07 Media & Graphics (601/642/638 · 644/609/649), 08 Tooling/A11y/Advanced (633/643/650 · 637/629/639 · 648/641). Uses order + match step types. **Needs `pnpm seed courses` + `pnpm course:coverage` + play-test.**

**CSS course COMPLETE** (bank 701–733, 33 q) — new course authored 2026-06-14. 6 units, 16 lessons, **33/33 coverage**. Dir `data/seed-courses/css/` + syllabus `data/syllabi/css.json`. Units: 01 CSS Fundamentals (701/702/713 · 706/711), 02 Selectors & Specificity (704/703 · 721/712), 03 Box Model & Layout (705/727 · 709/722 · 710/720), 04 Modern Layout & Responsive (715/716 · 726/729 · 724/728), 05 Preprocessors & Architecture (707/719 · 708/730 · 732/733), 06 Accessibility/Cross-browser/Techniques (723/725 · 717/714 · 718/731). Uses order + match step types. **Needs `pnpm seed courses` + `pnpm course:coverage` + play-test.**

**Git course COMPLETE** (bank 901–921, 21 q) — 4 units, 10 lessons, **21/21**. `data/seed-courses/git/` + `data/syllabi/git.json`. Units: 01 Fundamentals (901/902 · 903/909), 02 Branching & Collaboration (905/904 · 906/912), 03 Undoing & Rewriting (907/914 · 908/915 · 919/917), 04 Workflows & Advanced (910/911/913 · 916/918 · 920/921). Uses match + order steps. **Needs `pnpm seed courses` + coverage + play-test.**

**Unit Testing course COMPLETE** (bank 1201–1216, 16 q) — 3 units, 7 lessons, **16/16**. `data/seed-courses/unit-testing/` + `data/syllabi/unit-testing.json`. Units: 01 Fundamentals (1202/1204 · 1203/1205), 02 Mocking & What to Test (1201/1207/1208 · 1206/1210), 03 Hard-to-Test & Strategy (1211/1213 · 1212/1216 · 1209/1214/1215). Uses match + order steps.

**Design Patterns course COMPLETE** (bank 1301–1316, 16 q) — 3 units, 6 lessons, **16/16**. `data/seed-courses/design-patterns/` + syllabus. Units: 01 Fundamentals & Creational (1301/1303 · 1302/1305/1315), 02 Structural (1307/1312/1311 · 1309/1313/1306), 03 Behavioral & Practice (1304/1308/1310 · 1314/1316). Uses match + fill_blank steps.

**WebSockets course COMPLETE** (bank 1101–1118, 18 q) — 3 units, 7 lessons, **18/18**. `data/seed-courses/websockets/` + syllabus. Units: 01 Real-time Foundations (1101/1102 · 1103/1104/1105), 02 WS vs Alternatives (1106/1107/1110 · 1108/1109 · 1111/1112), 03 Production & Protocol (1113/1114/1115 · 1116/1117/1118). Uses order steps.

**Agile & Scrum course COMPLETE** (bank 1001–1027, 27 q) — 5 units, 10 lessons, **27/27**. `data/seed-courses/agile-scrum/` + syllabus. Units: 01 Agile Foundations (1001/1004/1025 · 1011/1020), 02 Scrum Framework (1002/1023/1018 · 1019/1006/1021), 03 Sprints & Events (1003/1007/1008 · 1014/1015/1022), 04 Backlog & Work Items (1005/1009/1013 · 1012/1010), 05 Metrics/Flow/Practices (1016/1017 · 1027/1026/1024). Uses order + match steps.

**Software Architecture course COMPLETE** (bank 1401–1494, 94 q) — 13 units, 40 lessons, **94/94**. `data/seed-courses/software-architecture/` + syllabus. Units: 01 Design Principles/SOLID, 02 Quality & Smells, 03 Layered & Clean, 04 Structuring & Architect, 05 DDD, 06 Architecture Styles (mono/SOA/micro), 07 Repository & UoW, 08 CQRS & Event Sourcing, 09 Scalability & Load Balancing, 10 Distributed & Consistency, 11 Resilience & Concurrency, 12 Performance/Caching/Ops, 13 Testing/Real-time/Applied. Syllabus auto-generated from unit files.

**API Design course COMPLETE** (bank 1501–1547, 47 q) — 8 units, 21 lessons, **47/47**. `data/seed-courses/api-design/` + syllabus. Units: 01 REST Fundamentals, 02 Styles & Protocols (REST/GraphQL/SOAP/tRPC), 03 Auth & Security, 04 Reliability (rate limiting/idempotency), 05 Versioning & Docs, 06 Data Handling (pagination/caching/N+1/uploads/search), 07 Architecture Patterns (BFF/gateway/EDA), 08 Real-time/GraphQL/Practice. Syllabus auto-generated from unit files.

**🎉 COURSE SCALE-OUT COMPLETE — ALL 15 TOPICS HAVE COURSES (2026-06-14):** React ✓, TypeScript ✓, Next.js ✓, JavaScript ✓, Redux ✓ (35/35), React Hooks ✓ (29/29), HTML5 ✓ (51/51), CSS ✓ (33/33), Git ✓ (21/21), Unit Testing ✓ (16/16), Design Patterns ✓ (16/16), WebSockets ✓ (18/18), Agile & Scrum ✓ (27/27), Software Architecture ✓ (94/94), API Design ✓ (47/47). Every topic in the question bank now has a full interview-prep course. Run `pnpm seed courses && pnpm course:coverage` to seed + verify all.

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
