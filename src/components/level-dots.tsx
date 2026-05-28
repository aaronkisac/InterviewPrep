import { LEVELS } from "@/lib/topics";
import { cn } from "@/lib/utils";

const LEVEL_COLOURS: Record<number, string> = {
  1: "bg-emerald-500",
  2: "bg-emerald-500",
  3: "bg-yellow-400",
  4: "bg-orange-400",
  5: "bg-red-500",
};

/** 5-dot indicator with tooltip — matches the system questions list style */
export function LevelDots({ level }: { level: number }) {
  const active = LEVEL_COLOURS[level] ?? "bg-emerald-500";
  const label = LEVELS.find((l) => l.value === level)?.label ?? `Level ${level}`;

  return (
    <div className="relative hidden sm:flex items-center gap-[3px] flex-shrink-0 group/dots">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "inline-block h-[5px] w-[5px] rounded-full",
            i < level ? active : "bg-border",
          )}
        />
      ))}
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-[10px] font-medium text-background opacity-0 transition-opacity group-hover/dots:opacity-100">
        {label}
      </span>
    </div>
  );
}

/** Compact text chip: "L3 Mid" — for tight spaces (cards, rows) */
export function LevelChip({ level }: { level: number }) {
  const label = LEVELS.find((l) => l.value === level)?.label ?? "";
  return (
    <span className="shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
      L{level} {label}
    </span>
  );
}
