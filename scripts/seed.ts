/**
 * Seed script — imports data/seed-{react,typescript,nextjs}.json into the
 * `questions` table.
 *
 * Usage (local):
 *   1. Fill in SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in .env.local
 *   2. Apply migrations: `supabase db push`
 *   3. Run: `pnpm seed`
 *
 * Idempotent: rows are matched on (topic, question) and upserted.
 */

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

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
>;

const SEED_FILES: ReadonlyArray<{ topic: Topic; file: string }> = [
  { topic: "react", file: "seed-react.json" },
  { topic: "typescript", file: "seed-typescript.json" },
  { topic: "nextjs", file: "seed-nextjs.json" },
];

function getEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
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

async function upsertBatch(
  supabase: SupabaseClient,
  topic: Topic,
  rows: SeedInsert[],
): Promise<{ inserted: number; updated: number }> {
  let inserted = 0;
  let updated = 0;

  for (const row of rows) {
    const { data: existing, error: selectError } = await supabase
      .from("questions")
      .select("id, level, level_label")
      .eq("topic", row.topic)
      .eq("question", row.question)
      .maybeSingle();

    if (selectError) {
      throw new Error(
        `Lookup failed for "${row.question.slice(0, 40)}…": ${selectError.message}`,
      );
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from("questions")
        .update({
          level: row.level,
          level_label: row.level_label,
          question_tr: row.question_tr,
          answer_general: row.answer_general,
          answer_personal: row.answer_personal,
          answer_general_tr: row.answer_general_tr,
          answer_personal_tr: row.answer_personal_tr,
          detail_md: row.detail_md,
          detail_md_tr: row.detail_md_tr,
        })
        .eq("id", existing.id);
      if (updateError) throw new Error(updateError.message);
      updated += 1;
    } else {
      const { error: insertError } = await supabase
        .from("questions")
        .insert(row);
      if (insertError) throw new Error(insertError.message);
      inserted += 1;
    }
  }

  console.log(
    `  ${topic.padEnd(10)} → inserted ${inserted}, updated ${updated}`,
  );
  return { inserted, updated };
}

// ---------------------------------------------------------------------------
// Terms — separate table, simpler upsert by slug.
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
  let inserted = 0;
  let updated = 0;

  for (const row of rows) {
    const { data: existing, error: selectError } = await supabase
      .from("terms")
      .select("id")
      .eq("slug", row.slug)
      .maybeSingle();

    if (selectError) {
      throw new Error(`Lookup failed for term "${row.slug}": ${selectError.message}`);
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from("terms")
        .update(row)
        .eq("id", existing.id);
      if (updateError) throw new Error(updateError.message);
      updated += 1;
    } else {
      const { error: insertError } = await supabase.from("terms").insert(row);
      if (insertError) throw new Error(insertError.message);
      inserted += 1;
    }
  }

  console.log(`  terms      → inserted ${inserted}, updated ${updated}`);
  return { inserted, updated };
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
): Promise<void> {
  let questionsCovered = 0;
  let optionsInserted = 0;
  let skipped = 0;

  for (const entry of entries) {
    const correct = entry.options.filter((o) => o.isCorrect).length;
    if (entry.options.length !== 4 || correct !== 1) {
      throw new Error(
        `"${entry.question.slice(0, 40)}…" must have exactly 4 options and 1 correct`,
      );
    }

    const { data: question, error: lookupError } = await supabase
      .from("questions")
      .select("id")
      .eq("topic", entry.topic)
      .eq("question", entry.question.trim())
      .maybeSingle();

    if (lookupError) {
      throw new Error(
        `Lookup failed for "${entry.question.slice(0, 40)}…": ${lookupError.message}`,
      );
    }
    if (!question) {
      console.warn(
        `  ⚠ no question matched "${entry.question.slice(0, 50)}…" — skipped`,
      );
      skipped += 1;
      continue;
    }

    // Replace existing options so repeated seed runs stay idempotent.
    const { error: deleteError } = await supabase
      .from("mock_options")
      .delete()
      .eq("question_id", question.id);
    if (deleteError) throw new Error(deleteError.message);

    const rows = entry.options.map((o) => ({
      question_id: question.id,
      option_text: o.optionText.trim(),
      option_text_tr: o.optionTextTr?.trim() ?? "",
      is_correct: o.isCorrect,
      explanation: o.explanation.trim(),
      explanation_tr: o.explanationTr?.trim() ?? "",
    }));
    const { error: insertError } = await supabase
      .from("mock_options")
      .insert(rows);
    if (insertError) throw new Error(insertError.message);

    questionsCovered += 1;
    optionsInserted += rows.length;
  }

  console.log(
    `  mock_options → ${questionsCovered} questions, ${optionsInserted} options` +
      (skipped > 0 ? `, ${skipped} skipped` : ""),
  );
}

async function main() {
  const supabase = createClient(
    getEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  console.log("Seeding questions…");
  let total = { inserted: 0, updated: 0 };

  for (const { topic, file } of SEED_FILES) {
    const questions = await loadSeedFile(file);
    const rows = questions.map(toInsert);
    const result = await upsertBatch(supabase, topic, rows);
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
      const result = await upsertBatch(supabase, topic, qs.map(toInsert));
      total = {
        inserted: total.inserted + result.inserted,
        updated: total.updated + result.updated,
      };
    }
  }

  console.log("Seeding mock options…");
  const mockEntries = await loadMockOptions();
  await seedMockOptions(supabase, mockEntries);

  console.log("Seeding terms…");
  const terms = await loadTerms();
  const termResult = await upsertTerms(supabase, terms.map(termToInsert));
  total = {
    inserted: total.inserted + termResult.inserted,
    updated: total.updated + termResult.updated,
  };

  console.log(
    `Done. Inserted ${total.inserted}, updated ${total.updated} total.`,
  );
}

main().catch((err: unknown) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
