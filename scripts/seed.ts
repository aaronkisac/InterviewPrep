/**
 * Seed script — imports data/seed-{react,typescript,nextjs}.json into the
 * `questions` table.
 *
 * Usage (local):
 *   1. Fill in SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in .env.local
 *   2. Apply migrations: `supabase db push`
 *   3. Run: `pnpm seed`
 *
 * Sections can be run selectively (much faster while iterating):
 *   pnpm seed courses          # only data/seed-courses/
 *   pnpm seed mock             # only mock options
 *   pnpm seed questions terms  # questions + glossary terms
 *
 * Idempotent: rows are matched on (topic, question) and upserted.
 * Performance: one prefetch builds a (topic, question) → id map, then all
 * writes go out as chunked batch requests instead of per-row round trips.
 */

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { validateSeedUnit, type SeedUnit } from "../src/lib/course/step-schema";
import type {
  LevelLabel,
  QuestionRow,
  TermRow,
  Topic,
} from "../src/lib/supabase/types";

// Env vars are loaded via Node's `--env-file=.env.local` flag in the
// `pnpm seed` script — see package.json.

type SeedQuestion = {
  id: number;
  uuid?: string; // optional: if set, update by UUID instead of (topic, question)
  topic: Topic;
  question: string;
  questionTr?: string | null;
  level: 1 | 2 | 3 | 4 | 5;
  levelLabel: LevelLabel;
  answerGeneral?: string | null;
  answerPersonal?: string | null;
  answerGeneralTr?: string | null;
  answerPersonalTr?: string | null;
  detailMd?: string | null;
  detailMdTr?: string | null;
};

type SeedInsert = Pick<
  QuestionRow,
  | "topic"
  | "level"
  | "level_label"
  | "question"
  | "question_tr"
  | "answer_general"
  | "answer_personal"
  | "answer_general_tr"
  | "answer_personal_tr"
  | "detail_md"
  | "detail_md_tr"
  | "is_seed"
  | "is_shared"
  | "status"
> & { uuid?: string };

const SEED_FILES: ReadonlyArray<{ topic: Topic; file: string }> = [
  { topic: "react", file: "seed-react.json" },
  { topic: "typescript", file: "seed-typescript.json" },
  { topic: "nextjs", file: "seed-nextjs.json" },
];

const BATCH_SIZE = 500;

function getEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

/**
 * Retry transient network failures (undici "fetch failed", ECONNRESET).
 * Supabase API errors (returned, not thrown) are not retried; only thrown
 * fetch-level errors are.
 */
async function withRetry<T>(
  // PromiseLike, not Promise: supabase query builders are thenables
  fn: () => PromiseLike<T>,
  label: string,
  attempts = 4,
): Promise<T> {
  let lastErr: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i === attempts) break;
      const wait = i * 1500;
      console.warn(
        `  retry ${label} (attempt ${i}/${attempts}) in ${wait}ms — ${String(err)}`,
      );
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw lastErr;
}

/** Map key for question identity: topic + tab + trimmed question text. */
function keyOf(topic: string, question: string): string {
  return `${topic}\t${question.trim()}`;
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/**
 * One paged prefetch of every question's (topic, question) → id.
 * Replaces thousands of per-row lookups across questions, mock options and
 * course challenge resolution.
 */
async function fetchQuestionMap(
  supabase: SupabaseClient,
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const page = 1000;
  for (let from = 0; ; from += page) {
    const { data, error } = await withRetry(
      () =>
        supabase
          .from("questions")
          .select("id, topic, question")
          .range(from, from + page - 1),
      "question map page",
    );
    if (error) throw new Error(error.message);
    for (const r of data ?? []) {
      map.set(keyOf(r.topic as string, r.question as string), r.id as string);
    }
    if (!data || data.length < page) break;
  }
  return map;
}

async function loadSeedFile(file: string): Promise<SeedQuestion[]> {
  const filePath = path.join(process.cwd(), "data", file);
  let raw: string;
  try {
    raw = await readFile(filePath, "utf8");
  } catch {
    // File no longer exists — questions were already seeded; skip gracefully.
    return [];
  }
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error(`Expected an array in ${file}`);
  }
  return parsed as SeedQuestion[];
}

/**
 * Extra question batches live as individual JSON files in data/seed-questions/.
 * Each file is an array of SeedQuestion carrying its own `topic` field. This
 * lets new questions land as small files instead of editing the large
 * seed-{topic}.json files. The directory is optional — missing is fine.
 */
async function loadExtraQuestions(): Promise<SeedQuestion[]> {
  const dir = path.join(process.cwd(), "data", "seed-questions");
  let files: string[];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith(".json")).sort();
  } catch {
    return [];
  }
  const all: SeedQuestion[] = [];
  for (const file of files) {
    const raw = await readFile(path.join(dir, file), "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      throw new Error(`Expected an array in seed-questions/${file}`);
    }
    all.push(...(parsed as SeedQuestion[]));
  }
  return all;
}

function toInsert(q: SeedQuestion): SeedInsert {
  return {
    uuid: q.uuid,
    topic: q.topic,
    level: q.level,
    level_label: q.levelLabel,
    question: q.question.trim(),
    question_tr: q.questionTr?.trim() ?? "",
    answer_general: q.answerGeneral?.trim() ?? "",
    answer_personal: q.answerPersonal?.trim() ?? null,
    answer_general_tr: q.answerGeneralTr?.trim() ?? "",
    answer_personal_tr: q.answerPersonalTr?.trim() ?? null,
    detail_md: q.detailMd?.trim() || null,
    detail_md_tr: q.detailMdTr?.trim() || null,
    is_seed: true,
    is_shared: true,
    status: "active",
  };
}

/**
 * Batched question upsert.
 * Existing rows (found in the prefetched map) go out as chunked
 * upsert-by-id requests; new rows as chunked inserts whose returned ids are
 * fed back into the map (mock options / challenges resolve against it later).
 * Rows carrying an explicit `uuid` keep the old per-row update path — that
 * branch intentionally writes a narrower column set.
 */
async function upsertBatch(
  supabase: SupabaseClient,
  topic: Topic,
  rows: SeedInsert[],
  qmap: Map<string, string>,
): Promise<{ inserted: number; updated: number }> {
  let inserted = 0;
  let updated = 0;

  const inserts: Array<Omit<SeedInsert, "uuid">> = [];
  const upserts: Array<Omit<SeedInsert, "uuid"> & { id: string }> = [];

  for (const row of rows) {
    // If uuid is provided, update directly by UUID — bypasses question-text matching
    if (row.uuid) {
      const { error: updateError } = await withRetry(
        () =>
          supabase
            .from("questions")
            .update({
              level: row.level,
              level_label: row.level_label,
              question_tr: row.question_tr,
              answer_general: row.answer_general,
              answer_general_tr: row.answer_general_tr,
              answer_personal_tr: row.answer_personal_tr,
              detail_md: row.detail_md,
              detail_md_tr: row.detail_md_tr,
            })
            .eq("id", row.uuid!),
        "uuid update",
      );
      if (updateError) {
        throw new Error(`UUID update failed for ${row.uuid}: ${updateError.message}`);
      }
      updated += 1;
      continue;
    }

    const { uuid: _uuid, ...clean } = row;
    const id = qmap.get(keyOf(clean.topic, clean.question));
    if (id) {
      upserts.push({ ...clean, id });
    } else {
      inserts.push(clean);
    }
  }

  for (const part of chunk(upserts, BATCH_SIZE)) {
    const { error } = await withRetry(
      () => supabase.from("questions").upsert(part, { onConflict: "id" }),
      "questions batch upsert",
    );
    if (error) throw new Error(error.message);
    updated += part.length;
  }

  for (const part of chunk(inserts, BATCH_SIZE)) {
    const { data, error } = await withRetry(
      () =>
        supabase.from("questions").insert(part).select("id, topic, question"),
      "questions batch insert",
    );
    if (error) throw new Error(error.message);
    for (const r of data ?? []) {
      qmap.set(keyOf(r.topic as string, r.question as string), r.id as string);
    }
    inserted += part.length;
  }

  console.log(
    `  ${topic.padEnd(10)} → inserted ${inserted}, updated ${updated}`,
  );
  return { inserted, updated };
}

// ---------------------------------------------------------------------------
// Terms — separate table, batched upsert keyed on slug.
// ---------------------------------------------------------------------------

type SeedTerm = {
  slug: string;
  label: string;
  topic: Topic | null;
  tooltip: string;
  tooltipTr?: string;
  definition: string;
  definitionTr?: string;
  codeExample?: string | null;
  relatedSlugs?: string[];
};

type TermInsert = Pick<
  TermRow,
  | "slug"
  | "label"
  | "topic"
  | "tooltip"
  | "tooltip_tr"
  | "definition"
  | "definition_tr"
  | "code_example"
  | "related_slugs"
>;

async function loadTerms(): Promise<SeedTerm[]> {
  const filePath = path.join(process.cwd(), "data", "seed-terms.json");
  const raw = await readFile(filePath, "utf8");
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) throw new Error("seed-terms.json must be an array");
  return parsed as SeedTerm[];
}

function termToInsert(t: SeedTerm): TermInsert {
  return {
    slug: t.slug,
    label: t.label,
    topic: t.topic,
    tooltip: t.tooltip,
    tooltip_tr: t.tooltipTr ?? "",
    definition: t.definition,
    definition_tr: t.definitionTr ?? "",
    code_example: t.codeExample ?? null,
    related_slugs: t.relatedSlugs ?? [],
  };
}

async function upsertTerms(
  supabase: SupabaseClient,
  rows: TermInsert[],
): Promise<{ inserted: number; updated: number }> {
  const { data: existing, error: mapError } = await withRetry(
    () => supabase.from("terms").select("id, slug"),
    "terms map",
  );
  if (mapError) throw new Error(mapError.message);
  const idBySlug = new Map(
    (existing ?? []).map((r) => [r.slug as string, r.id as string]),
  );

  const inserts: TermInsert[] = [];
  const upserts: Array<TermInsert & { id: string }> = [];
  for (const row of rows) {
    const id = idBySlug.get(row.slug);
    if (id) upserts.push({ ...row, id });
    else inserts.push(row);
  }

  for (const part of chunk(upserts, BATCH_SIZE)) {
    const { error } = await withRetry(
      () => supabase.from("terms").upsert(part, { onConflict: "id" }),
      "terms batch upsert",
    );
    if (error) throw new Error(error.message);
  }
  for (const part of chunk(inserts, BATCH_SIZE)) {
    const { error } = await withRetry(
      () => supabase.from("terms").insert(part),
      "terms batch insert",
    );
    if (error) throw new Error(error.message);
  }

  console.log(
    `  terms      → inserted ${inserts.length}, updated ${upserts.length}`,
  );
  return { inserted: inserts.length, updated: upserts.length };
}

// ---------------------------------------------------------------------------
// Mock options — multiple-choice answers for mock interview mode.
// Lives in data/seed-mock-{topic}.json files. Each entry references a question
// by (topic, question text); the four options replace whatever is there so
// re-running the seed stays idempotent.
// ---------------------------------------------------------------------------

type SeedMockOption = {
  optionText: string;
  optionTextTr?: string;
  isCorrect: boolean;
  explanation: string;
  explanationTr?: string;
};

type SeedMockEntry = {
  topic: Topic;
  question: string;
  options: SeedMockOption[];
};

async function loadMockOptions(): Promise<SeedMockEntry[]> {
  const dir = path.join(process.cwd(), "data");
  let files: string[];
  try {
    files = (await readdir(dir))
      .filter((f) => f.startsWith("seed-mock-") && f.endsWith(".json"))
      .sort();
  } catch {
    return [];
  }
  const all: SeedMockEntry[] = [];
  for (const file of files) {
    const raw = await readFile(path.join(dir, file), "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      throw new Error(`Expected an array in ${file}`);
    }
    all.push(...(parsed as SeedMockEntry[]));
  }
  return all;
}

async function seedMockOptions(
  supabase: SupabaseClient,
  entries: SeedMockEntry[],
  qmap: Map<string, string>,
): Promise<void> {
  let skipped = 0;

  type OptionRow = {
    question_id: string;
    option_text: string;
    option_text_tr: string;
    is_correct: boolean;
    explanation: string;
    explanation_tr: string;
  };

  const questionIds: string[] = [];
  const optionRows: OptionRow[] = [];

  for (const entry of entries) {
    const correct = entry.options.filter((o) => o.isCorrect).length;
    if (entry.options.length !== 4 || correct !== 1) {
      throw new Error(
        `"${entry.question.slice(0, 40)}…" must have exactly 4 options and 1 correct`,
      );
    }

    const questionId = qmap.get(keyOf(entry.topic, entry.question));
    if (!questionId) {
      console.warn(
        `  ⚠ no question matched "${entry.question.slice(0, 50)}…" — skipped`,
      );
      skipped += 1;
      continue;
    }

    questionIds.push(questionId);
    for (const o of entry.options) {
      optionRows.push({
        question_id: questionId,
        option_text: o.optionText.trim(),
        option_text_tr: o.optionTextTr?.trim() ?? "",
        is_correct: o.isCorrect,
        explanation: o.explanation.trim(),
        explanation_tr: o.explanationTr?.trim() ?? "",
      });
    }
  }

  // Replace existing options so repeated seed runs stay idempotent.
  for (const part of chunk(questionIds, 200)) {
    const { error } = await withRetry(
      () => supabase.from("mock_options").delete().in("question_id", part),
      "options batch delete",
    );
    if (error) throw new Error(error.message);
  }

  for (const part of chunk(optionRows, BATCH_SIZE)) {
    const { error } = await withRetry(
      () => supabase.from("mock_options").insert(part),
      "options batch insert",
    );
    if (error) throw new Error(error.message);
  }

  console.log(
    `  mock_options → ${questionIds.length} questions, ${optionRows.length} options` +
      (skipped > 0 ? `, ${skipped} skipped` : ""),
  );
}

// ---------------------------------------------------------------------------
// Courses — units + lessons from data/seed-courses/<topic>/<unit-slug>.json.
// Each file is one unit (meta + lessons + steps), validated by step-schema.
// `challenge` steps reference bank questions by exact text; we resolve them
// against the prefetched question map and store `questionId` inside the
// steps JSONB.
// Idempotent: units upsert by (topic_slug, slug), lessons by (unit_id, slug);
// lessons removed from a file are deleted so the file stays source of truth.
// ---------------------------------------------------------------------------

async function loadCourseUnits(): Promise<SeedUnit[]> {
  const dir = path.join(process.cwd(), "data", "seed-courses");
  let topics: string[];
  try {
    topics = (await readdir(dir, { withFileTypes: true }))
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort();
  } catch {
    return [];
  }

  const units: SeedUnit[] = [];
  for (const topic of topics) {
    const topicDir = path.join(dir, topic);
    const files = (await readdir(topicDir))
      .filter((f) => f.endsWith(".json"))
      .sort();
    for (const file of files) {
      const raw = await readFile(path.join(topicDir, file), "utf8");
      const result = validateSeedUnit(JSON.parse(raw) as unknown);
      if (!result.ok) {
        throw new Error(
          `Invalid course unit ${topic}/${file}:\n  ${result.errors.join("\n  ")}`,
        );
      }
      if (result.value.topic !== topic) {
        throw new Error(
          `${topic}/${file}: unit "topic" is "${result.value.topic}" but the file lives in seed-courses/${topic}/`,
        );
      }
      units.push(result.value);
    }
  }
  return units;
}

function resolveChallenges(unit: SeedUnit, qmap: Map<string, string>): void {
  for (const lesson of unit.lessons) {
    for (const step of lesson.steps) {
      if (step.type !== "challenge") continue;
      const questionId = qmap.get(keyOf(unit.topic, step.question));
      if (!questionId) {
        throw new Error(
          `${unit.topic}/${unit.slug} → ${lesson.slug}: no ${unit.topic} question matches "${step.question.slice(0, 60)}…"`,
        );
      }
      step.questionId = questionId;
    }
  }
}

async function seedCourses(
  supabase: SupabaseClient,
  units: SeedUnit[],
  qmap: Map<string, string>,
): Promise<void> {
  let unitsUpserted = 0;
  let lessonsUpserted = 0;

  for (const unit of units) {
    resolveChallenges(unit, qmap);

    const unitRow = {
      topic_slug: unit.topic,
      slug: unit.slug,
      title: unit.title,
      title_tr: unit.titleTr,
      section: unit.section,
      position: unit.position,
    };

    const { data: existingUnit, error: unitSelectError } = await withRetry(
      () =>
        supabase
          .from("units")
          .select("id")
          .eq("topic_slug", unit.topic)
          .eq("slug", unit.slug)
          .maybeSingle(),
      "unit lookup",
    );
    if (unitSelectError) throw new Error(unitSelectError.message);

    let unitId: string;
    if (existingUnit) {
      unitId = existingUnit.id as string;
      const { error } = await withRetry(
        () => supabase.from("units").update(unitRow).eq("id", unitId),
        "unit update",
      );
      if (error) throw new Error(error.message);
    } else {
      const { data, error } = await withRetry(
        () => supabase.from("units").insert(unitRow).select("id").single(),
        "unit insert",
      );
      if (error) throw new Error(error.message);
      unitId = (data as { id: string }).id;
    }
    unitsUpserted += 1;

    // Lessons of one unit: prefetch slug → id, then batch the writes.
    const { data: existingLessons, error: lessonMapError } = await withRetry(
      () => supabase.from("lessons").select("id, slug").eq("unit_id", unitId),
      "lesson map",
    );
    if (lessonMapError) throw new Error(lessonMapError.message);
    const lessonIdBySlug = new Map(
      (existingLessons ?? []).map((r) => [r.slug as string, r.id as string]),
    );

    const lessonRows = unit.lessons.map((lesson) => {
      const base = {
        unit_id: unitId,
        slug: lesson.slug,
        title: lesson.title,
        title_tr: lesson.titleTr,
        position: lesson.position,
        steps: lesson.steps,
      };
      const id = lessonIdBySlug.get(lesson.slug);
      return id ? { ...base, id } : base;
    });

    const { error: lessonUpsertError } = await withRetry(
      () => supabase.from("lessons").upsert(lessonRows, { onConflict: "id" }),
      "lessons batch upsert",
    );
    if (lessonUpsertError) throw new Error(lessonUpsertError.message);
    lessonsUpserted += lessonRows.length;

    // Remove lessons that are no longer in the file (file = source of truth).
    const keepSlugs = unit.lessons.map((l) => l.slug);
    const staleIds = (existingLessons ?? [])
      .filter((r) => !keepSlugs.includes(r.slug as string))
      .map((r) => r.id as string);
    if (staleIds.length > 0) {
      const { error: pruneError } = await withRetry(
        () => supabase.from("lessons").delete().in("id", staleIds),
        "lesson prune",
      );
      if (pruneError) throw new Error(pruneError.message);
    }
  }

  console.log(
    `  courses    → ${unitsUpserted} units, ${lessonsUpserted} lessons`,
  );
}

async function main() {
  const supabase = createClient(
    getEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  // Section filter: `pnpm seed courses mock` runs only those sections.
  const VALID_SECTIONS = ["questions", "mock", "courses", "terms"] as const;
  const args = process.argv.slice(2).flatMap((a) => a.split(",")).filter(Boolean);
  const unknown = args.filter(
    (a) => !(VALID_SECTIONS as readonly string[]).includes(a),
  );
  if (unknown.length > 0) {
    throw new Error(
      `Unknown section(s): ${unknown.join(", ")}. Valid: ${VALID_SECTIONS.join(", ")}`,
    );
  }
  const only = new Set(args);
  const want = (s: (typeof VALID_SECTIONS)[number]) =>
    only.size === 0 || only.has(s);

  // One prefetch serves questions, mock options and course challenges.
  const needsMap = want("questions") || want("mock") || want("courses");
  const qmap = needsMap ? await fetchQuestionMap(supabase) : new Map<string, string>();
  if (needsMap) console.log(`Question map: ${qmap.size} rows`);

  let total = { inserted: 0, updated: 0 };

  if (want("questions")) {
    console.log("Seeding questions…");
    for (const { topic, file } of SEED_FILES) {
      const questions = await loadSeedFile(file);
      if (questions.length === 0) continue;
      const result = await upsertBatch(supabase, topic, questions.map(toInsert), qmap);
      total = {
        inserted: total.inserted + result.inserted,
        updated: total.updated + result.updated,
      };
    }

    const extra = await loadExtraQuestions();
    if (extra.length > 0) {
      const byTopic = new Map<Topic, SeedQuestion[]>();
      for (const q of extra) {
        const list = byTopic.get(q.topic) ?? [];
        list.push(q);
        byTopic.set(q.topic, list);
      }
      for (const [topic, qs] of byTopic) {
        const result = await upsertBatch(supabase, topic, qs.map(toInsert), qmap);
        total = {
          inserted: total.inserted + result.inserted,
          updated: total.updated + result.updated,
        };
      }
    }
  }

  if (want("mock")) {
    console.log("Seeding mock options…");
    const mockEntries = await loadMockOptions();
    await seedMockOptions(supabase, mockEntries, qmap);
  }

  if (want("courses")) {
    console.log("Seeding courses…");
    const courseUnits = await loadCourseUnits();
    if (courseUnits.length > 0) {
      await seedCourses(supabase, courseUnits, qmap);
    } else {
      console.log("  courses    → no seed-courses directory, skipped");
    }
  }

  if (want("terms")) {
    console.log("Seeding terms…");
    const terms = await loadTerms();
    const termResult = await upsertTerms(supabase, terms.map(termToInsert));
    total = {
      inserted: total.inserted + termResult.inserted,
      updated: total.updated + termResult.updated,
    };
  }

  console.log(
    `Done. Inserted ${total.inserted}, updated ${total.updated} total.`,
  );
}

main().catch((err: unknown) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
