import Link from "next/link";

import { auth, signOut } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLang } from "@/lib/lang";
import { i18nNav } from "@/lib/i18n";
import { NavLink } from "@/components/nav-link";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemeSelector } from "@/components/theme-selector";
import { MobileNav } from "@/components/mobile-nav";
import { NavSettings } from "@/components/nav-settings";
import { Logo } from "@/components/logo";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  Shield,
} from "lucide-react";
import { LangToggle } from "@/components/lang-toggle";

export async function Navbar() {
  const session = await auth().catch(() => null);
  const user = session?.user;
  const lang = await getLang();
  const nav = i18nNav[lang];

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
    <nav className="fixed top-0 left-0 right-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-[1200px] items-center gap-2 px-4 sm:px-6 py-2">
        {/* Brand */}
        <Link
          href="/"
          className="mr-4 flex shrink-0 items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <Logo size={20} />
          Interview Prep
        </Link>

        {/* Desktop nav — hidden below 800px. Between 800–1200px the links are
            icon-only (labels kept in the a11y tree via sr-only); full labels
            appear at >=1200px. */}
        <div className="hidden min-[800px]:flex items-center gap-1">
          <NavLink href="/learn">
            <GraduationCap className="size-4" aria-hidden="true" />
            <span className="sr-only min-[1200px]:not-sr-only">{nav.learn}</span>
          </NavLink>
          <NavLink href="/questions">
            <ListChecks className="size-4" aria-hidden="true" />
            <span className="sr-only min-[1200px]:not-sr-only">{nav.questions}</span>
          </NavLink>
          {user && (
            <NavLink href="/mock">
              <MessageSquare className="size-4" aria-hidden="true" />
              <span className="sr-only min-[1200px]:not-sr-only">{nav.mock}</span>
            </NavLink>
          )}
          {user && (
            <NavLink href="/glossary">
              <BookOpen className="size-4" aria-hidden="true" />
              <span className="sr-only min-[1200px]:not-sr-only">{nav.glossary}</span>
            </NavLink>
          )}
          {isAdmin && (
            <NavLink
              href="/admin/questions"
              className="text-violet-600 hover:text-violet-700 dark:text-violet-400"
            >
              <Shield className="size-4" aria-hidden="true" />
              <span className="sr-only min-[1200px]:not-sr-only">{nav.admin}</span>
            </NavLink>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Language + theme controls — inline only at >=1200px; below that they
            collapse into the settings gear so the bar stays on one line. */}
        <div className="hidden min-[1200px]:flex items-center gap-1">
          <LangToggle />
          <ThemeSelector />
          <ThemeToggle />
        </div>

        {/* Settings gear — holds lang/theme controls below 1200px (mid + mobile) */}
        <div className="min-[1200px]:hidden">
          <NavSettings />
        </div>

        {/* Desktop auth — hidden below 800px */}
        {user ? (
          <div className="hidden min-[800px]:flex items-center gap-1">
            <NavLink href="/dashboard" exact>
              <LayoutDashboard className="size-4" aria-hidden="true" />
              <span className="sr-only min-[1200px]:not-sr-only">{nav.dashboard}</span>
            </NavLink>
            <form action={handleSignOut}>
              <button
                type="submit"
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
              >
                {nav.signOut}
              </button>
            </form>
          </div>
        ) : (
          <Link
            href="/signin"
            className="hidden min-[800px]:inline-flex rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
          >
            {nav.signIn}
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
