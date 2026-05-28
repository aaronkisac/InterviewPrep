"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Topic } from "@/lib/supabase/types";

// ============================================================================
// Types
// ============================================================================

export type SubmitQuestionInput = {
  topic: Topic;
  level: 1 | 2 | 3 | 4 | 5;
  question: string;
  answer_general: string;
  /** true = submit for community review; false = private (only you see it) */
  is_shared: boolean;
};

export type SubmissionRow = {
  id: string;
  topic: Topic;
  level: number;
  level_label: string;
  question: string;
  answer_general: string;
  is_shared: boolean;
  status: string;
  created_at: string;
};

// ============================================================================
// User: submit a question
// ============================================================================

export async function submitQuestion(
  input: SubmitQuestionInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not authenticated" };

  const userId = session.user.id;

  const LEVEL_LABELS: Record<number, string> = {
    1: "Entry",
    2: "Junior",
    3: "Mid",
    4: "Senior",
    5: "Expert",
  };

  // Server action has already verified the session via NextAuth.
  // Use the admin (service-role) client — Supabase auth.uid() is not set in
  // JWT-strategy NextAuth sessions, so the anon client would fail RLS.
  const sb = createAdminClient();

  const { data, error } = await sb
    .from("questions")
    .insert({
      topic: input.topic,
      level: input.level,
      level_label: LEVEL_LABELS[input.level],
      question: input.question.trim(),
      answer_general: input.answer_general.trim(),
      answer_general_tr: "",
      is_seed: false,
      // Private questions go live immediately; public ones await admin review
      is_shared: input.is_shared,
      status: input.is_shared ? "pending" : "active",
      created_by: userId,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  revalidatePath("/questions");
  revalidatePath("/dashboard");

  return { ok: true, id: data.id };
}

// ============================================================================
// User: get own submissions
// ============================================================================

export async function getUserSubmissions(): Promise<SubmissionRow[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  // Use admin client: NextAuth JWT strategy means auth.uid() is null in
  // Supabase, so the anon client's RLS policy would return no rows.
  // We manually filter by created_by = userId instead.
  const sb = createAdminClient();

  const { data, error } = await sb
    .from("questions")
    .select(
      "id, topic, level, level_label, question, answer_general, is_shared, status, created_at",
    )
    .eq("created_by", session.user.id)
    .eq("is_seed", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getUserSubmissions] error:", error.message);
    return [];
  }

  return (data ?? []) as SubmissionRow[];
}

// ============================================================================
// Admin: list pending community submissions
// ============================================================================

export type AdminSubmissionRow = SubmissionRow & {
  submitted_by_email: string | null;
};

export async function getPendingSubmissions(): Promise<AdminSubmissionRow[]> {
  const session = await auth();
  if (!session?.user) return [];

  const sb = createAdminClient();

  const { data, error } = await sb
    .from("questions")
    .select(
      "id, topic, level, level_label, question, answer_general, is_shared, status, created_at, created_by",
    )
    .eq("status", "pending")
    .eq("is_shared", true)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[getPendingSubmissions] query error:", error.message);
    return [];
  }

  const rows = (data ?? []) as (SubmissionRow & { created_by: string | null })[];

  // Fetch submitter emails separately so a missing FK doesn't break the list
  const userIds = [...new Set(rows.map((r) => r.created_by).filter(Boolean))] as string[];
  const emailMap: Record<string, string> = {};

  if (userIds.length > 0) {
    const { data: users, error: usersError } = await sb
      .from("users")
      .select("id, email")
      .in("id", userIds);

    if (usersError) {
      console.error("[getPendingSubmissions] users lookup error:", usersError.message);
    } else {
      for (const u of users ?? []) {
        emailMap[(u as { id: string; email: string }).id] = (u as { id: string; email: string }).email;
      }
    }
  }

  return rows.map((row) => ({
    ...row,
    submitted_by_email: row.created_by ? (emailMap[row.created_by] ?? null) : null,
  }));
}

// ============================================================================
// Admin: approve a pending question
// ============================================================================

export async function approveQuestion(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Not authenticated" };

  // Role check — read from DB to avoid stale JWT
  const sb = createAdminClient();
  const { data: userRow } = await sb
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (userRow?.role !== "admin" && userRow?.role !== "super_admin") return { ok: false, error: "Forbidden" };

  const { error } = await sb
    .from("questions")
    .update({ status: "active" })
    .eq("id", id)
    .eq("status", "pending");

  if (error) return { ok: false, error: error.message };

  revalidatePath("/questions");
  revalidatePath("/admin/questions");

  return { ok: true };
}

// ============================================================================
// Admin: reject a pending question
// ============================================================================

export async function rejectQuestion(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Not authenticated" };

  const sb = createAdminClient();
  const { data: userRow } = await sb
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (userRow?.role !== "admin" && userRow?.role !== "super_admin") return { ok: false, error: "Forbidden" };

  const { error } = await sb
    .from("questions")
    .update({ status: "rejected", is_shared: false })
    .eq("id", id)
    .eq("status", "pending");

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/questions");

  return { ok: true };
}

// ============================================================================
// User: delete own question (non-seed only)
// ============================================================================

export async function deleteOwnQuestion(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not authenticated" };

  const sb = createAdminClient();

  const { data: row } = await sb
    .from("questions")
    .select("id, created_by, is_seed")
    .eq("id", id)
    .single();

  if (!row) return { ok: false, error: "Not found" };
  if (row.is_seed) return { ok: false, error: "Cannot delete seed questions" };
  if (row.created_by !== session.user.id) return { ok: false, error: "Forbidden" };

  const { error } = await sb.from("questions").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/questions");

  return { ok: true };
}

// ============================================================================
// Admin: hard-delete any question
// ============================================================================

export async function adminDeleteQuestion(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not authenticated" };

  const sb = createAdminClient();
  const { data: userRow } = await sb
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (userRow?.role !== "admin" && userRow?.role !== "super_admin") return { ok: false, error: "Forbidden" };

  const { error } = await sb.from("questions").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/questions");
  revalidatePath("/admin/questions");

  return { ok: true };
}
