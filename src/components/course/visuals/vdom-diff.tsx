"use client";

// Animated explainer: reconciliation. Two virtual trees (previous / next) are
// compared; only the changed node is highlighted and patched into the DOM.

import { motion } from "motion/react";

import type { Language } from "@/lib/supabase/types";

function TreeNode({
  x,
  y,
  label,
  variant = "plain",
}: {
  x: number;
  y: number;
  label: string;
  variant?: "plain" | "changed";
}) {
  return (
    <g>
      <rect
        x={x - 34}
        y={y - 12}
        width="68"
        height="24"
        rx="6"
        strokeWidth="1.5"
        className={
          variant === "changed"
            ? "fill-amber-500/20 stroke-amber-500"
            : "fill-card stroke-border"
        }
      />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-foreground font-mono text-[10px]"
      >
        {label}
      </text>
    </g>
  );
}

export function VdomDiff({
  lang,
  reduced,
}: {
  lang: Language;
  reduced: boolean;
}) {
  const tr = lang === "tr";
  return (
    <svg
      viewBox="0 0 380 210"
      className="w-full"
      role="img"
      aria-label={
        tr
          ? "Reconciliation: önceki ve yeni sanal DOM ağaçları karşılaştırılır; yalnızca değişen düğüm gerçek DOM'a yazılır"
          : "Reconciliation: the previous and next virtual DOM trees are compared; only the changed node is written to the real DOM"
      }
    >
      {/* Previous tree */}
      <motion.g
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <text x="95" y="14" textAnchor="middle" className="fill-muted-foreground text-[10px] font-semibold uppercase tracking-wide">
          {tr ? "önceki" : "previous"}
        </text>
        <line x1="95" y1="42" x2="55" y2="78" strokeWidth="1.5" className="stroke-border" />
        <line x1="95" y1="42" x2="135" y2="78" strokeWidth="1.5" className="stroke-border" />
        <TreeNode x={95} y={32} label="<ul>" />
        <TreeNode x={55} y={88} label="A" />
        <TreeNode x={135} y={88} label="B: 1" />
      </motion.g>

      {/* Next tree */}
      <motion.g
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: reduced ? 0 : 0.4 }}
      >
        <text x="285" y="14" textAnchor="middle" className="fill-muted-foreground text-[10px] font-semibold uppercase tracking-wide">
          {tr ? "yeni" : "next"}
        </text>
        <line x1="285" y1="42" x2="245" y2="78" strokeWidth="1.5" className="stroke-border" />
        <line x1="285" y1="42" x2="325" y2="78" strokeWidth="1.5" className="stroke-border" />
        <TreeNode x={285} y={32} label="<ul>" />
        <TreeNode x={245} y={88} label="A" />
        <TreeNode x={325} y={88} label="B: 2" variant="changed" />
      </motion.g>

      {/* Diff pulse on the changed node */}
      {!reduced && (
        <motion.rect
          x={291}
          y={76}
          width="68"
          height="24"
          rx="6"
          fill="none"
          strokeWidth="2"
          className="stroke-amber-500"
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: [0, 1, 0], scale: [1, 1.25, 1.4] }}
          transition={{ duration: 1.2, delay: 1, repeat: Infinity, repeatDelay: 1.2 }}
          style={{ transformOrigin: "325px 88px" }}
        />
      )}

      {/* Patch arrow to real DOM */}
      <motion.path
        d="M 325 104 C 325 132, 230 138, 205 152"
        fill="none"
        strokeWidth="2"
        strokeDasharray="5 4"
        className="stroke-amber-500"
        initial={reduced ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: reduced ? 0 : 0.9 }}
      />
      <polygon points="200,155 212,150 208,160" className="fill-amber-500" />

      {/* Real DOM bar */}
      <motion.g
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: reduced ? 0 : 1.1 }}
      >
        <rect x="80" y="150" width="120" height="30" rx="8" className="fill-primary" />
        <text x="140" y="165" textAnchor="middle" dominantBaseline="central" className="fill-primary-foreground text-[11px] font-semibold">
          {tr ? "Gerçek DOM: tek patch" : "Real DOM: one patch"}
        </text>
      </motion.g>
    </svg>
  );
}
