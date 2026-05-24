/**
 * DB-level seed verification — runs without a browser.
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY env vars.
 */
import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

const TOPIC_MINIMUMS: Record<string, number> = {
  react: 50,
  typescript: 43,
  nextjs: 22,
  redux: 35,
  javascript: 86,
  html5: 51,
  css: 33,
  "react-hooks": 29,
  git: 21,
  "agile-scrum": 26,
  websockets: 18,
  "unit-testing": 16,
  "design-patterns": 16,
};

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set",
    );
  }
  return createClient(url, key);
}

test.describe("DB — question counts", () => {
  test("all 13 topics meet minimum question count", async () => {
    const sb = getAdminClient();
    const { data, error } = await sb.from("questions").select("topic");
    expect(error, `Supabase error: ${error?.message}`).toBeNull();

    const counts = new Map<string, number>();
    for (const row of data ?? []) {
      counts.set(row.topic, (counts.get(row.topic) ?? 0) + 1);
    }

    for (const [topic, min] of Object.entries(TOPIC_MINIMUMS)) {
      const actual = counts.get(topic) ?? 0;
      expect(
        actual,
        `topic "${topic}": expected ≥ ${min}, got ${actual}`,
      ).toBeGreaterThanOrEqual(min);
    }
  });

  test("all 13 topics have mock options seeded (≥ 16 each)", async () => {
    const sb = getAdminClient();
    // mock_options is a separate table joined via question_id
    const { data, error } = await sb
      .from("mock_options")
      .select("question:question_id(topic)");
    expect(error, `Supabase error: ${error?.message}`).toBeNull();

    const counts = new Map<string, number>();
    for (const row of data ?? []) {
      const topic = (row.question as { topic: string } | null)?.topic;
      if (topic) counts.set(topic, (counts.get(topic) ?? 0) + 1);
    }

    for (const topic of Object.keys(TOPIC_MINIMUMS)) {
      const actual = counts.get(topic) ?? 0;
      expect(
        actual,
        `mock options for "${topic}": expected ≥ 16, got ${actual}`,
      ).toBeGreaterThanOrEqual(16);
    }
  });
});

test.describe("DB — glossary terms", () => {
  test("at least 105 terms are seeded", async () => {
    const sb = getAdminClient();
    const { count, error } = await sb
      .from("terms")
      .select("*", { count: "exact", head: true });
    expect(error, `Supabase error: ${error?.message}`).toBeNull();
    expect(count ?? 0, `expected ≥ 105 terms, got ${count}`).toBeGreaterThanOrEqual(105);
  });

  test("terms exist for all 13 topics", async () => {
    const sb = getAdminClient();
    const { data, error } = await sb.from("terms").select("topic").neq("topic", "general");
    expect(error).toBeNull();
    const seenTopics = new Set((data ?? []).map((r) => r.topic));
    for (const topic of Object.keys(TOPIC_MINIMUMS)) {
      expect(seenTopics.has(topic), `no glossary terms for topic "${topic}"`).toBe(true);
    }
  });
});
