"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileNavProps {
  user: { name?: string | null; email?: string | null } | undefined;
  isAdmin: boolean;
  signOutAction?: () => Promise<void>;
}

export function MobileNav({ user, isAdmin, signOutAction }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const linkClass =
    "block rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent/60";

  return (
    <div className="relative min-[800px]:hidden" ref={menuRef}>
      <button
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-md border border-border bg-card p-1 shadow-md">
          <Link href="/questions" className={linkClass}>Questions</Link>
          {user && <Link href="/mock" className={linkClass}>Mock</Link>}
          {user && <Link href="/glossary" className={linkClass}>Glossary</Link>}
          {isAdmin && (
            <Link
              href="/admin/questions"
              className={`${linkClass} text-violet-600 dark:text-violet-400`}
            >
              Admin
            </Link>
          )}

          <div className="my-1 border-t border-border" />

          {user ? (
            <>
              <Link href="/dashboard" className={linkClass}>Dashboard</Link>
              {signOutAction && (
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="block w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
                  >
                    Sign out
                  </button>
                </form>
              )}
            </>
          ) : (
            <Link
              href="/signin"
              className="block rounded-md px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-accent/60"
            >
              Sign in
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
