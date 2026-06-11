import { getGrade } from "@/lib/grade";
import { formatDate } from "@/lib/format-date";
import type { Language } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

export type TrendPoint = {
  pct: number;
  score: number;
  total: number;
  createdAt: string;
};

/**
 * Dependency-free score-trend chart: one bar per session, oldest → newest,
 * coloured with the same grade bands as the rest of the dashboard.
 * Server component — native title tooltips, no client JS.
 */
export function ProgressChart({
  trend,
  lang,
  ariaLabel,
}: {
  trend: TrendPoint[];
  lang: Language;
  ariaLabel: string;
}) {
  if (trend.length < 2) return null;

  const first = trend[0]!;
  const last = trend[trend.length - 1]!;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div role="img" aria-label={ariaLabel} className="relative h-32">
        {/* gridlines at 50% and 100% */}
        <div className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-border/60" />
        <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-border/40" />

        <div className="flex h-full items-end gap-[3px]">
          {trend.map((s, i) => {
            const { barClass } = getGrade(s.pct, lang);
            return (
              <div key={i} className="flex h-full flex-1 items-end">
                <div
                  className={cn("w-full rounded-t-sm opacity-90", barClass)}
                  style={{ height: `${Math.max(s.pct, 3)}%` }}
                  title={`${s.score}/${s.total} — ${s.pct}% · ${formatDate(s.createdAt, lang)}`}
                />
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatDate(first.createdAt, lang)}</span>
        <span>{formatDate(last.createdAt, lang)}</span>
      </div>
    </div>
  );
}
