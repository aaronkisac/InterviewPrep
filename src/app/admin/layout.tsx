import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { NavLink } from "@/components/nav-link";

async function isAdmin(userId: string): Promise<boolean> {
  const sb = createAdminClient();
  const { data } = await sb
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();
  return data?.role === "admin";
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) redirect("/signin");

  const admin = await isAdmin(session.user.id);
  if (!admin) redirect("/");

  return (
    <div className="flex flex-1 flex-col">
      {/* Admin sub-nav — sits below the global Navbar */}
      <div className="border-b border-border bg-muted/40">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-1 px-6 py-1.5">
          <span className="mr-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Admin
          </span>
          <NavLink href="/admin/questions">Questions</NavLink>
          <NavLink href="/admin/users">Users</NavLink>
        </div>
      </div>

      {children}
    </div>
  );
}
