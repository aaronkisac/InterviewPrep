import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { NavLink } from "@/components/nav-link";
import { getLang } from "@/lib/lang";
import { i18nAdmin } from "@/lib/i18n";

async function getRole(userId: string): Promise<string | null> {
  const sb = createAdminClient();
  const { data } = await sb
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();
  return data?.role ?? null;
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) redirect("/signin");

  const role = await getRole(session.user.id);
  if (role !== "admin" && role !== "super_admin") redirect("/");

  const lang = await getLang();
  const i18n = i18nAdmin[lang];

  return (
    <div className="flex flex-1 flex-col">
      {/* Admin sub-nav — sits below the global Navbar */}
      <div className="border-b border-border bg-muted/40">
        <div className="mx-auto flex w-full max-w-[1200px] items-center gap-1 px-4 sm:px-6 py-1.5">
          <span className="mr-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Admin
          </span>
          <NavLink href="/admin/questions">{i18n.navQuestions}</NavLink>
          <NavLink href="/admin/users">{i18n.navUsers}</NavLink>
          <NavLink href="/admin/topics">{i18n.navTopics}</NavLink>
        </div>
      </div>

      {children}
    </div>
  );
}
