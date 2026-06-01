"use server";

import { auth } from "@/lib/auth";
import { getLevelLabelEn } from "@/lib/levels";
import { createAdminClient } from "@/lib/supabase/admin";
import type { MockOptionInput } from "@/types/mock";

export type SystemTopic = {
  slug: string;
  name: string;
  is_builtin: boolean;
  created_at: string;
  question_count: number;
};

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  if (session.user.role !== "admin" && session.user.role !== "super_admin") throw new Error("Not admin");
  return session.user.id;
}

export async function listSystemTopics(): Promise<SystemTopic[]> {
  const sb = createAdminClient();
  const { data: topics } = await sb
    .from("system_topics")
    .select("slug, name, is_builtin, created_at")
    .order("is_builtin", { ascending: false })
    .order("name", { ascending: true });

  if (!topics || topics.length === 0) return [];

  const { data: counts } = await sb
    .from("questions")
    .select("topic")
    .eq("status", "active")
    .in("topic", topics.map((t) => t.slug));

  const countMap: Record<string, number> = {};
  for (const row of counts ?? []) {
    countMap[row.topic] = (countMap[row.topic] ?? 0) + 1;
  }

  return topics.map((t) => ({ ...t, question_count: countMap[t.slug] ?? 0 }));
}

export async function createSystemTopic(
  name: string,
  slug: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const adminId = await requireAdmin();
  const sb = createAdminClient();

  const trimmedName = name.trim();
  const trimmedSlug = slug.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  if (!trimmedName) return { ok: false, error: "Name is required" };
  if (!trimmedSlug) return { ok: false, error: "Slug is required" };

  const { error } = await sb.from("system_topics").insert({
    slug: trimmedSlug,
    name: trimmedName,
    is_builtin: false,
    created_by: adminId,
  });

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Slug already exists" };
    console.error("[createSystemTopic]", error.message);
    return { ok: false, error: "Failed to create topic" };
  }
  return { ok: true };
}

export async function deleteSystemTopic(
  slug: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const sb = createAdminClient();

  // Prevent deleting builtin topics
  const { data: topic } = await sb
    .from("system_topics")
    .select("is_builtin")
    .eq("slug", slug)
    .maybeSingle();

  if (topic?.is_builtin) return { ok: false, error: "Cannot delete a builtin topic" };

  const { error } = await sb.from("system_topics").delete().eq("slug", slug);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ── JSON bulk import ──────────────────────────────────────────────────────────

/** @deprecated Use MockOptionInput from @/types/mock */
export type MockOption = MockOptionInput;

export type BulkImportQuestion = {
  question: string;
  level: number;
  answerGeneral: string;
  topic?: string;
  answerGeneralTr?: string;
  answerPersonal?: string;
  answerPersonalTr?: string;
  detailMd?: string;
  detailMdTr?: string;
  mock_options?: MockOptionInput[];
};

export async function bulkImportSystemQuestions(
  topicSlug: string,
  questions: BulkImportQuestion[],
): Promise<{ ok: boolean; inserted: number; error?: string }> {
  const adminId = await requireAdmin();
  const sb = createAdminClient();

  if (questions.length === 0) return { ok: false, inserted: 0, error: "No questions provided" };

  const rows = questions.map((q) => ({
    topic: q.topic?.trim() || topicSlug,
    level: q.level,
    level_label: getLevelLabelEn(q.level),
    question: q.question.trim(),
    answer_general: q.answerGeneral.trim(),
    answer_general_tr: q.answerGeneralTr?.trim() ?? "",
    answer_personal: q.answerPersonal?.trim() ?? null,
    answer_personal_tr: q.answerPersonalTr?.trim() ?? null,
    detail_md: q.detailMd?.trim() ?? null,
    detail_md_tr: q.detailMdTr?.trim() ?? null,
    is_seed: false,
    is_shared: true,
    status: "active",
    created_by: adminId,
  }));

  const { data: inserted, error } = await sb
    .from("questions")
    .insert(rows)
    .select("id, question");

  if (error) {
    console.error("[bulkImportSystemQuestions]", error.message);
    return { ok: false, inserted: 0, error: error.message };
  }

  // Insert mock_options for questions that include exactly 4 options
  const withOptions = questions.filter(
    (q) => Array.isArray(q.mock_options) && q.mock_options.length === 4,
  );

  if (withOptions.length > 0 && inserted) {
    const optionRows: Array<{
      question_id: string;
      option_text: string;
      is_correct: boolean;
      explanation: string | null;
    }> = [];

    for (const q of withOptions) {
      const match = inserted.find((r) => r.question === q.question.trim());
      if (!match) continue;
      for (const opt of q.mock_options!) {
        optionRows.push({
          question_id: match.id,
          option_text: opt.optionText.trim(),
          is_correct: opt.isCorrect,
          explanation: opt.explanation?.trim() ?? null,
        });
      }
    }

    if (optionRows.length > 0) {
      const { error: optErr } = await sb.from("mock_options").insert(optionRows);
      if (optErr) {
        // Questions already inserted — log but don't fail the whole import
        console.error("[bulkImportSystemQuestions] mock_options insert failed:", optErr.message);
      }
    }
  }

  return { ok: true, inserted: inserted?.length ?? rows.length };
}
