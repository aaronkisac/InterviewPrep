import { i18nDashboard } from "@/lib/i18n";
import type { Language } from "@/lib/supabase/types";

type DashboardI18n = (typeof i18nDashboard)[Language];

export function StatusChip({
  status,
  isShared,
  i18n,
}: {
  status: string;
  isShared: boolean;
  i18n: DashboardI18n;
}): React.ReactElement {
  if (!isShared) {
    return (
      <span className="shrink-0 rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
        {i18n.private}
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="shrink-0 rounded-md border border-amber-500/40 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
        {i18n.pendingReview}
      </span>
    );
  }
  if (status === "active") {
    return (
      <span className="shrink-0 rounded-md border border-emerald-500/40 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
        {i18n.published}
      </span>
    );
  }
  return (
    <span className="shrink-0 rounded-md border border-rose-500/40 bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
      {i18n.rejected}
    </span>
  );
}
