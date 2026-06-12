"use client";

// Animated explainer: why hooks must be called in the same order each render.
// React identifies hooks by call position — a conditional hook shifts every
// slot after it and the state gets mixed up.

import { motion } from "motion/react";

import type { Language } from "@/lib/supabase/types";

const SLOT_H = 26;
const SLOT_W = 132;

function Slot({
  x,
  y,
  label,
  variant,
}: {
  x: number;
  y: number;
  label: string;
  variant: "ok" | "skipped" | "broken";
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={SLOT_W}
        height={SLOT_H - 6}
        rx="6"
        strokeWidth="1.5"
        strokeDasharray={variant === "skipped" ? "4 3" : undefined}
        className={
          variant === "broken"
            ? "fill-rose-500/15 stroke-rose-500"
            : variant === "skipped"
              ? "fill-transparent stroke-border"
              : "fill-card stroke-border"
        }
      />
      <text
        x={x + SLOT_W / 2}
        y={y + (SLOT_H - 6) / 2}
        textAnchor="middle"
        dominantBaseline="central"
        className={
          variant === "skipped"
            ? "fill-muted-foreground font-mono text-[9px] italic"
            : "fill-foreground font-mono text-[9px]"
        }
      >
        {label}
      </text>
    </g>
  );
}

export function HookRules({
  lang,
  reduced,
}: {
  lang: Language;
  reduced: boolean;
}) {
  const tr = lang === "tr";
  const left = 26;
  const right = 222;
  const top = 34;

  const render1 = ["useState(name)", "useState(age)", "useEffect(sync)"];
  const render2 = [
    { label: tr ? "if(x) atlandı!" : "if(x) skipped!", variant: "skipped" as const },
    { label: "useState(age) ←", variant: "broken" as const },
    { label: "useEffect(sync) ←", variant: "broken" as const },
  ];

  return (
    <svg
      viewBox="0 0 380 160"
      className="w-full"
      role="img"
      aria-label={
        tr
          ? "Hook kuralları: React hook'ları çağrı sırasına göre eşler; koşula bağlı bir hook atlanırsa sonraki tüm hook'lar yanlış state'i okur"
          : "Rules of hooks: React matches hooks by call order; if a conditional hook is skipped, every later hook reads the wrong state"
      }
    >
      <text x={left + SLOT_W / 2} y="18" textAnchor="middle" className="fill-muted-foreground text-[10px] font-semibold uppercase tracking-wide">
        {tr ? "1. render" : "render #1"}
      </text>
      <text x={right + SLOT_W / 2} y="18" textAnchor="middle" className="fill-muted-foreground text-[10px] font-semibold uppercase tracking-wide">
        {tr ? "2. render (koşullu hook)" : "render #2 (conditional hook)"}
      </text>

      {render1.map((label, i) => (
        <motion.g
          key={label}
          initial={reduced ? false : { opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: reduced ? 0 : i * 0.2 }}
        >
          <Slot x={left} y={top + i * SLOT_H} label={`${i + 1}. ${label}`} variant="ok" />
        </motion.g>
      ))}

      {render2.map((slot, i) => (
        <motion.g
          key={slot.label}
          initial={reduced ? false : { opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: reduced ? 0 : 0.8 + i * 0.25 }}
        >
          <Slot x={right} y={top + i * SLOT_H} label={`${i + 1}. ${slot.label}`} variant={slot.variant} />
        </motion.g>
      ))}

      {/* Mismatch arrows */}
      {[1, 2].map((row, i) => (
        <motion.line
          key={row}
          x1={left + SLOT_W + 6}
          y1={top + (row - 1) * SLOT_H + 10}
          x2={right - 6}
          y2={top + row * SLOT_H + 10}
          strokeWidth="1.5"
          strokeDasharray="4 3"
          className="stroke-rose-500"
          initial={reduced ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: reduced ? 0 : 1.6 + i * 0.2 }}
        />
      ))}

      <motion.text
        x="190"
        y="148"
        textAnchor="middle"
        className="fill-rose-600 dark:fill-rose-400 text-[10px] font-medium"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 2 }}
      >
        {tr
          ? "Sıra kaydı → state yanlış hook'a gider. Bu yüzden hook'lar hep en üst seviyede."
          : "Order shifted → state lands on the wrong hook. That's why hooks stay at the top level."}
      </motion.text>
    </svg>
  );
}
