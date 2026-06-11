import Link from "next/link";

import { groupByTopic, listTerms } from "@/lib/terms";
import type { Topic } from "@/lib/supabase/types";
import { listSystemTopics } from "@/lib/actions/admin-topics";
import { getLang } from "@/lib/lang";
import { parsePage, parsePageSize } from "@/lib/questions";
import { i18nGlossary, i18nQuestions } from "@/lib/i18n";
import { PageSizeSelect } from "@/components/page-size-select";
import { Pagination } from "@/components/pagination";

import { GlossaryTopicTabs } from "./_components/topic-tabs";
import { GlossarySearch } from "./_components/search";
import { TooltipDemo } from "./_components/tooltip-demo";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ topic?: string; q?: string; page?: string; per?: string }>;

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
  const i18nQ = i18nQuestions[lang];
  const page = parsePage(params.page);
  const pageSize = parsePageSize(params.per);

  const [allTerms, systemTopics] = await Promise.all([listTerms(), listSystemTopics()]);
  const groups = groupByTopic(allTerms);

  const SECTION_ORDER: Array<{ key: Topic | "general"; label: string }> = [
    ...systemTopics.map((t) => ({ key: t.slug as Topic, label: t.name })),
    { key: "general", label: i18n.general },
  ];

  const availableTabs = SECTION_ORDER
    .filter((s) => (groups[s.key]?.length ?? 0) > 0)
    .map((s) => ({ value: s.key, label: s.label }));

  const topicLabelMap = Object.fromEntries(
    SECTION_ORDER.map((s) => [s.key, s.label]),
  );

  // Flat list in stable section order (so "All" pages don't jump around)
  const orderedAll = SECTION_ORDER.flatMap((s) => groups[s.key] ?? []);

  const topicFiltered =
    selectedTopic && selectedTopic !== "all"
      ? (groups[selectedTopic as Topic | "general"] ?? [])
      : orderedAll;

  const filtered = searchQuery
    ? topicFiltered.filter(
        (t) =>
          t.label.toLowerCase().includes(searchQuery) ||
          t.tooltip.toLowerCase().includes(searchQuery),
      )
    : topicFiltered;

  const hasFilter = Boolean(selectedTopic) || Boolean(searchQuery);
  const showTopicBadge = !selectedTopic || selectedTopic === "all";

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

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
            <span>{i18n.termCount(total)}</span>
            <span className="flex items-center gap-3">
              <PageSizeSelect
                value={pageSize}
                label={i18nQ.perPage}
                basePath="/glossary"
              />
              {hasFilter && (
                <Link
                  href="/glossary"
                  className="text-xs text-foreground hover:underline"
                >
                  {i18n.clearFilters}
                </Link>
              )}
            </span>
          </div>

          {total === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              {i18n.noResults}
            </p>
          ) : (
            <ul className="space-y-1.5">
              {pageItems.map((term) => (
                <li key={term.id}>
                  <Link
                    href={`/glossary/${term.slug}`}
                    className="block rounded-lg border border-border bg-background px-4 py-3 transition hover:border-foreground/30"
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium">{term.label}</span>
                      {showTopicBadge && (
                        <span className="flex-shrink-0 rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                          {topicLabelMap[term.topic ?? "general"] ?? term.topic ?? i18n.general}
                        </span>
                      )}
                    </span>
                    <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                      {lang === "tr" && term.tooltip_tr ? term.tooltip_tr : term.tooltip}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <Pagination
            page={page}
            totalPages={totalPages}
            basePath="/glossary"
            searchParams={{ topic: params.topic, q: params.q, per: params.per }}
            labels={{
              prev: i18nQ.paginationPrev,
              next: i18nQ.paginationNext,
              pageOf: i18nQ.pageOf(page, totalPages),
            }}
          />
        </div>
      </div>
    </main>
  );
}
