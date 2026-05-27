"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/supabase/types";

// ============================================================================
// Guard helpers
// ============================================================================

/** Allows both admin and super_admin. Returns caller's userId. */
async function requireAdmin(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const sb = createAdminClient();
  const { data } = await sb
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (data?.role !== "admin" && data?.role !== "super_admin") {
    throw new Error("Forbidden");
  }
  return session.user.id;
}

/** Only super_admin may call this. Returns caller's userId. */
async function requireSuperAdmin(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const sb = createAdminClient();
  const { data } = await sb
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (data?.role !== "super_admin") throw new Error("Forbidden");
  return session.user.id;
}

// ============================================================================
// Types
// ============================================================================

export type AdminUserRow = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  created_at: string;
};

// ============================================================================
// List regular users (admin + user roles) — super_admin excluded
// ============================================================================

export async function listAllUsers(): Promise<AdminUserRow[]> {
  await requireAdmin();

  const sb = createAdminClient();
  const { data, error } = await sb
    .from("users")
    .select("id, email, name, role, created_at")
    .neq("role", "super_admin")
    .order("created_at", { ascending: true });

  if (error) return [];
  return (data ?? []) as AdminUserRow[];
}

// ============================================================================
// List super admins — only callable by super_admin
// ============================================================================

export async function listSuperAdmins(): Promise<AdminUserRow[]> {
  await requireSuperAdmin();

  const sb = createAdminClient();
  const { data, error } = await sb
    .from("users")
    .select("id, email, name, role, created_at")
    .eq("role", "super_admin")
    .order("created_at", { ascending: true });

  if (error) return [];
  return (data ?? []) as AdminUserRow[];
}

// ============================================================================
// Update a user's role
// Rules:
//   - Only admin/super_admin can call this
//   - Cannot target a super_admin user (protected)
//   - Cannot set role to super_admin (only via DB migration)
//   - Cannot demote yourself
// ============================================================================

export async function setUserRole(
  targetUserId: string,
  newRole: UserRole,
): Promise<{ ok: boolean; error?: string }> {
  const callerId = await requireAdmin();

  // Block demoting self
  if (targetUserId === callerId && newRole !== "admin") {
    return { ok: false, error: "You cannot remove your own admin role." };
  }

  // Block setting role to super_admin via this action
  if (newRole === "super_admin") {
    return { ok: false, error: "The super_admin role can only be assigned via database migration." };
  }

  // Block targeting a super_admin
  const sb = createAdminClient();
  const { data: target } = await sb
    .from("users")
    .select("role")
    .eq("id", targetUserId)
    .single();

  if (target?.role === "super_admin") {
    return { ok: false, error: "Super admin accounts cannot be modified." };
  }

  const { error } = await sb
    .from("users")
    .update({ role: newRole })
    .eq("id", targetUserId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/users");
  return { ok: true };
}
