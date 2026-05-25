"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/supabase/types";

// ============================================================================
// Guard helper — reused across admin actions
// ============================================================================

async function requireAdmin(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const sb = createAdminClient();
  const { data } = await sb
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (data?.role !== "admin") throw new Error("Forbidden");
  return session.user.id;
}

// ============================================================================
// List all users
// ============================================================================

export type AdminUserRow = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  created_at: string;
};

export async function listAllUsers(): Promise<AdminUserRow[]> {
  await requireAdmin();

  const sb = createAdminClient();
  const { data, error } = await sb
    .from("users")
    .select("id, email, name, role, created_at")
    .order("created_at", { ascending: true });

  if (error) return [];
  return (data ?? []) as AdminUserRow[];
}

// ============================================================================
// Update a user's role
// ============================================================================

export async function setUserRole(
  targetUserId: string,
  newRole: UserRole,
): Promise<{ ok: boolean; error?: string }> {
  const callerId = await requireAdmin().catch((e: Error) => {
    throw e;
  });

  // Prevent admins from demoting themselves
  if (targetUserId === callerId && newRole !== "admin") {
    return { ok: false, error: "You cannot remove your own admin role." };
  }

  const sb = createAdminClient();
  const { error } = await sb
    .from("users")
    .update({ role: newRole })
    .eq("id", targetUserId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/users");
  return { ok: true };
}
