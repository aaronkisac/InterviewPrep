import Link from "next/link";

import { auth, signOut } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { NavLink } from "@/components/nav-link";

export async function Navbar() {
  const session = await auth().catch(() => null);
  const user = session?.user;

  let isAdmin = false;
  if (user?.id) {
    try {
      const sb = createAdminClient();
      const { data } = await sb
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();
      isAdmin = data?.role === "admin";
    } catch {
      // Non-critical — fail silently
    }
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-3xl items-center gap-2 px-6 py-2">
        {/* Brand */}
        <Link
          href="/"
          className="mr-4 shrink-0 text-sm font-semibold tracking-tight"
        >
          Interview Prep
        </Link>

        {/* Primary nav — hidden on very small screens */}
        <div className="hidden items-center gap-1 sm:flex">
          <NavLink href="/questions">Questions</NavLink>
          <NavLink href="/mock">Mock</NavLink>
          <NavLink href="/glossary">Glossary</NavLink>
          {isAdmin && (
            <NavLink
              href="/admin/questions"
              className="text-violet-600 hover:text-violet-700 dark:text-violet-400"
            >
              Admin
            </NavLink>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Auth controls */}
        {user ? (
          <div className="flex items-center gap-1">
            <NavLink href="/dashboard" exact>
              Dashboard
            </NavLink>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
              >
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <Link
            href="/signin"
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
