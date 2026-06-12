"use client";

// concept step: a short teaching card (markdown + optional code fences).
// Non-interactive — the bottom bar shows "Continue".

import { MarkdownContent } from "@/components/markdown-content";
import type { ConceptStep } from "@/lib/course/step-schema";
import type { Language } from "@/lib/supabase/types";

export function StepConcept({
  step,
  lang,
}: {
  step: ConceptStep;
  lang: Language;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">
        {lang === "tr" ? step.titleTr : step.title}
      </h2>
      <MarkdownContent
        source={lang === "tr" ? step.bodyTr : step.body}
        lang={lang}
        className="text-[15px]"
      />
    </div>
  );
}
