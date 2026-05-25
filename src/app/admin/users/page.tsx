import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { listAllUsers, setUserRole } from "@/lib/actions/admin";
import type { UserRole } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Users" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) redirect("/signin");

  const params = await searchParams;
  const message = params.message;
  const errorMsg = params.error;

  const users = await listAllUsers();

  async function handleRoleChange(formData: FormData) {
    "use server";
    const userId = formData.get("userId") as string;
    const newRole = formData.get("role") as UserRole;

    const result = await setUserRole(userId, newRole);
    if (!result.ok) {
      redirect(
        `/admin/users?error=${encodeURIComponent(result.error ?? "Unknown error")}`,
      );
    }
    redirect("/admin/users?message=updated");
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {users.length} registered {users.length === 1 ? "user" : "users"}.
          Assign or revoke the admin role below.
        </p>
      </div>

      {/* Flash messages */}
      {message === "updated" && (
        <div className="rounded-md border border-emerald-500/40 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          ✓ Role updated successfully.
        </div>
      )}
      {errorMsg && (
        <div className="rounded-md border border-rose-500/40 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
          {errorMsg}
        </div>
      )}

      {users.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">No users yet.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card divide-y divide-border">
          {users.map((u) => {
            const isSelf = u.id === session.user?.id;
            return (
              <div
                key={u.id}
                className="flex items-center gap-4 px-4 py-3"
              >
                {/* Avatar initials */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                  {(u.name ?? u.email).charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  {u.name && (
                    <p className="text-sm font-medium truncate">{u.name}</p>
                  )}
                  <p className="text-xs text-muted-foreground truncate">
                    {u.email}
                    {isSelf && (
                      <span className="ml-1 text-muted-foreground">(you)</span>
                    )}
                  </p>
                </div>

                {/* Current role chip */}
                <RoleChip role={u.role} />

                {/* Role toggle form */}
                {!isSelf && (
                  <form action={handleRoleChange}>
                    <input type="hidden" name="userId" value={u.id} />
                    <input
                      type="hidden"
                      name="role"
                      value={u.role === "admin" ? "user" : "admin"}
                    />
                    <button
                      type="submit"
                      className="rounded-md border border-border px-3 py-1 text-xs font-medium hover:bg-accent"
                    >
                      {u.role === "admin" ? "Revoke admin" : "Make admin"}
                    </button>
                  </form>
                )}

                {/* Joined date */}
                <span className="shrink-0 text-xs text-muted-foreground hidden sm:block">
                  {new Date(u.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

function RoleChip({ role }: { role: UserRole }) {
  if (role === "admin") {
    return (
      <span className="shrink-0 rounded-md border border-violet-500/40 bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
        Admin
      </span>
    );
  }
  return (
    <span className="shrink-0 rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
      User
    </span>
  );
}
