import Link from "next/link";

import { groupByTopic, listTerms } from "@/lib/terms";
import type { Topic } from "@/lib/supabase/types";
import { listSystemTopics } from "@/lib/actions/admin-topics";
import { getLang } from "@/lib/lang";
import { i18nGlossary } from "@/lib/i18n";

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

  const lang = await getLang();
  const i18n = i18nGlossary[lang];

  const [allTerms, systemTopics] = await Promise.all([listTerms(), listSystemTopics()]);
  const groups = groupByTopic(allTerms);

  const SECTION_ORDER: Array<{ key: Topic | "general"; label: string }> = [
    ...systemTopics.map((t) => ({ key: t.slug as Topic, label: t.name })),
    { key: "general", label: i18n.general },
  ];

  const availableTabs = SECTION_ORDER
    .filter((s) => (groups[s.key]?.length ?? 0) > 0)
    .map((s) => ({ value: s.key, label: s.label }));

  const topicFiltered =
    selectedTopic && selectedTopic !== "all"
      ? (groups[selectedTopic as Topic | "general"] ?? [])
      : allTerms;

  const filtered = searchQuery
    ? topicFiltered.filter(
        (t) =>
          t.label.toLowerCase().includes(searchQuery) ||
          t.tooltip.toLowerCase().includes(searchQuery),
      )
    : topicFiltered;

  const hasFilter = Boolean(selectedTopic) || Boolean(searchQuery);
  const showSections = !selectedTopic && !searchQuery;

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-5">
        <p className="text-sm font-medium text-muted-foreground">{i18n.title}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {i18n.sub}
        </h1>
      </header>

      <TooltipDemo lang={lang} />

      <div className="mb-4 mt-5">
        <GlossarySearch placeholder={i18n.searchPlaceholder} />
      </div>

      <div>
        <GlossaryTopicTabs availableTabs={availableTabs} allLabel={i18n.allTopics} />

        <div className="rounded-b-lg border-x border-b border-border bg-card px-4 pb-4 pt-3">
          <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
            <span>{i18n.termCount(filtered.length)}</span>
            {hasFilter && (
              <Link
                href="/glossary"
                className="text-xs text-foreground hover:underline"
              >
                {i18n.clearFilters}
              </Link>
            )}
          </div>

          {filtered.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              {i18n.noResults}
            </p>
          ) : showSections ? (
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
