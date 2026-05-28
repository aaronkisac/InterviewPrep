import Link from "next/link";

import { groupByTopic, listTerms } from "@/lib/terms";
import type { Topic } from "@/lib/supabase/types";
import { listSystemTopics } from "@/lib/actions/admin-topics";

import { GlossaryTopicTabs } from "./_components/topic-tabs";
import { GlossarySearch } from "./_components/search";
import { TooltipDemo } from "./_components/tooltip-demo";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ topic?: string; q?: string }>;

export default async function GlossaryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const selectedTopic = params.topic ?? "";
  const searchQuery = params.q?.trim().toLowerCase() ?? "";

  const [allTerms, systemTopics] = await Promise.all([listTerms(), listSystemTopics()]);
  const groups = groupByTopic(allTerms);

  // Build section order from DB topics + "general" at the end
  const SECTION_ORDER: Array<{ key: Topic | "general"; label: string }> = [
    ...systemTopics.map((t) => ({ key: t.slug as Topic, label: t.name })),
    { key: "general", label: "General" },
  ];

  // Build available tabs — only topics that have terms
  const availableTabs = SECTION_ORDER
    .filter((s) => (groups[s.key]?.length ?? 0) > 0)
    .map((s) => ({ value: s.key, label: s.label }));

  // Filter terms by selected topic
  const topicFiltered =
    selectedTopic && selectedTopic !== "all"
      ? (groups[selectedTopic as Topic | "general"] ?? [])
      : allTerms;

  // Filter by search query (label + tooltip)
  const filtered = searchQuery
    ? topicFiltered.filter(
        (t) =>
          t.label.toLowerCase().includes(searchQuery) ||
          t.tooltip.toLowerCase().includes(searchQuery),
      )
    : topicFiltered;

  const hasFilter = Boolean(selectedTopic) || Boolean(searchQuery);

  // When a specific topic is selected (or search active), flat list — no section headers
  // When "All" with no search, group by section
  const showSections = !selectedTopic && !searchQuery;

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-5">
        <p className="text-sm font-medium text-muted-foreground">Glossary</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Terms reference
        </h1>
      </header>

      <TooltipDemo />

      {/* Search — always visible */}
      <div className="mb-4 mt-5">
        <GlossarySearch />
      </div>

      {/* Tabs + Panel */}
      <div>
        <GlossaryTopicTabs availableTabs={availableTabs} />

        <div className="rounded-b-lg border-x border-b border-border bg-card px-4 pb-4 pt-3">
          {/* Count + clear */}
          <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {filtered.length} {filtered.length === 1 ? "term" : "terms"}
              {hasFilter ? " match" : " across all topics"}
            </span>
            {hasFilter && (
              <Link
                href="/glossary"
                className="text-xs text-foreground hover:underline"
              >
                Clear filters
              </Link>
            )}
          </div>

          {filtered.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No terms match your search.
            </p>
          ) : showSections ? (
            // All + no search: grouped sections
            <div className="space-y-8">
              {SECTION_ORDER.map((section) => {
                const items = groups[section.key];
                if (!items || items.length === 0) return null;
                return (
                  <section key={section.key}>
                    <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                      {section.label}
                    </h2>
                    <ul className="space-y-1.5">
                      {items.map((term) => (
                        <li key={term.id}>
                          <Link
                            href={`/glossary/${term.slug}`}
                            className="block rounded-lg border border-border bg-background px-4 py-3 transition hover:border-foreground/30"
                          >
                            <p className="text-sm font-medium">{term.label}</p>
                            <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
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
          ) : (
            // Topic selected or search active: flat list, no headers
            <ul className="space-y-1.5">
              {filtered.map((term) => (
                <li key={term.id}>
                  <Link
                    href={`/glossary/${term.slug}`}
                    className="block rounded-lg border border-border bg-background px-4 py-3 transition hover:border-foreground/30"
                  >
                    <p className="text-sm font-medium">{term.label}</p>
                    <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                      {term.tooltip}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
