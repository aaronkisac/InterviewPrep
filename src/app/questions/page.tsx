import Link from "next/link";

import { auth } from "@/lib/auth";
import { getBookmarkedIds } from "@/lib/actions/user-tracking";
import {
  listQuestions,
  parseLevel,
  parseQuery,
  parseTopic,
} from "@/lib/questions";
import { listTerms } from "@/lib/terms";
import { parseLanguage } from "@/lib/topics";

import { QuestionFilters } from "./_components/filters";
import { QuestionCard } from "./_components/question-card";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  topic?: string;
  level?: string;
  q?: string;
  lang?: string;
}>;

const t = {
  en: {
    bank: "Question bank",
    title: "All questions",
    home: "Home",
    countSuffix: (n: number, active: boolean) =>
      `${n} ${n === 1 ? "question" : "questions"}${active ? " match" : " total"}`,
    clear: "Clear filters",
    empty: "No questions match these filters yet.",
  },
  tr: {
    bank: "Soru bankası",
    title: "Tüm sorular",
    home: "Anasayfa",
    countSuffix: (n: number, active: boolean) =>
      `${n} soru${active ? " eşleşiyor" : " toplam"}`,
    clear: "Filtreleri temizle",
    empty: "Bu filtrelere uyan soru yok.",
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

  const filters = {
    topic: parseTopic(params.topic),
    level: parseLevel(params.level),
    q: parseQuery(params.q),
  };

  const session = await auth().catch(() => null);
  const isLoggedIn = Boolean(session?.user);

  const [questions, terms, bookmarkedIds] = await Promise.all([
    listQuestions(filters),
    listTerms(),
    getBookmarkedIds(),
  ]);
  const bookmarkedSet = new Set(bookmarkedIds);
  const hasActiveFilters =
    Boolean(filters.topic) || Boolean(filters.level) || Boolean(filters.q);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <header className="mb-6 flex items-center justify-between">
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

      <QuestionFilters />

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>{i18n.countSuffix(questions.length, hasActiveFilters)}</span>
        {hasActiveFilters && (
          <Link
            href={`/questions${lang === "tr" ? "?lang=tr" : ""}`}
            className="text-foreground hover:underline"
          >
            {i18n.clear}
          </Link>
        )}
      </div>

      {questions.length === 0 ? (
        <p className="mt-10 rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {i18n.empty}
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              lang={lang}
              terms={terms}
              isBookmarked={bookmarkedSet.has(question.id)}
            />
          ))}
        </ul>
      )}
    </main>
  );
}
