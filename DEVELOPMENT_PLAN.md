# Development Plan

Date: 2026-06-10 · Based on full project review (src, migrations, tests, CI, PROGRESS.md)

## Current state (summary)

The app is content-complete and feature-rich: 15 topics, ~600 questions with full EN/TR coverage, mock sessions, flashcards, glossary with auto-tooltips, dashboard with tracking, custom topics, admin panel, guest restrictions, RLS, Playwright e2e + CI. Code quality is good — strict TS, clean server/client separation, sensible caching.

The gaps are not in features. They are in **shipping, resilience, and testing**.

---

## P0 — Ship it (the app is "deployable" but not deployed)

1. **Deploy to production.** Vercel + production Supabase project. Run `supabase db push` + `pnpm seed` against prod. Add prod env vars + OAuth redirect URLs (Google/GitHub). This is the single highest-value step — a live URL is also a portfolio asset for the job search.
2. **Repo hygiene.**
   - Delete tracked junk: `_tmp_17_*` files (2 tracked, empty), `tsconfig.check.tsbuildinfo`.
   - Commit or revert the 4 dirty files (`layout.tsx`, `tsconfig.json`, `HISTORY.md`, `.claudeignore`).
   - Add `*.tsbuildinfo` to `.gitignore` explicitly.
3. **Harden `next.config.ts`** (currently empty): security headers (CSP, X-Frame-Options, Referrer-Policy), `poweredByHeader: false`.

## P1 — Resilience & testing

4. **Error boundaries.** There are zero `error.tsx` files. Add root `global-error.tsx`, a root `not-found.tsx`, and `error.tsx` for `/questions`, `/mock`, `/dashboard`, `/admin`. Server actions that `throw` currently produce blank crashes.
5. **Unit tests (Vitest + RTL).** Only e2e exists today. Pure-logic targets first — cheap to test, high regression value:
   - `mock-scoring.ts`, `grade.ts`, `glossary-match.ts`, `mock-shared.ts` (`parseTopicList`), `questions.ts` parse helpers, `validation/question-import.ts`
   - Then key components: `QuestionCard`, `MockSession` answer flow, `LangToggle`
6. **CI: fast-fail jobs.** `e2e.yml` only runs Playwright. Add a `lint + typecheck + unit` job that runs first (e2e is 20 min; typecheck catches most breaks in 1 min).
7. **Lock down the language toggle.** Last 6 commits are repeated refactors of the same toggle — a sign it's fragile. Add an e2e spec asserting: toggle → cookie set → server components re-render in TR → persists across navigation.

## P2 — UX & performance

8. **Pagination on `/questions`.** The list loads every matching question (~600). Add server-side pagination or "load more" (range queries are already easy with Supabase).
9. **Better search.** Current search is `ilike` on `question` only. Add Supabase full-text search across `question + answer_general + detail_md` with a `tsvector` column + GIN index (one migration).
10. **Cache invalidation by tag.** `unstable_cache` uses time-based revalidation only — an admin-approved question won't appear for up to 1h. Tag the caches (`questions-list`, `topic-stats`, `question-by-id`) and call `revalidateTag` from `approveQuestion`, admin import, and seed-affecting actions.
11. **Accessibility pass (WCAG 2.1 AA).** Keyboard-only run through mock session (option selection, focus after answer reveal), `aria-live` on score updates, tooltip keyboard access, contrast check on both themes. This also reinforces the a11y story on the CV.

## P3 — Learning features (the actual differentiators)

12. **Spaced repetition.** `user_question_progress` already exists — add a Leitner-box review queue: "Review due today" on the dashboard, wrong answers resurface sooner.
13. **Weak-spot mock mode.** "Retry only questions I got wrong" + per-topic accuracy breakdown on the end screen.
14. **Mock timer mode.** Optional per-question countdown (interview realism) + time-per-question stats stored in `mock_sessions`.
15. **Dashboard progress chart.** Accuracy/sessions over time — data is already in `mock_sessions`.
16. **`answerPersonal` content.** Flagged in PROGRESS.md as the main content gap. Write personal answers from real experience for the top ~30 questions (Butlin's App Router migration/LCP, component library, Jest+RTL coverage, ReciteMe/WCAG). Highest interview-prep value per hour of any item on this list.

## P4 — Nice-to-haves

17. PWA/offline support for studying on the move.
18. "Question of the day" (email or dashboard widget).
19. Export custom topics to Anki/CSV.

---

## Suggested order

P0 (one sitting) → P1 items 4–6 (one sitting) → P2 item 8+10 → then alternate P3 features with P2 polish. Item 16 (`answerPersonal`) is independent — can be done any time in small batches, React questions first.
