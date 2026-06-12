"use client";

// Animated explainer: prop drilling vs context.
// Left: a value hops through every level. Right: a Provider tunnels it
// directly to the consumer.

import { motion } from "motion/react";

import type { Language } from "@/lib/supabase/types";

function Box({
  x,
  y,
  label,
  variant = "plain",
}: {
  x: number;
  y: number;
  label: string;
  variant?: "plain" | "active" | "faded";
}) {
  return (
    <g>
      <rect
        x={x - 40}
        y={y - 11}
        width="80"
        height="22"
        rx="6"
        strokeWidth="1.5"
        className={
          variant === "active"
            ? "fill-primary"
            : variant === "faded"
              ? "fill-card stroke-border opacity-50"
              : "fill-card stroke-border"
        }
      />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        className={
          variant === "active"
            ? "fill-primary-foreground font-mono text-[9px] font-semibold"
            : "fill-foreground font-mono text-[9px]"
        }
      >
        {label}
      </text>
    </g>
  );
}

export function ContextTunnel({
  lang,
  reduced,
}: {
  lang: Language;
  reduced: boolean;
}) {
  const tr = lang === "tr";
  const L = 95;
  const R = 285;
  const rows = [30, 70, 110, 150];

  return (
    <svg
      viewBox="0 0 380 200"
      className="w-full"
      role="img"
      aria-label={
        tr
          ? "Prop drilling'de değer her seviyeden elden ele geçer; context'te Provider değeri doğrudan okuyan bileşene ulaştırır"
          : "With prop drilling the value is handed through every level; with context the Provider delivers it straight to the component that reads it"
      }
    >
      <text x={L} y="14" textAnchor="middle" className="fill-muted-foreground text-[10px] font-semibold uppercase tracking-wide">
        {tr ? "prop drilling" : "prop drilling"}
      </text>
      <text x={R} y="14" textAnchor="middle" className="fill-muted-foreground text-[10px] font-semibold uppercase tracking-wide">
        context
      </text>

      {/* Left chain — every hop passes the prop */}
      {["<App theme>", "<Layout theme>", "<Sidebar theme>", "<Button theme>"].map(
        (label, i) => (
          <motion.g
            key={label}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduced ? 0 : i * 0.3 }}
          >
            <Box
              x={L}
              y={rows[i]!}
              label={label}
              variant={i === 0 || i === 3 ? "plain" : "faded"}
            />
            {i < 3 && (
              <motion.line
                x1={L}
                y1={rows[i]! + 11}
                x2={L}
                y2={rows[i + 1]! - 11}
                strokeWidth="2"
                className="stroke-border"
                initial={reduced ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.25, delay: reduced ? 0 : 0.15 + i * 0.3 }}
              />
            )}
          </motion.g>
        ),
      )}
      <text x={L} y="180" textAnchor="middle" className="fill-muted-foreground text-[9px]">
        {tr ? "aradakiler sadece taşıyor" : "middle layers just carry it"}
      </text>

      {/* Right chain — provider tunnels to consumer */}
      {["<ThemeProvider>", "<Layout>", "<Sidebar>", "useContext(Theme)"].map(
        (label, i) => (
          <motion.g
            key={label}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduced ? 0 : 1.2 + i * 0.15 }}
          >
            <Box
              x={R}
              y={rows[i]!}
              label={label}
              variant={i === 0 || i === 3 ? "active" : "faded"}
            />
          </motion.g>
        ),
      )}

      {/* Tunnel arc */}
      <motion.path
        d={`M ${R + 48} ${rows[0]} C ${R + 85} ${rows[1]}, ${R + 85} ${rows[2]}, ${R + 48} ${rows[3]}`}
        fill="none"
        strokeWidth="2.5"
        className="stroke-primary"
        initial={reduced ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: reduced ? 0 : 1.9 }}
      />
      <motion.polygon
        points={`${R + 44},${rows[3]! - 2} ${R + 56},${rows[3]! - 8} ${R + 53},${rows[3]! + 4}`}
        className="fill-primary"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 2.4 }}
      />
      <text x={R} y="180" textAnchor="middle" className="fill-muted-foreground text-[9px]">
        {tr ? "değer doğrudan tünellenir" : "the value tunnels straight down"}
      </text>
    </svg>
  );
}
