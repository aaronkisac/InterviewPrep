"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export function ProgressBar({
  current,
  total,
  quitLabel,
  questionLabel,
}: {
  current: number;
  total: number;
  quitLabel: string;
  questionLabel?: string;
}) {
  const pct = Math.round((current / total) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{questionLabel ?? `${current} / ${total}`}</span>
        <Link href="/mock" className="hover:text-foreground hover:underline">
          {quitLabel}
        </Link>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div
          className={cn("h-full bg-foreground transition-all")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
