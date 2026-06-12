"use client";

// Animated explainer: a React component tree building up node by node.
// Theme-aware via Tailwind classes; static when reduced motion is preferred.

import { motion } from "motion/react";

import type { Language } from "@/lib/supabase/types";

const NODES = [
  { id: "app", label: "<App />", x: 150, y: 24 },
  { id: "nav", label: "<Navbar />", x: 70, y: 84 },
  { id: "main", label: "<Main />", x: 230, y: 84 },
  { id: "card1", label: "<Card />", x: 160, y: 144 },
  { id: "card2", label: "<Card />", x: 300, y: 144 },
] as const;

const EDGES = [
  ["app", "nav"],
  ["app", "main"],
  ["main", "card1"],
  ["main", "card2"],
] as const;

export function ComponentTree({
  lang,
  reduced,
}: {
  lang: Language;
  reduced: boolean;
}) {
  const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));
  return (
    <svg
      viewBox="0 0 380 180"
      className="w-full"
      role="img"
      aria-label={
        lang === "tr"
          ? "Bileşen ağacı: App kökünden Navbar ve Main'e, Main'den iki Card bileşenine inen hiyerarşi"
          : "Component tree: App at the root branching to Navbar and Main, with Main rendering two Card components"
      }
    >
      {EDGES.map(([from, to], i) => {
        const a = byId[from]!;
        const b = byId[to]!;
        return (
          <motion.line
            key={`${from}-${to}`}
            x1={a.x}
            y1={a.y + 14}
            x2={b.x}
            y2={b.y - 14}
            strokeWidth="2"
            className="stroke-border"
            initial={reduced ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.35, delay: reduced ? 0 : 0.3 + i * 0.25 }}
          />
        );
      })}
      {NODES.map((node, i) => (
        <motion.g
          key={node.id}
          initial={reduced ? false : { opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: reduced ? 0 : i * 0.25,
          }}
          style={{ transformOrigin: `${node.x}px ${node.y}px` }}
        >
          <rect
            x={node.x - 44}
            y={node.y - 14}
            width="88"
            height="28"
            rx="8"
            className={node.id === "app" ? "fill-primary" : "fill-card stroke-border"}
            strokeWidth="1.5"
          />
          <text
            x={node.x}
            y={node.y}
            textAnchor="middle"
            dominantBaseline="central"
            className={
              node.id === "app"
                ? "fill-primary-foreground font-mono text-[11px] font-semibold"
                : "fill-foreground font-mono text-[11px]"
            }
          >
            {node.label}
          </text>
        </motion.g>
      ))}
    </svg>
  );
}
