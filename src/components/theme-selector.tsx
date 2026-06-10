"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { useColorTheme } from "@/components/theme-provider";
import { COLOR_THEMES, type ColorThemeId } from "@/lib/themes";
import { useMounted } from "@/lib/use-mounted";

export function ThemeSelector() {
  const { colorTheme, setColorTheme } = useColorTheme();
  const { resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const mounted = useMounted();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!mounted) return <div className="w-8 h-7" />;

  const isDark = resolvedTheme === "dark";
  const active = COLOR_THEMES.find((t) => t.id === colorTheme) ?? COLOR_THEMES[0];

  function handleSelect(id: ColorThemeId) {
    setColorTheme(id);
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Select color theme"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-ring hover:text-foreground"
      >
        <Swatches colors={isDark ? active.swatchesDark : active.swatches} />
        <span className="hidden sm:inline">{active.label}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-44 rounded-md border border-border bg-card p-1 shadow-md z-50">
          {COLOR_THEMES.map((t) => {
            const isActive = t.id === colorTheme;
            return (
              <button
                key={t.id}
                onClick={() => handleSelect(t.id)}
                className={`flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent/60 ${
                  isActive ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                <Swatches colors={isDark ? t.swatchesDark : t.swatches} size={14} />
                {t.label}
                {isActive && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-auto text-primary"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Swatches({
  colors,
  size = 12,
}: {
  colors: readonly string[];
  size?: number;
}) {
  return (
    <span className="flex items-center" style={{ gap: -size / 4 }}>
      {colors.map((c, i) => (
        <span
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: c,
            border: "1.5px solid rgba(0,0,0,0.12)",
            marginLeft: i > 0 ? -size / 4 : 0,
            display: "inline-block",
            flexShrink: 0,
          }}
        />
      ))}
    </span>
  );
}
