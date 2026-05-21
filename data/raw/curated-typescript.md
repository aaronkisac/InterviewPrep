# Curated TypeScript question list

Source: `data/raw/typescript-questions-source.json` (81 questions, FullStack.Cafe
style dump). This file records the dedupe decisions and the import worklist.

Rules applied:

- Duplicates / same-answer questions are merged into one canonical entry.
- Where a merged-away question has a genuinely different *phrasing*, it is kept
  here as a **variant note** so the wording is not lost.
- All answers are written fresh in Aaron's voice. Source answers (where they
  existed) were treated only as reference for the expected shape of an answer.

## Already in the app (20 — done in Phase 1/2)

Source IDs already seeded: 1, 2, 3, 4, 12, 20, 24, 28, 29, 32, 35, 39, 51, 53,
56, 58, 60, 64, 65, 66 — `.ts/.tsx`, compiling, benefits, TS vs JS, optional
chaining, nullish coalescing, classes vs interfaces, TS vs JS differences,
interface, interfaces vs classes, const assertion, never/unknown/any,
type vs interface, function overloading, structural typing, enum vs const enum,
currying, unknown vs any, infer, never datatype.

## New questions to add (43)

Status (2026-05-21): all 9 batches written to `data/seed-questions/` and
complete — `answerGeneral` + `answerGeneralTr` + `detailMd` deep dives for
every question (ids 101–143). `detailMdTr` (Turkish deep dive) is unset
across all batches; an optional TR pass would fill it.

### Level 1 — Entry (5)  →  batch-1  ✅ full

| # | Question | Source |
| --- | --- | --- |
| TS-N1 | How to call a base class constructor from a child class | #5 |
| TS-N2 | How do you perform string interpolation | #8 |
| TS-N3 | What are modules in TypeScript | #9 (+ #59 "expose a class outside its module" = `export` it) |
| TS-N4 | Explain generics in TypeScript | #10 |
| TS-N5 | List the built-in types in TypeScript | #11 |

### Level 2 — Junior (14)  →  batch-2, batch-3, batch-4  ✅ full (ids 106–119)

| # | Question | Source |
| --- | --- | --- |
| TS-N6 | How to make read-only arrays and tuples | #14 (+ #43 readonly tuple) |
| TS-N7 | What does the pipe `|` mean (union types) | #16 |
| TS-N8 | How to create a string enum | #17 (variant: #78 `declare enum` vs `declare const enum`) |
| TS-N9 | Difference between `String` and `string` | #18 |
| TS-N10 | What is a TypeScript `.map` (declaration map) file | #19 |
| TS-N11 | What are assertion functions | #21 |
| TS-N12 | Default / implied access modifier (`public`) | #22 (+ #48 same question) |
| TS-N13 | What is type erasure | #23 |
| TS-N14 | What are decorators | #25 (+ #40 property decorators) |
| TS-N15 | How to check for `null` and `undefined` | #26 |
| TS-N16 | Can TypeScript run on the backend | #27 |
| TS-N17 | Which OOP principles does TypeScript support | #30 (+ #34 same question) |
| TS-N18 | How to implement class constants | #31 |
| TS-N19 | What are getters and setters | #33 |

### Level 3 — Mid (14)  →  batch-5, batch-6, batch-7  ✅ full (ids 120–133)

| # | Question | Source |
| --- | --- | --- |
| TS-N20 | What are conditional types | #15 |
| TS-N21 | What are template literal types | #36 |
| TS-N22 | What are mixins | #37 (+ #69 Mixin Constructor Type) |
| TS-N23 | Private `#` fields vs the `private` keyword | #38 (+ #79 same comparison) |
| TS-N24 | What does short-circuiting mean | #41 |
| TS-N25 | What is `unique symbol` used for | #42 |
| TS-N26 | Optional chaining `?.` vs non-null assertion `!` | #44 |
| TS-N27 | What are project references | #45 |
| TS-N28 | How to check a variable's type at runtime | #46 |
| TS-N29 | What are the components of TypeScript (compiler, language service) | #49 |
| TS-N30 | How to use plain JS libraries / `@types` / typings | #50 (+ #55 typings, + #72 generating `.d.ts`) |
| TS-N31 | How to extend an interface from another | #52 |
| TS-N32 | `private` vs `protected` | #54 |
| TS-N33 | Why use the `abstract` keyword | #57 |

### Level 4 — Senior (4)  →  batch-8  ✅ full (ids 134–137)

| # | Question | Source |
| --- | --- | --- |
| TS-N34 | How to exclude a property from a type (`Omit`, utility types) | #61 |
| TS-N35 | What are index signatures (how and why) | #62 (+ #63 same topic) |
| TS-N36 | What is a dynamic `import()` expression | #67 |
| TS-N37 | How does the `override` keyword work | #70 |

### Level 5 — Expert (6)  →  batch-9  ✅ full (ids 138–143)

| # | Question | Source |
| --- | --- | --- |
| TS-N38 | When to use the `declare` keyword / ambient declarations | #71 (+ #75 ambients) |
| TS-N39 | What does the tsconfig `lib` option do | #73 |
| TS-N40 | How to build a union from a type/interface's properties (`keyof`) | #74 |
| TS-N41 | What is the benefit of import attributes / assertions | #76 |
| TS-N42 | What would you change about TypeScript (opinion) | #77 |
| TS-N43 | What is the `--incremental` flag for | #81 |

## Dropped — duplicates of questions already in the app

| Source | Reason |
| --- | --- |
| #6, #7 | "What is TypeScript / why use it" — same as done #3, #4 |
| #13 | "How to use optional chaining" — same as done #12 (optional chaining) |
| #47 | "How TS is optionally statically typed" — covered by TS vs JS / benefits |
| #68 | "interface vs type statements" — same as done #51 (type vs interface) |
| #78 | "declare enum vs declare const enum" — covered by done enum question + TS-N8 note |
| #80 | "How the never datatype can be useful" — same as done #66 (never datatype) |

Totals: 81 source → 20 already done · 43 new · 11 merged into a canonical
entry · 7 dropped as duplicates. Curated TypeScript bank = **63 questions**.
