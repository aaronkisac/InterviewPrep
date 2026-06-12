"use client";

// Animated explainer: when effects actually run.
// render → commit → paint → effect; on re-render the previous effect's
// cleanup runs before the next effect.

import { motion } from "motion/react";

import type { Language } from "@/lib/supabase/types";

const STAGES = (tr: boolean) =>
  [
    { label: "render", sub: tr ? "saf hesap" : "pure calc", x: 50 },
    { label: "commit", sub: tr ? "DOM yazılır" : "DOM written", x: 140 },
    { label: "paint", sub: tr ? "tarayıcı çizer" : "browser paints", x: 230 },
    { label: "effect", sub: tr ? "kodun çalışır" : "your code runs", x: 320 },
  ] as const;

export function EffectTimeline({
  lang,
  reduced,
}: {
  lang: Language;
  reduced: boolean;
}) {
  const tr = lang === "tr";
  const stages = STAGES(tr);
  return (
    <svg
      viewBox="0 0 380 170"
      className="w-full"
      role="img"
      aria-label={
        tr
          ? "Effect zaman çizelgesi: render, commit ve tarayıcı boyaması bittikten sonra effect çalışır; bir sonraki effect'ten önce cleanup çağrılır"
          : "Effect timeline: the effect runs after render, commit and browser paint; cleanup runs before the next effect"
      }
    >
      {/* Track */}
      <line x1="30" y1="60" x2="350" y2="60" strokeWidth="2" className="stroke-border" />

      {stages.map((stage, i) => (
        <motion.g
          key={stage.label}
          initial={reduced ? false : { opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: reduced ? 0 : 0.25 + i * 0.45,
          }}
          style={{ transformOrigin: `${stage.x}px 60px` }}
        >
          <circle
            cx={stage.x}
            cy="60"
            r="11"
            className={i === 3 ? "fill-primary" : "fill-card stroke-border"}
            strokeWidth="1.5"
          />
          <text
            x={stage.x}
            y="60"
            textAnchor="middle"
            dominantBaseline="central"
            className={
              i === 3
                ? "fill-primary-foreground text-[9px] font-bold"
                : "fill-foreground text-[9px] font-semibold"
            }
          >
            {i + 1}
          </text>
          <text x={stage.x} y="88" textAnchor="middle" className="fill-foreground font-mono text-[11px] font-semibold">
            {stage.label}
          </text>
          <text x={stage.x} y="103" textAnchor="middle" className="fill-muted-foreground text-[9px]">
            {stage.sub}
          </text>
        </motion.g>
      ))}

      {/* Traveling dot */}
      {!reduced && (
        <motion.circle
          r="4"
          cy="60"
          className="fill-primary"
          initial={{ cx: 30, opacity: 0 }}
          animate={{ cx: [30, 320], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.8, delay: 0.3, repeat: Infinity, repeatDelay: 1.4, ease: "easeInOut" }}
        />
      )}

      {/* Cleanup loop arrow */}
      <motion.path
        d="M 320 38 C 300 8, 90 8, 56 44"
        fill="none"
        strokeWidth="2"
        strokeDasharray="5 4"
        className="stroke-amber-500"
        initial={reduced ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: reduced ? 0 : 2 }}
      />
      <polygon points="53,48 60,38 66,47" className="fill-amber-500" />
      <motion.text
        x="190"
        y="20"
        textAnchor="middle"
        className="fill-amber-600 dark:fill-amber-400 text-[10px] font-medium"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 2.2 }}
      >
        {tr ? "yeniden render: önce cleanup çalışır" : "re-render: cleanup runs first"}
      </motion.text>

      {/* Footnote */}
      <text x="190" y="140" textAnchor="middle" className="fill-muted-foreground text-[10px]">
        {tr
          ? "Effect'ler ekran güncellendikten SONRA çalışır — render'ı bloklamaz"
          : "Effects run AFTER the screen updates — they never block rendering"}
      </text>
    </svg>
  );
}
