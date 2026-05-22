# Graph Report - Interview_Prep_App  (2026-05-23)

## Corpus Check
- 58 files · ~44,289 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 324 nodes · 497 edges · 24 communities (14 shown, 10 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `124daad3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]

## God Nodes (most connected - your core abstractions)
1. `React Interview Questions — raw source` - 93 edges
2. `cn()` - 14 edges
3. `Progress` - 12 edges
4. `createServerSupabaseClient()` - 11 edges
5. `main()` - 10 edges
6. `listTerms()` - 10 edges
7. `Topic` - 9 edges
8. `requireEnv()` - 8 edges
9. `QuestionsPage()` - 7 edges
10. `TOPIC_LABELS` - 7 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `createClient()`  [INFERRED]
  scripts/seed.ts → src/lib/supabase/client.ts
- `MockSessionPage()` --calls--> `parseTopicList()`  [INFERRED]
  src/app/mock/session/page.tsx → src/lib/mock-shared.ts
- `MockSessionPage()` --calls--> `parseLevelOr()`  [INFERRED]
  src/app/mock/session/page.tsx → src/lib/mock-shared.ts
- `MockSessionPage()` --calls--> `parseSessionLength()`  [INFERRED]
  src/app/mock/session/page.tsx → src/lib/mock-shared.ts
- `generateMetadata()` --calls--> `getTermBySlug()`  [EXTRACTED]
  src/app/glossary/[slug]/page.tsx → src/lib/terms.ts

## Communities (24 total, 10 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.02
Nodes (93): Q10: What is props in ReactJS? ⭐, Q11: What are the major features of ReactJS? ⭐, Q12: What is ReactJS? ⭐, Q13: What are props in React? ⭐, Q14: What is Flux? ⭐⭐, Q15: How error boundaries handled in React (15)? ⭐⭐, Q16: What are the limitations of ReactJS? ⭐⭐, Q17: What's the difference between an "Element" and a "Component" in React? ⭐⭐ (+85 more)

### Community 1 - "Community 1"
Cohesion: 0.12
Nodes (28): MockConfig(), correctOption(), MockSession(), OPTION_LABELS, getMockReadyMeta(), getMockSessionQuestions(), loadMockReady(), QuestionWithOptionsRow (+20 more)

### Community 2 - "Community 2"
Cohesion: 0.12
Nodes (23): QuestionFilters(), GlossaryText(), HIGHLIGHT_OPTIONS, MarkdownComponents, MarkdownContent(), RehypePlugins, PersonalExample(), pickAnswer() (+15 more)

### Community 3 - "Community 3"
Cohesion: 0.11
Nodes (22): getEnv(), loadExtraQuestions(), loadMockOptions(), loadSeedFile(), loadTerms(), main(), SEED_FILES, SeedInsert (+14 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (23): Auto-glossary implementation, JavaScript glossary terms ✅ COMPLETE (Adım 2), JavaScript question bank ✅ COMPLETE (Adım 1), Mock implementation, Next.js question bank expansion ✅ COMPLETE, Not done (out of React-only scope), Notes, Notes (+15 more)

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (11): { handlers, signIn, signOut, auth }, readRole(), Role, Session, requireEnv(), metadata, config, proxy() (+3 more)

### Community 6 - "Community 6"
Cohesion: 0.28
Nodes (11): TooltipDemo(), GlossaryPage(), SECTION_ORDER, getRelatedTerms(), getTermBySlug(), groupByTopic(), listTerms(), TermListItem (+3 more)

### Community 7 - "Community 7"
Cohesion: 0.25
Nodes (12): generateMetadata(), QuestionDetailPage(), getQuestionById(), listQuestions(), parseLevel(), parseQuery(), parseTopic(), QuestionFilters (+4 more)

### Community 8 - "Community 8"
Cohesion: 0.18
Nodes (10): Already in the app (20 — Phase 1/2/3), Curated React question list, Dropped — duplicates of questions already in the app, or unanswerable, Level 1 — Entry (5)  →  react-batch-1 (ids 201–205), Level 2 — Junior (11)  →  react-batch-2, react-batch-3 (ids 206–216), Level 3 — Mid (16)  →  react-batch-4, 5, 6 (ids 217–232), Level 4 — Senior (12)  →  react-batch-7, 8 (ids 233–244), Level 5 — Expert (6)  →  react-batch-9 (ids 245–250) (+2 more)

### Community 9 - "Community 9"
Cohesion: 0.2
Nodes (9): Already in the app (20 — done in Phase 1/2), Curated TypeScript question list, Dropped — duplicates of questions already in the app, Level 1 — Entry (5)  →  batch-1  ✅ full, Level 2 — Junior (14)  →  batch-2, batch-3, batch-4  ✅ full (ids 106–119), Level 3 — Mid (14)  →  batch-5, batch-6, batch-7  ✅ full (ids 120–133), Level 4 — Senior (4)  →  batch-8  ✅ full (ids 134–137), Level 5 — Expert (6)  →  batch-9  ✅ full (ids 138–143) (+1 more)

### Community 10 - "Community 10"
Cohesion: 0.4
Nodes (4): code:bash (npm run dev), Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **169 isolated node(s):** `eslintConfig`, `nextConfig`, `config`, `DETAILS`, `DETAILS` (+164 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createServerSupabaseClient()` connect `Community 5` to `Community 1`, `Community 6`, `Community 7`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `config` to the rest of the system?**
  _169 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.02 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._