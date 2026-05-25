"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type NavLinkProps = {
  href: string;
  children: React.ReactNode;
  /** Exact match for active state — defaults to startsWith */
  exact?: boolean;
  className?: string;
};

export function NavLink({ href, children, exact = false, className }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm transition-colors",
        isActive
          ? "bg-accent font-medium text-foreground"
          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
        className,
      )}
    >
      {children}
    </Link>
  );
}
