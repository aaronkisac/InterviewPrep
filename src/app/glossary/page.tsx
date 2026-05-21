import Link from "next/link";

import { groupByTopic, listTerms } from "@/lib/terms";
import { TOPIC_LABELS } from "@/lib/topics";
import type { Topic } from "@/lib/supabase/types";

import { TooltipDemo } from "./_components/tooltip-demo";

export const dynamic = "force-dynamic";

const SECTION_ORDER: Array<{ key: Topic | "general"; label: string }> = [
  { key: "react", label: TOPIC_LABELS.react },
  { key: "typescript", label: TOPIC_LABELS.typescript },
  { key: "nextjs", label: TOPIC_LABELS.nextjs },
  { key: "general", label: "General" },
];

export default async function GlossaryPage() {
  const terms = await listTerms();
  const groups = groupByTopic(terms);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Glossary</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Terms reference
          </h1>
        </div>
        <Link href="/" className="text-sm text-muted-foreground hover:underline">
          Home
        </Link>
      </header>

      <p className="mb-6 text-sm text-muted-foreground">
        {terms.length} {terms.length === 1 ? "term" : "terms"} across React,
        TypeScript, and Next.js. Each entry has a short summary and a full
        definition with code examples.
      </p>

      <TooltipDemo />

      <div className="space-y-10">
        {SECTION_ORDER.map((section) => {
          const items = groups[section.key];
          if (!items || items.length === 0) return null;
          return (
            <section key={section.key}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {section.label}
              </h2>
              <ul className="space-y-2">
                {items.map((term) => (
                  <li key={term.id}>
                    <Link
                      href={`/glossary/${term.slug}`}
                      className="block rounded-lg border border-border bg-card p-4 transition hover:border-foreground/30 hover:bg-accent/50"
                    >
                      <p className="font-medium">{term.label}</p>
                      <p className="mt-1 text-sm leading-snug text-muted-foreground">
                        {term.tooltip}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}
