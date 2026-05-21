# Curated React question list

Source: `data/raw/react-questions-source.md` (92 questions, FullStack.Cafe /
sudheerj / Pau1fitz style dump). This file records the dedupe decisions and
the import worklist — the React counterpart of `curated-typescript.md`.

Rules applied:

- Duplicates / same-answer questions are merged into one canonical entry.
- The 3 source star-tiers (entry / mid / senior) are mapped onto the app's
  5 levels by judgement; the mapping is recorded below and can be adjusted.
- All answers are written fresh in Aaron's voice, modern (hooks-era) where
  the source phrasing is dated. Source answers were treated as reference only.

## Already in the app (20 — Phase 1/2/3)

Source IDs already seeded (`seed-react.json`, ids 1–20):
Q1, Q2, Q3, Q4, Q14, Q15, Q16, Q17, Q18, Q19, Q60, Q61, Q62, Q63, Q64, Q65,
Q66, Q67, Q68, Q69 — what is React, inline style, Jest, advantages, Flux,
error boundaries (15), limitations, Element vs Component, stateful, stateless,
createElement vs cloneElement, avoiding bind, render-method limits, keys,
list rendering, render method, method binding, reconciliation, Element vs
Component (senior), StrictMode.

## New questions to add (50)  →  react-batch-1 … react-batch-9, ids 201–250

### Level 1 — Entry (5)  →  react-batch-1 (ids 201–205)

| id | Question | Source |
| --- | --- | --- |
| 201 | How do you write comments in JSX? | Q5 |
| 202 | What is the virtual DOM? | Q7 |
| 203 | What are props in React? | Q10 (+ Q13, Q52 merged) |
| 204 | What are the major features of React? | Q11 |
| 205 | What is JSX? | Q46 |

### Level 2 — Junior (11)  →  react-batch-2, react-batch-3 (ids 206–216)

| id | Question | Source |
| --- | --- | --- |
| 206 | What is context in React? | Q6 |
| 207 | How does React work? | Q8 |
| 208 | What are refs and what are they used for? | Q9 (+ Q42 merged) |
| 209 | What are fragments? | Q21 |
| 210 | Why is it necessary to capitalize component names? | Q22 |
| 211 | What are inline conditional expressions in JSX? | Q36 |
| 212 | How do you create components in React? | Q44 |
| 213 | What is useState() in React? | Q70 |
| 214 | What are React Hooks (and their advantages)? | Q74 (+ Q76 merged) |
| 215 | What is the difference between state and props? | Q35 (+ Q40 merged) |
| 216 | What is state in React? | Q41 (+ Q83 merged) |

### Level 3 — Mid (16)  →  react-batch-4, 5, 6 (ids 217–232)

| id | Question | Source |
| --- | --- | --- |
| 217 | What are portals in React? | Q20 |
| 218 | What is the purpose of calling super(props)? | Q24 |
| 219 | What is the difference between class and function components? | Q25 + Q32 merged |
| 220 | What are controlled components? | Q28 (+ Q82 merged) |
| 221 | How do you create refs in React? | Q31 |
| 222 | What is the React component lifecycle? | Q34 (+ Q80 merged) |
| 223 | How do you pass a parameter to an event handler? | Q37 |
| 224 | What is the purpose of the callback argument of setState? | Q38 |
| 225 | What happens when you call setState? | Q39 (+ Q56 merged) |
| 226 | How are events handled in React? | Q47 |
| 227 | Where should you make an AJAX request in a component? | Q48 |
| 228 | Difference between controlled and uncontrolled components? | Q57 |
| 229 | How would you prevent a component from rendering? | Q58 |
| 230 | How do you prevent the default behavior of an event? | Q59 |
| 231 | What do the three dots (...) do in React? | Q77 |
| 232 | What is ReactDOM? | Q75 |

### Level 4 — Senior (12)  →  react-batch-7, 8 (ids 233–244)

| id | Question | Source |
| --- | --- | --- |
| 233 | What are higher-order components? | Q27 (+ Q85 merged) |
| 234 | Difference between presentational and container components? | Q29 (+ Q49, Q79 merged) |
| 235 | How is React different from AngularJS? | Q33 |
| 236 | Where is state kept in a React + Redux application? | Q50 |
| 237 | What is the difference between React and React Native? | Q51 |
| 238 | What is the point of Redux? | Q53 |
| 239 | What does it mean for a component to be mounted? | Q54 |
| 240 | What is Flow? | Q55 |
| 241 | What is the point of shouldComponentUpdate()? | Q71 |
| 242 | What are PropTypes in React? | Q72 |
| 243 | What is the difference between useRef and createRef? | Q73 |
| 244 | What are Pure Components? | Q90 |

### Level 5 — Expert (6)  →  react-batch-9 (ids 245–250)

| id | Question | Source |
| --- | --- | --- |
| 245 | What do you like about React? (opinion) | Q30 |
| 246 | Typical middleware for async calls in Redux? | Q78 |
| 247 | What is the typical data flow in a React + Redux app? | Q81 |
| 248 | How do you build React in production mode? | Q84 |
| 249 | What are the advantages of React over Vue? | Q87 |
| 250 | What are the advantages of using arrow functions in React? | Q88 |

## Merged — folded into a canonical entry above

| Source | Merged into | Reason |
| --- | --- | --- |
| Q13 | 203 | "props in React" — same as Q10 |
| Q52 | 203 | "pass a property parent to child" — props usage |
| Q42 | 208 | "what are refs used for" — same as Q9 |
| Q76 | 214 | "advantages of hooks" — same topic as Q74 |
| Q40 | 215 | "state vs props" — exact duplicate of Q35 |
| Q83 | 216 | "what is state" — same as Q41 |
| Q32 | 219 | "class vs functional differences" — same topic as Q25 |
| Q82 | 220 | "controlled components" — same as Q28 |
| Q80 | 222 | "lifecycle methods" — same topic as Q34 |
| Q56 | 225 | "what happens on setState" — duplicate of Q39 |
| Q85 | 233 | "higher order component" — same as Q27 |
| Q49 | 234 | "component vs container (Redux)" — container pattern |
| Q79 | 234 | "smart vs dumb component" — container pattern |

## Dropped — duplicates of questions already in the app, or unanswerable

| Source | Reason |
| --- | --- |
| Q12 | "What is ReactJS" — same as seeded Q1 |
| Q23 | "What is reconciliation" — same as seeded Q67 |
| Q26 | "advantages of using React" — same as seeded Q4 |
| Q43 | "key when rendering a list" — same as seeded Q63 |
| Q45 | "Element vs Component" — same as seeded Q17 / Q68 |
| Q86 | "createElement vs cloneElement" — same as seeded Q60 |
| Q89 | "error boundaries (16)" — same topic as seeded Q15 |
| Q92 | "stateless components" — same as seeded Q19 |
| Q91 | "identify two problems" — references code not in the dump |

Totals: 92 source → 20 already seeded · 50 new · 13 merged into a canonical
entry · 9 dropped. Curated React bank = **70 questions**.

Status (2026-05-21): all 9 batches written to `data/seed-questions/` and
complete — `answerGeneral` + `answerGeneralTr` + `detailMd` deep dives for
every question (ids 201–250). `detailMdTr` (Turkish deep dive) is unset;
an optional TR pass would fill it.
