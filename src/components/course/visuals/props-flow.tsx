"use client";

// Animated explainer: one-way data flow — props travel parent → child,
// events bubble back up via callbacks. A dot rides each arrow.

import { motion } from "motion/react";

import type { Language } from "@/lib/supabase/types";

export function PropsFlow({
  lang,
  reduced,
}: {
  lang: Language;
  reduced: boolean;
}) {
  return (
    <svg
      viewBox="0 0 380 190"
      className="w-full"
      role="img"
      aria-label={
        lang === "tr"
          ? "Tek yönlü veri akışı: props Parent bileşeninden Child bileşenine aşağı akar; Child, olayları callback ile yukarı bildirir"
          : "One-way data flow: props flow down from the Parent component to the Child; the Child reports events back up through callbacks"
      }
    >
      {/* Parent */}
      <rect x="115" y="12" width="150" height="36" rx="10" className="fill-primary" />
      <text x="190" y="30" textAnchor="middle" dominantBaseline="central" className="fill-primary-foreground font-mono text-[12px] font-semibold">
        {"<Parent />"}
      </text>

      {/* Child */}
      <rect x="115" y="142" width="150" height="36" rx="10" className="fill-card stroke-border" strokeWidth="1.5" />
      <text x="190" y="160" textAnchor="middle" dominantBaseline="central" className="fill-foreground font-mono text-[12px]">
        {"<Child />"}
      </text>

      {/* Props down (left arrow) */}
      <motion.path
        d="M 150 52 L 150 138"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="stroke-primary"
        fill="none"
        initial={reduced ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: reduced ? 0 : 0.2 }}
      />
      <polygon points="150,140 145,130 155,130" className="fill-primary" />
      {!reduced && (
        <motion.circle
          r="4"
          cx="150"
          className="fill-primary"
          initial={{ cy: 56 }}
          animate={{ cy: 132 }}
          transition={{ duration: 1.1, delay: 0.4, repeat: Infinity, repeatDelay: 0.8, ease: "easeInOut" }}
        />
      )}
      <text x="138" y="95" textAnchor="end" dominantBaseline="central" className="fill-foreground text-[11px] font-medium">
        props ↓
      </text>

      {/* Events up (right arrow) */}
      <motion.path
        d="M 230 138 L 230 52"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="6 5"
        className="stroke-muted-foreground"
        fill="none"
        initial={reduced ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: reduced ? 0 : 0.7 }}
      />
      <polygon points="230,50 225,60 235,60" className="fill-muted-foreground" />
      <text x="242" y="95" dominantBaseline="central" className="fill-muted-foreground text-[11px] font-medium">
        {lang === "tr" ? "callback ↑" : "callbacks ↑"}
      </text>
    </svg>
  );
}
