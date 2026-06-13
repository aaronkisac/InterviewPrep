/**
 * Concept coverage - bidirectional curriculum check.
 *
 * Source of truth: data/syllabi/<topic>.json - a curated list of the concepts
 * a learner must master for a topic. For every concept this verifies BOTH sides:
 *
 *   (taught)  >= 1 mapped lesson exists under data/seed-courses/<topic>/
 *   (tested)  >= 1 bank question reaches the concept via a lesson `challenge` step
 *
 * ...and the reverse, so nothing drifts out of the syllabus:
 *
 *   - lessons claimed by no concept       -> taught but off-syllabus
 *   - bank questions reachable from none  -> in the bank but taught by nothing
 *   - challenge steps with no bank match  -> stale reference (soft)
 *
 * Bank source is the seeded question bank in data/seed-questions (offline, no
 * Supabase) - unlike course:coverage which checks the live DB. Run both:
 * course:coverage = every question is taught; concept:coverage = every concept
 * is both taught and tested.
 *
 * Usage: `pnpm concept:coverage`
 * Exits 1 on any ERROR-level gap. "Taught but not tested" and stale references
 * are WARN only.
 */

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import {
  validateSeedUnit,
  type ChallengeStep,
} from "../src/lib/course/step-schema";

type Concept = {
  id: string;
  title: string;
  titleTr?: string;
  section?: string;
  unit?: string;
  lessons: string[];
};

type Syllabus = {
  topic: string;
  title?: string;
  concepts: Concept[];
};

const SYLLABI_DIR = path.join(process.cwd(), "data", "syllabi");
const COURSES_DIR = path.join(process.cwd(), "data", "seed-courses");
const BANK_DIR = path.join(process.cwd(), "data", "seed-questions");

function fail(msg: string): never {
  console.error(`concept:coverage - ${msg}`);
  process.exit(1);
}

async function loadSyllabi(): Promise<Syllabus[]> {
  let files: string[];
  try {
    files = (await readdir(SYLLABI_DIR)).filter((f) => f.endsWith(".json")).sort();
  } catch {
    return [];
  }
  const out: Syllabus[] = [];
  for (const file of files) {
    const raw = JSON.parse(
      await readFile(path.join(SYLLABI_DIR, file), "utf8"),
    ) as Syllabus;
    if (!raw.topic || !Array.isArray(raw.concepts)) {
      fail(`syllabi/${file}: must have "topic" and a "concepts" array`);
    }
    const seen = new Set<string>();
    for (const c of raw.concepts) {
      if (!c.id || typeof c.id !== "string") {
        fail(`syllabi/${file}: every concept needs a string "id"`);
      }
      if (seen.has(c.id)) fail(`syllabi/${file}: duplicate concept id "${c.id}"`);
      seen.add(c.id);
      if (!Array.isArray(c.lessons) || c.lessons.length === 0) {
        fail(`syllabi/${file}: concept "${c.id}" needs a non-empty "lessons" array`);
      }
    }
    out.push(raw);
  }
  return out;
}

type TopicCourse = {
  lessonSlugs: Set<string>;
  challenges: Map<string, string[]>;
};

async function loadCourse(topic: string): Promise<TopicCourse> {
  const dir = path.join(COURSES_DIR, topic);
  const lessonSlugs = new Set<string>();
  const challenges = new Map<string, string[]>();
  let files: string[];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith(".json")).sort();
  } catch {
    return { lessonSlugs, challenges };
  }
  for (const file of files) {
    const result = validateSeedUnit(
      JSON.parse(await readFile(path.join(dir, file), "utf8")) as unknown,
    );
    if (!result.ok) {
      fail(`invalid course unit ${topic}/${file}:\n  ${result.errors.join("\n  ")}`);
    }
    for (const lesson of result.value.lessons) {
      lessonSlugs.add(lesson.slug);
      const qs = lesson.steps
        .filter((s) => s.type === "challenge")
        .map((s) => (s as ChallengeStep).question.trim());
      challenges.set(lesson.slug, [...(challenges.get(lesson.slug) ?? []), ...qs]);
    }
  }
  return { lessonSlugs, challenges };
}

async function loadBank(topic: string): Promise<Set<string>> {
  const bank = new Set<string>();
  let files: string[];
  try {
    files = (await readdir(BANK_DIR)).filter((f) => f.endsWith(".json"));
  } catch {
    return bank;
  }
  for (const file of files) {
    let rows: unknown;
    try {
      rows = JSON.parse(await readFile(path.join(BANK_DIR, file), "utf8"));
    } catch {
      continue;
    }
    if (!Array.isArray(rows)) continue;
    for (const r of rows as Array<{ topic?: string; question?: string }>) {
      if (r?.topic === topic && typeof r.question === "string") {
        bank.add(r.question.trim());
      }
    }
  }
  return bank;
}

async function main() {
  const syllabi = await loadSyllabi();
  if (syllabi.length === 0) {
    console.log("No syllabi under data/syllabi/ - nothing to check.");
    return;
  }

  let errors = 0;
  let warnings = 0;

  for (const syllabus of syllabi.sort((a, b) => a.topic.localeCompare(b.topic))) {
    const { topic } = syllabus;
    const course = await loadCourse(topic);
    const bank = await loadBank(topic);

    const referencedLessons = new Set<string>();

    let taughtCount = 0;
    let testedCount = 0;
    const notTaught: string[] = [];
    const notTested: string[] = [];
    const badLessonRefs: string[] = [];

    for (const c of syllabus.concepts) {
      const presentLessons = c.lessons.filter((s) => course.lessonSlugs.has(s));
      const missingLessons = c.lessons.filter((s) => !course.lessonSlugs.has(s));
      missingLessons.forEach((s) =>
        badLessonRefs.push(`${c.id} -> unknown lesson "${s}"`),
      );
      presentLessons.forEach((s) => referencedLessons.add(s));

      const conceptQs = presentLessons.flatMap((s) => course.challenges.get(s) ?? []);
      const matched = conceptQs.filter((q) => bank.has(q));

      const taught = presentLessons.length > 0;
      const tested = matched.length > 0;
      if (taught) taughtCount++;
      else notTaught.push(c.id);
      if (tested) testedCount++;
      else if (taught) notTested.push(c.id);
    }

    const orphanLessons = [...course.lessonSlugs].filter(
      (s) => !referencedLessons.has(s),
    );
    const allChallengeQs = new Set<string>([...course.challenges.values()].flat());
    const staleChallenges = [...allChallengeQs].filter((q) => !bank.has(q));
    const untaughtBankQs = [...bank].filter((q) => !allChallengeQs.has(q));

    console.log(`\n=== ${topic} ===`);
    console.log(
      `concepts: ${syllabus.concepts.length} | taught ${taughtCount}/${syllabus.concepts.length} | tested ${testedCount}/${syllabus.concepts.length}`,
    );

    for (const ref of badLessonRefs) {
      console.log(`  [ERR]  concept references missing lesson: ${ref}`);
      errors++;
    }
    for (const id of notTaught) {
      console.log(`  [ERR]  concept not taught (no lesson): ${id}`);
      errors++;
    }
    for (const s of orphanLessons) {
      console.log(`  [ERR]  lesson taught but in no concept: ${s}`);
      errors++;
    }
    for (const q of untaughtBankQs) {
      console.log(`  [ERR]  bank question taught by no lesson: ${q}`);
      errors++;
    }
    for (const id of notTested) {
      console.log(`  [warn] concept taught but no bank question tests it: ${id}`);
      warnings++;
    }
    for (const q of staleChallenges) {
      console.log(`  [warn] challenge references question not in offline bank: ${q}`);
      warnings++;
    }
  }

  console.log(
    `\nconcept coverage - ${errors} error(s), ${warnings} warning(s) ${errors === 0 ? "OK" : "FAIL"}`,
  );
  if (errors > 0) process.exitCode = 1;
}

main().catch((err: unknown) => {
  console.error("Concept coverage failed:", err);
  process.exit(1);
});
