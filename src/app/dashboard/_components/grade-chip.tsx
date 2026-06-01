import { getGrade } from "@/lib/grade";
import { cn } from "@/lib/utils";
import type { Language } from "@/lib/supabase/types";

export function GradeChip({
  pct,
  lang,
}: {
  pct: number;
  lang: Language;
}): React.ReactElement {
  const { label, chipClass } = getGrade(pct, lang);

  return (
    <span className={cn("rounded-md border px-2 py-0.5 text-xs font-medium", chipClass)}>
      {pct}% {label}
    </span>
  );
}
