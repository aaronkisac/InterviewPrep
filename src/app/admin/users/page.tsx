import { redirect } from "next/navigation";

import { getLang } from "@/lib/lang";
import { i18nAdmin } from "@/lib/i18n";

import { auth } from "@/lib/auth";
import { listAllUsers, listSuperAdmins, setUserRole } from "@/lib/actions/admin";
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

  const isSuperAdmin = session.user.role === "super_admin";
  const lang = await getLang();
  const i18n = i18nAdmin[lang];

  const params = await searchParams;
  const message = params.message;
  const errorMsg = params.error;

  const [users, superAdmins] = await Promise.all([
    listAllUsers(),
    isSuperAdmin ? listSuperAdmins() : Promise.resolve([]),
  ]);

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
    <main className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{i18n.usersTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {i18n.usersCount(users.length)}
        </p>
      </div>

      {/* Flash messages */}
      {message === "updated" && (
        <div className="rounded-md border border-emerald-500/40 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          {i18n.roleUpdated}
        </div>
      )}
      {errorMsg && (
        <div className="rounded-md border border-rose-500/40 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
          {errorMsg}
        </div>
      )}

      {/* ── Regular users list ── */}
      {users.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">{i18n.noUsers}</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card divide-y divide-border">
          {users.map((u) => {
            const isSelf = u.id === session.user?.id;
            return (
              <div key={u.id} className="flex items-center gap-4 px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                  {(u.name ?? u.email).charAt(0).toUpperCase()}
                </div>

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

                <RoleChip role={u.role} />

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
                      {u.role === "admin" ? i18n.revokeAdmin : i18n.makeAdmin}
                    </button>
                  </form>
                )}

                <span className="shrink-0 text-xs text-muted-foreground hidden sm:block">
                  {new Date(u.created_at).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-GB", {
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

      {/* ── Super admin section — only visible to super_admin ── */}
      {isSuperAdmin && (
        <section>
          <div className="mb-3">
            <h2 className="text-sm font-medium">{i18n.superAdmins}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {i18n.superAdminsSub}
            </p>
          </div>
          <div className="rounded-lg border border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/20 divide-y divide-amber-500/20">
            {superAdmins.map((u) => (
              <div key={u.id} className="flex items-center gap-4 px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900 text-xs font-semibold text-amber-700 dark:text-amber-300">
                  {(u.name ?? u.email).charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  {u.name && (
                    <p className="text-sm font-medium truncate">{u.name}</p>
                  )}
                  <p className="text-xs text-muted-foreground truncate">
                    {u.email}
                    {u.id === session.user?.id && (
                      <span className="ml-1 text-muted-foreground">(you)</span>
                    )}
                  </p>
                </div>

                <span className="shrink-0 rounded-md border border-amber-500/40 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                  Super Admin
                </span>

                <span className="shrink-0 text-xs text-muted-foreground hidden sm:block">
                  {new Date(u.created_at).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            ))}
          </div>
        </section>
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
