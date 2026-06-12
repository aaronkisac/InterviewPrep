"use client";

// Animated explainer: parent re-renders — the plain child re-renders with it
// (flashing), the memo child stays still because its props are unchanged.

import { motion } from "motion/react";

import type { Language } from "@/lib/supabase/types";

export function MemoRerender({
  lang,
  reduced,
}: {
  lang: Language;
  reduced: boolean;
}) {
  const tr = lang === "tr";
  const flash = {
    initial: { opacity: 0 },
    animate: { opacity: [0, 0.5, 0] },
  };

  return (
    <svg
      viewBox="0 0 380 190"
      className="w-full"
      role="img"
      aria-label={
        tr
          ? "Ebeveyn yeniden render olur: memo'suz çocuk her seferinde onunla render olur; React.memo ile sarılmış çocuk props'u değişmediği için atlanır"
          : "The parent re-renders: the child without memo renders with it every time; the child wrapped in React.memo is skipped because its props didn't change"
      }
    >
      {/* Parent */}
      <rect x="125" y="14" width="130" height="32" rx="9" className="fill-primary" />
      <text x="190" y="30" textAnchor="middle" dominantBaseline="central" className="fill-primary-foreground font-mono text-[11px] font-semibold">
        {"<Parent />"}
      </text>
      {/* Parent render flash */}
      {!reduced && (
        <motion.rect
          x="125" y="14" width="130" height="32" rx="9"
          className="fill-white"
          {...flash}
          transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1.4 }}
        />
      )}
      <text x="190" y="60" textAnchor="middle" className="fill-muted-foreground text-[9px]">
        {tr ? "state değişti → render" : "state changed → renders"}
      </text>

      <line x1="160" y1="46" x2="100" y2="98" strokeWidth="1.5" className="stroke-border" />
      <line x1="220" y1="46" x2="280" y2="98" strokeWidth="1.5" className="stroke-border" />

      {/* Plain child — flashes every cycle */}
      <rect x="35" y="98" width="130" height="32" rx="9" strokeWidth="1.5" className="fill-card stroke-rose-500" />
      <text x="100" y="114" textAnchor="middle" dominantBaseline="central" className="fill-foreground font-mono text-[11px]">
        {"<Child />"}
      </text>
      {!reduced && (
        <motion.rect
          x="35" y="98" width="130" height="32" rx="9"
          className="fill-rose-500"
          {...flash}
          transition={{ duration: 0.8, delay: 0.3, repeat: Infinity, repeatDelay: 1.4 }}
        />
      )}
      <text x="100" y="148" textAnchor="middle" className="fill-rose-600 dark:fill-rose-400 text-[9px] font-medium">
        {tr ? "her seferinde render olur" : "re-renders every time"}
      </text>

      {/* Memo child — stays still */}
      <rect x="215" y="98" width="130" height="32" rx="9" strokeWidth="1.5" className="fill-card stroke-emerald-500" />
      <text x="280" y="114" textAnchor="middle" dominantBaseline="central" className="fill-foreground font-mono text-[11px]">
        {"memo(<Child />)"}
      </text>
      <text x="280" y="148" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 text-[9px] font-medium">
        {tr ? "props aynı → atlanır ✓" : "same props → skipped ✓"}
      </text>

      <text x="190" y="178" textAnchor="middle" className="fill-muted-foreground text-[10px]">
        {tr
          ? "memo, props'u referansla karşılaştırır — inline nesne/fonksiyon prop'u bu korumayı bozar"
          : "memo compares props by reference — inline object/function props defeat it"}
      </text>
    </svg>
  );
}
