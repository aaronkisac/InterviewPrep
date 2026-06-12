"use client";

// Registry of named concept-step diagrams (`visual: "component-tree"` in step
// JSON). Each diagram animates a build-in sequence and offers a replay button;
// unknown names render nothing so content can reference diagrams that ship
// later without breaking lessons.

import { RotateCcw } from "lucide-react";
import { useState } from "react";

import { usePrefersReducedMotion } from "@/lib/course/use-reduced-motion";
import type { Language } from "@/lib/supabase/types";

import { ComponentTree } from "./component-tree";
import { PropsFlow } from "./props-flow";

const VISUALS: Record<
  string,
  React.ComponentType<{ lang: Language; reduced: boolean }>
> = {
  "component-tree": ComponentTree,
  "props-flow": PropsFlow,
};

export function CourseVisual({
  name,
  lang,
}: {
  name: string;
  lang: Language;
}) {
  const reduced = usePrefersReducedMotion();
  const [run, setRun] = useState(0);
  const Visual = VISUALS[name];
  if (!Visual) return null;

  return (
    <figure className="relative rounded-xl border border-border bg-card/60 p-4">
      <Visual key={run} lang={lang} reduced={reduced} />
      {!reduced && (
        <button
          type="button"
          onClick={() => setRun((n) => n + 1)}
          aria-label={lang === "tr" ? "Animasyonu tekrar oynat" : "Replay animation"}
          className="absolute right-2 top-2 rounded-md p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
        </button>
      )}
    </figure>
  );
}
