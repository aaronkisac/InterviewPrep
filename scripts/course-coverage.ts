/**
 * Course coverage report — for every topic that has a course under
 * data/seed-courses/, lists bank questions NOT yet assigned to any
 * `challenge` step. The pilot is content-complete when its topic reports 0.
 *
 * Usage: `pnpm course:coverage` (needs .env.local, reads from Supabase)
 */

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

import {
  validateSeedUnit,
  type ChallengeStep,
} from "../src/lib/course/step-schema";

function getEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

async function loadAssignedQuestions(): Promise<Map<string, Set<string>>> {
  const dir = path.join(process.cwd(), "data", "seed-courses");
  const assigned = new Map<string, Set<string>>();

  let topics: string[];
  try {
    topics = (await readdir(dir, { withFileTypes: true }))
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort();
  } catch {
    return assigned;
  }

  for (const topic of topics) {
    const set = new Set<string>();
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
      for (const lesson of result.value.lessons) {
        for (const step of lesson.steps) {
          if (step.type === "challenge") {
            set.add((step as ChallengeStep).question.trim());
          }
        }
      }
    }
    assigned.set(topic, set);
  }
  return assigned;
}

async function main() {
  const assigned = await loadAssignedQuestions();
  if (assigned.size === 0) {
    console.log("No courses under data/seed-courses/ — nothing to report.");
    return;
  }

  const supabase = createClient(
    getEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  let totalMissing = 0;

  for (const [topic, questions] of assigned) {
    const { data, error } = await supabase
      .from("questions")
      .select("question")
      .eq("topic", topic)
      .eq("is_seed", true)
      .eq("status", "active");
    if (error) throw new Error(`Query failed for ${topic}: ${error.message}`);

    const bank = (data ?? []).map((r) => (r.question as string).trim());
    const missing = bank.filter((q) => !questions.has(q));
    const stale = [...questions].filter((q) => !bank.includes(q));
    totalMissing += missing.length;

    console.log(
      `${topic}: ${bank.length - missing.length}/${bank.length} questions covered`,
    );
    for (const q of missing) console.log(`  ✗ not assigned: ${q}`);
    for (const q of stale)
      console.log(`  ⚠ challenge references unknown question: ${q}`);
  }

  if (totalMissing === 0) {
    console.log("\nAll bank questions are covered by challenge steps. ✓");
  } else {
    console.log(`\n${totalMissing} question(s) still unassigned.`);
    process.exitCode = 1;
  }
}

main().catch((err: unknown) => {
  console.error("Coverage report failed:", err);
  process.exit(1);
});
