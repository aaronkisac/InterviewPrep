# Seed & Migration Test Checklist

Run this after `supabase db push` + `pnpm seed`.

---

## 1. Migration — DB constraints

- [ ] `supabase db push` exits with no errors
- [ ] Supabase Studio → Table Editor → `questions` → check `topic` column constraints include all 13 values: `react`, `typescript`, `nextjs`, `redux`, `javascript`, `html5`, `css`, `react-hooks`, `git`, `agile-scrum`, `websockets`, `unit-testing`, `design-patterns`
- [ ] Same check on `terms` table `topic` column

---

## 2. Seed — question counts

Run in Supabase SQL editor or via `psql`:

```sql
SELECT topic, COUNT(*) FROM questions GROUP BY topic ORDER BY topic;
```

Expected minimums:

| topic            | questions |
| ---------------- | --------- |
| react            | 50        |
| typescript       | 43        |
| nextjs           | 22        |
| redux            | 35        |
| javascript       | 86        |
| html5            | 51        |
| css              | 33        |
| react-hooks      | 29        |
| git              | 21        |
| agile-scrum      | 26        |
| websockets       | 18        |
| unit-testing     | 16        |
| design-patterns  | 16        |

---

## 3. Seed — mock options

```sql
SELECT topic, COUNT(*) FROM questions WHERE mock_options IS NOT NULL AND jsonb_array_length(mock_options) = 4 GROUP BY topic ORDER BY topic;
```

All 13 topics must appear with at least 16 rows each (react = 20, nextjs = 21, javascript = 20).

---

## 4. Seed — glossary terms

```sql
SELECT COUNT(*) FROM terms;
```

Expected: **105 terms**

```sql
SELECT topic, COUNT(*) FROM terms GROUP BY topic ORDER BY topic;
```

`general` topic should have the highest count.

---

## 5. /questions page

- [ ] All 13 topic filter chips appear and are clickable
- [ ] Filtering by `css`, `react-hooks`, `git`, `agile-scrum`, `websockets`, `unit-testing`, `design-patterns` returns questions
- [ ] EN/TR toggle works on a question detail page
- [ ] `TermTooltip` appears on at least one glossary term in a question's detail view

---

## 6. /glossary page

- [ ] Page loads without error
- [ ] All 13 topic sections + General section visible
- [ ] Term count displayed matches seed data

---

## 7. /mock config page

- [ ] All 13 topics appear as checkboxes (none show "no questions yet")
- [ ] "Select all" / "Deselect all" button works correctly
- [ ] Difficulty range filter updates available question count
- [ ] Session length toggle (5 / 10 / 15 / 20) works
- [ ] "Start mock interview" is disabled when 0 topics selected

---

## 8. /mock/session

- [ ] Session starts and shows questions from selected topics
- [ ] Selecting a wrong answer shows red highlight + correct answer revealed
- [ ] Selecting a correct answer shows green highlight
- [ ] Progress bar advances each question
- [ ] "Finish" on last question shows result screen

---

## 9. Result screen

- [ ] Score displayed as `X / total`
- [ ] Percentage + grade label shown (Perfect / Strong / Decent / Needs work)
- [ ] Topic breakdown badges appear when >1 topic selected
- [ ] Badge colour: green ≥ 100%, amber ≥ 60%, red < 60%
- [ ] Missed questions listed with your answer vs. correct answer
- [ ] "Restart with same settings" reloads a fresh question set
- [ ] "New session" navigates back to /mock
- [ ] "Back to question bank" navigates to /questions

---

## 10. Edge cases

- [ ] Starting a session with a single topic (e.g., `design-patterns`) returns ≤ 16 questions
- [ ] Setting min level > available questions for a topic shows "Only X questions available" warning
- [ ] Direct navigation to `/mock/session` with no params shows the empty-state fallback
