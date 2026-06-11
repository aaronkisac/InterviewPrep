# Learning Map — Feature Spec (v3)

Duolingo-style **course experience**: each topic taught from zero to expert through a hand-crafted curriculum of lessons, interactive exercises, instant feedback and animations. The existing interview question bank is *one input* to the curriculum, not its skeleton. Status: **draft v3, awaiting approval**. Date: 2026-06-12.

> v2 → v3 changes: (1) **React-first pilot strategy** — the React course ships complete, end to end, before any other topic is started; (2) new **Visual Design & Animation** section specifying exactly how visuals and motion are built.

---

## Problem Statement

The app tests knowledge but doesn't build it. A learner who doesn't already know React can't use the app to learn React — questions assume the concept is known. The goal is a Duolingo-grade course per topic: a curriculum that teaches every core concept from first principles, exercises with immediate feedback, and a path that ends with the learner able to answer every interview question in the bank because they actually understand the material.

## Pilot Strategy — React First, End to End

Everything below ships for **React only** until the pilot is declared done. No second topic is started before that. Rationale: content authoring is the dominant cost (~400–500 steps per topic); the engine, step types, motion design and content format will all change shape during the pilot — locking them against one finished course avoids reworking 14 topics' content.

**Pilot definition of done:**

1. All engine pieces live (schema, seeder, player, map, progress, animations)
2. React course content complete: ~10 units, ~35–40 lessons, every one of the 70 React questions mapped as a challenge step (`pnpm course:coverage` reports zero unassigned React ids)
3. EN + TR for every step
4. a11y pass (player + map), e2e green, play-tested start to finish by Aaron
5. PROGRESS.md retro: what changes in the content format / step types before topic #2

Only after sign-off: Phase 2 scales to other topics (TypeScript, Next.js first), where the work is *content only* — the engine doesn't change.

## Goals

- Someone with zero knowledge of a topic can complete its path and come out interview-ready — the curriculum *teaches*, the question bank *verifies*.
- Every existing interview question is reachable from the path (mapped into the lesson that teaches its concept) — finishing the course implies full bank coverage.
- Lessons feel like Duolingo: short steps, one interaction per screen, instant right/wrong feedback with explanation, satisfying motion.
- Reuse existing machinery where it fits (Leitner, `mock_sessions` stats, i18n, auth, admin patterns) — but the lesson player is a new, purpose-built surface.

## Non-Goals (v1 of this feature)

- **Streaks, XP, leagues, hearts/lives** — Phase 3. The lesson loop must be fun without them first.
- **Audio/speech exercises, AI-generated lessons, mascot character** — not planned.
- **Custom topics** — system topics only.
- **Any topic other than React** until the pilot is done (see above).

## Course Structure (content model)

```
Course (topic) → Units (ordered, sectioned by difficulty) → Lessons (ordered) → Steps
```

- **Unit** = one coherent concept area. React draft curriculum (~10 units, refined during authoring):
  1. Components & JSX *(foundations)*
  2. Props & State *(foundations)*
  3. Rendering & Reconciliation *(core)*
  4. Effects & Lifecycle *(core)*
  5. Hooks Deep Dive *(core)*
  6. Context & Data Flow *(core)*
  7. Performance *(advanced)*
  8. Patterns & Architecture *(advanced)*
  9. Testing React *(advanced)*
  10. Interview Gauntlet *(interview — challenge-heavy recap)*
- **Lesson** = 5–10 minute session, 8–14 steps, one narrow idea (e.g. "Why keys matter in lists").
- **Step** = one screen. Types:

| Step type | Interaction | Source |
| --- | --- | --- |
| `concept` | Short teaching card (markdown, code snippet, optional diagram) — "Continue" | authored |
| `mcq` | Multiple choice, 4 options | authored, or imported from `mock_options` |
| `true_false` | Binary choice with explanation | authored |
| `fill_blank` | Tap-to-fill missing token(s) in a code snippet (word bank) | authored |
| `output_predict` | "What does this code print/render?" — MCQ over outputs | authored |
| `order` | Arrange lines/steps into correct sequence (e.g. lifecycle order) | authored |
| `match` | Match pairs (term ↔ definition, hook ↔ use case) | authored, glossary-assisted |
| `challenge` | A real interview question from the bank, framed as a boss-step | `questions` + `mock_options` |

Every lesson ends with 1–3 `challenge` steps — this is how the interview bank maps onto the curriculum. `pnpm course:coverage` verifies every question id is assigned to some lesson.

### Step content storage

Steps are JSONB on the lesson row (ordered array, discriminated by `type`). Step shapes vary per type, are always fetched as a whole lesson, never queried individually — a Zod schema in `src/lib/course/step-schema.ts` validates at seed time and gives the player full type safety. EN+TR fields side by side (`prompt`, `promptTr`, …), consistent with the question schema. Concept steps may reference a named diagram: `visual: "component-tree"` (see Visual Design below).

## Data Model

```sql
create table units (
  id          uuid primary key default gen_random_uuid(),
  topic_slug  text not null references system_topics(slug) on delete cascade,
  slug        text not null,
  title       text not null,
  title_tr    text not null,
  section     text not null,          -- foundations | core | advanced | interview
  position    int  not null,
  unique (topic_slug, slug),
  unique (topic_slug, position)
);

create table lessons (
  id          uuid primary key default gen_random_uuid(),
  unit_id     uuid not null references units(id) on delete cascade,
  slug        text not null,
  title       text not null,
  title_tr    text not null,
  position    int  not null,
  steps       jsonb not null,         -- validated step array (Zod at seed time)
  unique (unit_id, slug),
  unique (unit_id, position)
);

create table user_lesson_progress (
  user_id      text not null,
  lesson_id    uuid not null references lessons(id) on delete cascade,
  best_pct     int  not null default 0,   -- correct interactions / total interactions
  attempts     int  not null default 0,
  completed_at timestamptz,               -- set on first finish — see unlock rules
  updated_at   timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
```

All RLS deny-direct + service-role server actions (existing pattern). `challenge` steps also record into `user_topic_mastery` so Leitner review keeps working over the bank.

**Seed flow**: `data/seed-courses/<topic>/<unit-slug>.json` (one file per unit: unit meta + lessons + steps) → `pnpm seed` upserts by slugs. `challenge` steps reference questions by seed id, resolved to UUIDs at import (mock-options seeder pattern).

## Unlock & Progression Rules

- Lessons inside a unit unlock sequentially; a lesson is "passed" by *finishing* it (Duolingo model — wrong answers re-queue at the end of the lesson until answered correctly, so finishing implies seeing everything right at least once).
- Wrong answer ⇒ that step is pushed to the back of the lesson queue; lesson ends only when the queue is empty.
- A unit unlocks when the previous unit's lessons are all completed.
- Completed lessons are replayable (best_pct can improve).
- Derived, never stored: lock state computed in `src/lib/course/path-state.ts` (pure + unit-tested).
- **Decay (Phase 2)**: unit node shows a "review" ring when >50% of its challenge questions are Leitner-due; tapping starts a review lesson generated from those questions.

## Visual Design & Animation

### Stack

| Layer | Tool | Why |
| --- | --- | --- |
| Springs, layout & exit animations | **`motion`** (framer-motion successor, `motion/react`) | Spring physics, `AnimatePresence` for step transitions, ~18kb used subset, lazy-loaded only in `/learn` routes |
| Celebration | **`canvas-confetti`** | 5kb, fire-and-forget, no React tree cost |
| Simple state transitions (hover, focus, color) | Tailwind v4 transitions | Already in use (`card-lift` etc.); no JS needed |
| Code snippets in steps | **`shiki`** at seed time | Highlight once at import, store HTML in step JSON → zero client cost, theme via existing CSS vars |
| Diagrams in concept steps | Hand-built **inline SVG React components** | See "Concept visuals" below |
| Icons | `lucide-react` | Already in the project (`topic-icons.ts`) |

Two new runtime deps total (`motion`, `canvas-confetti`); `shiki` is dev/seed-time only.

### Motion spec (the Duolingo feel, concretely)

| Element | Trigger | Animation | Timing | Reduced-motion fallback |
| --- | --- | --- | --- | --- |
| Step transition | answer confirmed → next step | current step slides out left + fades, next slides in from right (`AnimatePresence mode="wait"`) | spring, ~300ms | instant swap |
| Progress bar | step completed | width animates to new % | spring (stiffness 120) | width jump |
| Feedback banner | answer submitted | slides up from bottom; green (correct) / red (wrong) bg + icon | 250ms ease-out | appears in place |
| Wrong option | wrong answer | horizontal shake on the chosen option, `x: [0,-8,8,-4,4,0]` | 400ms | red border only |
| Correct option | any answer | scale pulse 1→1.06→1 + ring on the correct option | 350ms | green ring only |
| Word-bank token (`fill_blank`) | tap | token flies from bank into the blank (`layoutId` shared layout) | spring | teleports |
| `match` pair resolved | correct pair | both cards pulse then fade to "done" state | 300ms | opacity change |
| Lesson complete | queue empty | confetti burst (2 origins), accuracy number counts up from 0, stats cards stagger in (80ms apart) | ~1.2s total | static screen, no confetti |
| Map: active node | idle on map | soft scale pulse 1→1.04 loop | 2s loop | static highlight ring |
| Map: unlock | returning to map after pass | path segment draws in (SVG `stroke-dashoffset` → 0), then new node pops in (spring scale 0→1, slight overshoot) | 600ms + 300ms | both appear instantly |
| Map: completed node | render | filled disc + checkmark draw-in on first view | 300ms | static check |

All gated behind a single `usePrefersReducedMotion()` hook; durations/easings centralized in `src/lib/course/motion.ts` so the feel is tuned in one place.

### Map visual design

- Vertical winding path: nodes alternate left/center/right on a sine-like curve, connected by an SVG path (one `<path>` per segment so unlock can animate per segment).
- **Unit node** = large disc (56–64px) with the unit's icon; section bands separated by full-width headers (`foundations` / `core` / `advanced` / `interview`) using the existing topic color scheme.
- **Lesson bubbles** = small discs branching off their unit node (Duolingo-style cluster); states: locked (muted, lock icon), active (primary, pulsing), done (filled, check), decayed (Phase 2: cracked ring).
- Theme-aware via existing CSS vars (light/dark already handled); no new color system.
- Nodes are real `<button>`s; state communicated by icon + `aria-label` text, never color alone.

### Concept visuals (diagrams)

No illustrator and no AI image pipeline — diagrams are a small library of **reusable, hand-built SVG components** in `src/components/course/visuals/`, referenced from step JSON by name (`visual: "component-tree"`). Initial set for React (~8 diagrams, each <100 lines of SVG):

`component-tree`, `props-flow` (one-way data flow), `state-update-cycle`, `vdom-diff` (reconciliation before/after), `effect-timeline` (render → commit → effect), `context-tunnel`, `memo-rerender` (what re-renders without/with memo), `hook-rules` (call-order visual).

They animate too (build-in on mount: elements fade/draw in sequence via `motion`, 1–2s, replayable via a small replay button) — this is the "explainer" feel. Each diagram takes theme colors from CSS vars and has a text alternative (`aria-describedby` paragraph from step JSON). New topics reuse the pattern with their own small set.

### Player layout

Full-screen route, navbar hidden: top bar (exit ✕ → confirm dialog if mid-lesson, progress bar), centered step card (max-w-xl), bottom action area (option grid / word bank / check button → feedback banner replaces it when answered). Mobile-first; on desktop the step card simply centers in more whitespace. Keyboard: 1–4 select options, Enter confirms, full focus order; `aria-live="polite"` on the feedback banner.

## Routes

| Route | Purpose |
| --- | --- |
| `/learn` | Course grid with progress rings (React only during pilot) |
| `/learn/[topic]` | Vertical map: sections → unit nodes → lesson bubbles |
| `/learn/[topic]/lesson/[lessonId]` | Lesson player (auth required; guests see map read-only, player redirects to `/signin`) |

Dashboard gets a "Continue learning" card (active lesson deep-link). Existing `/questions`, `/mock`, `/glossary` are untouched — the course is an additional surface, mock stays as "exam simulation".

## Requirements — Phase 1 (React pilot, P0)

**Milestone A — Engine foundations (no UI)**
- [ ] Migration: `units`, `lessons`, `user_lesson_progress`
- [ ] `step-schema.ts` (Zod, 8 step types, EN/TR) + seed importer for `data/seed-courses/` + shiki highlight at import
- [ ] `pnpm course:coverage` script (unassigned question ids per topic)
- [ ] `path-state.ts` unlock derivation + lesson-queue reducer (re-queue on wrong) — both pure, unit-tested

**Milestone B — Lesson player**
- [ ] All 8 step types rendered + answered, feedback banner, progress bar, motion spec implemented, complete screen + confetti, reduced-motion paths
- [ ] Built against a hand-written fixture unit (`react/unit-0-fixture.json`) before real content
- [ ] Server actions: `getCoursePath`, `getLesson`, `recordLessonResult` (writes `user_topic_mastery` for challenge steps)

**Milestone C — Map + integration**
- [ ] `/learn`, `/learn/[topic]` with node states, SVG path, unlock animation
- [ ] Dashboard "Continue learning" card; guest read-only map
- [ ] First 2 diagram components + diagram animation pattern established

**Milestone D — React content (10 batches, 1 unit per batch)**
- [ ] Each batch: author unit JSON (lessons + steps + TR) → seed → play-test → adjust
- [ ] All 70 React questions mapped as challenges; coverage report clean
- [ ] Remaining diagrams authored alongside the units that need them

**Milestone E — Hardening**
- [ ] a11y pass (player + map), e2e `course-lesson.spec.ts` (happy path + re-queue), i18n audit
- [ ] Pilot retro in PROGRESS.md → sign-off gate for Phase 2

**Acceptance (core loop)**: Given a user starting lesson 1, when they answer a step wrong, then the red banner explains the answer and the step reappears before the lesson can end; when the queue empties, then the complete screen shows accuracy and the next lesson unlocks with an animation; given `prefers-reduced-motion`, then no confetti/shake plays and all state changes are instant.

## Phase 2 — Scale-out (after pilot sign-off)

- Courses for remaining 14 topics, content-only batches (TypeScript, Next.js first), each with its own small diagram set
- `/admin/courses` CRUD + JSON import (mirrors `/admin/topics`)
- Decay review rings + generated review lessons (Leitner integration on the map)
- Per-unit stars from `best_pct` aggregates

## Phase 3 — Gamification & extras

- Streaks + daily goal + XP (additive `activity_log` table; `recordLessonResult` designed so this is a pure add)
- Checkpoint "test out" nodes (skip a section by passing a gauntlet)
- Sound effects (opt-in), custom topic auto-courses

## Success Signals

Lesson completion rate (started → finished), % of question bank reached via challenge steps, and 7-day return rate of users with ≥1 completed lesson — all derivable from `user_lesson_progress` timestamps.

## Open Questions

1. **Finish-to-pass confirmed?** Re-queue until correct, no fail state (Duolingo model). Default stands unless objected. *(Aaron)*
2. **Pilot content rhythm**: 10 batches ≈ 10 working sessions for React content. Vertical-slice alternative: ship Milestones A–C + units 1–3, open `/learn` early, keep authoring. Preference? *(Aaron)*

## Order of Work

Milestones A → B → C → D (batched) → E, strictly in order; B starts against fixture content so content authoring (D) can overlap C. Local steps after merge: `supabase db push` + `pnpm seed`.
