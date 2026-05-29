import Link from "next/link";

import { auth } from "@/lib/auth";
import { getBookmarkedIds } from "@/lib/actions/user-tracking";
import {
  listQuestions,
  parseLevels,
  parseQuery,
  parseTopic,
} from "@/lib/questions";
import { listTerms } from "@/lib/terms";
import { parseLanguage } from "@/lib/topics";

import { TopicTabs } from "./_components/topic-tabs";
import { QuestionFilters } from "./_components/filters";
import { QuestionCard } from "./_components/question-card";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Question bank",
  description:
    "Browse frontend interview questions with general and personal answers. Filter by topic and seniority level across React, TypeScript, Next.js, and more.",
  openGraph: {
    title: "Question bank · Interview Prep",
    description:
      "Browse frontend interview questions with model answers, filterable by topic and seniority level.",
  },
};

type SearchParams = Promise<{
  topic?: string;
  levels?: string;
  q?: string;
  lang?: string;
}>;

const t = {
  en: {
    bank: "Question bank",
    title: "All questions",
    countSuffix: (n: number, active: boolean) =>
      `${n} ${n === 1 ? "question" : "questions"}${active ? " match" : " total"}`,
    clear: "Clear filters",
    empty: "No questions match these filters yet.",
    loginForBookmarks: "Sign in to save bookmarks.",
    invalidTopic: (topic: string) =>
      `“${topic}” isn’t a known topic — showing all questions instead.`,
  },
  tr: {
    bank: "Soru bankası",
    title: "Tüm sorular",
    countSuffix: (n: number, active: boolean) =>
      `${n} soru${active ? " eşleşiyor" : " toplam"}`,
    clear: "Filtreleri temizle",
    empty: "Bu filtrelere uyan soru yok.",
    loginForBookmarks: "Yer imlerini görmek için giriş yap.",
    invalidTopic: (topic: string) =>
      `“${topic}” bilinen bir konu değil — bunun yerine tüm sorular gösteriliyor.`,
  },
} as const;

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const lang = parseLanguage(params.lang);
  const i18n = t[lang];

  const isBookmarkedTab = params.topic === "bookmarked";

  const parsedTopic = isBookmarkedTab ? undefined : parseTopic(params.topic);
  const invalidTopic =
    !isBookmarkedTab &&
    Boolean(params.topic) &&
    parsedTopic === undefined
      ? params.topic
      : undefined;

  const filters = {
    topic: parsedTopic,
    levels: parseLevels(params.levels),
    q: parseQuery(params.q),
  };

  const session = await auth().catch(() => null);
  const isLoggedIn = Boolean(session?.user);

  const [allQuestions, terms, bookmarkedIds] = await Promise.all([
    listQuestions(filters),
    listTerms(),
    getBookmarkedIds(),
  ]);

  const bookmarkedSet = new Set(bookmarkedIds);

  const questions = isBookmarkedTab
    ? allQuestions.filter((q) => bookmarkedSet.has(q.id))
    : allQuestions;

  const hasActiveFilters =
    Boolean(filters.topic) ||
    Boolean(filters.levels?.length) ||
    Boolean(filters.q) ||
    isBookmarkedTab;

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Header ── */}
      <header className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {i18n.bank}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {i18n.title}
          </h1>
        </div>
        {isLoggedIn && (
          <Link
            href="/questions/new"
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent"
          >
            + Submit question
          </Link>
        )}
      </header>

      {invalidTopic && (
        <div
          role="status"
          className="mb-4 rounded-md border border-border bg-muted/40 px-4 py-2.5 text-sm text-muted-foreground"
        >
          {i18n.invalidTopic(invalidTopic)}
        </div>
      )}

      {/* ── Filters (search + level + lang) — always visible at top ── */}
      <div className="mb-4">
        <QuestionFilters />
      </div>

      {/* ── Tabs + Panel — connected ── */}
      <div>
        <TopicTabs />

        {/* Panel — same bg as active tab, border-t missing (tabs provide it) */}
        <div className="rounded-b-lg border-x border-b border-border bg-card px-4 pb-4 pt-3">
          {/* Count + clear */}
          <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {isBookmarkedTab && !isLoggedIn
                ? i18n.loginForBookmarks
                : i18n.countSuffix(questions.length, hasActiveFilters)}
            </span>
            {hasActiveFilters && (
              <Link
                href={`/questions${lang === "tr" ? "?lang=tr" : ""}`}
                className="text-foreground hover:underline text-xs"
              >
                {i18n.clear}
              </Link>
            )}
          </div>

          {/* Question list */}
          {questions.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              {i18n.empty}
            </p>
          ) : (
            <ul className="space-y-1.5">
              {questions.map((question, i) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  index={i + 1}
                  lang={lang}
                  terms={terms}
                  isBookmarked={bookmarkedSet.has(question.id)}
                  showTopic={isBookmarkedTab}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
