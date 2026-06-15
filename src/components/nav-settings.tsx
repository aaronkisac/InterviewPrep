"use client";

import { useEffect, useRef, useState } from "react";
import { Settings } from "lucide-react";

import { LangToggle } from "@/components/lang-toggle";
import { ThemeSelector } from "@/components/theme-selector";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Compact settings cluster for mid/small widths. Groups the language and theme
 * controls behind a single gear button so the navbar stays on one line below
 * 1200px without dropping the primary nav into the hamburger. At >=1200px the
 * navbar shows these controls inline and hides this trigger.
 */
export function NavSettings() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Settings"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
      >
        <Settings className="size-[18px]" aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 flex items-center gap-2 rounded-md border border-border bg-card p-2 shadow-md">
          <LangToggle />
          <ThemeSelector />
          <ThemeToggle />
        </div>
      )}
    </div>
  );
}
