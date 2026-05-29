import Link from "next/link";

import { auth, signOut } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { NavLink } from "@/components/nav-link";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemeSelector } from "@/components/theme-selector";
import { MobileNav } from "@/components/mobile-nav";

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
      isAdmin = data?.role === "admin" || data?.role === "super_admin";
    } catch {
      // Non-critical — fail silently
    }
  }

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-[1200px] items-center gap-2 px-4 sm:px-6 py-2">
        {/* Brand */}
        <Link
          href="/"
          className="mr-4 shrink-0 text-sm font-semibold tracking-tight"
        >
          Interview Prep
        </Link>

        {/* Desktop nav — hidden below 800px */}
        <div className="hidden min-[800px]:flex items-center gap-1">
          <NavLink href="/questions">Questions</NavLink>
          {user && <NavLink href="/mock">Mock</NavLink>}
          {user && <NavLink href="/glossary">Glossary</NavLink>}
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

        {/* Theme controls */}
        <ThemeSelector />
        <ThemeToggle />

        {/* Desktop auth — hidden below 800px */}
        {user ? (
          <div className="hidden min-[800px]:flex items-center gap-1">
            <NavLink href="/dashboard" exact>
              Dashboard
            </NavLink>
            <form action={handleSignOut}>
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
            className="hidden min-[800px]:inline-flex rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
          >
            Sign in
          </Link>
        )}

        {/* Mobile hamburger — hidden above 800px */}
        <MobileNav
          user={user ? { name: user.name, email: user.email } : undefined}
          isAdmin={isAdmin}
          signOutAction={handleSignOut}
        />
      </div>
    </nav>
  );
}
