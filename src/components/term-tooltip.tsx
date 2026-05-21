"use client";

import Link from "next/link";
import { Popover } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * Hover/focus popover showing a term's short tooltip + a link to the
 * full glossary entry. Wrap any inline phrase:
 *
 *   <TermTooltip slug="reconciliation" tooltip="React's diff algorithm…">
 *     reconciliation
 *   </TermTooltip>
 *
 * The tooltip prop is supplied by the parent (typically a Server Component
 * that pre-fetched the term) so we don't make a network call per hover.
 */
export function TermTooltip({
  slug,
  tooltip,
  children,
  className,
}: {
  slug: string;
  tooltip: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            "cursor-help border-b border-dotted border-muted-foreground text-foreground/90 hover:text-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm",
            className,
          )}
        >
          {children}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="z-50 w-72 rounded-lg border border-border bg-card p-3 text-sm shadow-md outline-none"
          sideOffset={4}
        >
          <p className="leading-relaxed text-foreground/90">{tooltip}</p>
          <Link
            href={`/glossary/${slug}`}
            className="mt-2 inline-block text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
          >
            View full definition →
          </Link>
          <Popover.Arrow className="fill-card" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
