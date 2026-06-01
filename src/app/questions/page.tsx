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
import { getLang } from "@/lib/lang";
import { i18nQuestions } from "@/lib/i18n";
import { listSystemTopics } from "@/lib/actions/admin-topics";
import { listCustomTopics, getCustomTopic, getCustomBookmarkIds } from "@/lib/actions/custom-topics";

import { TopicTabs } from "./_components/topic-tabs";
import { QuestionFilters } from "./_components/filters";
import { QuestionCard } from "./_components/question-card";
import { CustomQuestionCard } from "./_components/custom-question-card";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  topic?: string;
  mytopic?: string;
  levels?: string;
  q?: string;
}>;

const GUEST_MAX_LEVEL = 2;

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const lang = await getLang();
  const i18n = i18nQuestions[lang];

  const isBookmarkedTab = params.topic === "bookmarked";
  const myTopicSlug = params.mytopic?.trim() || undefined;

  const filters = {
    topic: isBookmarkedTab ? undefined : parseTopic(params.topic),
    levels: parseLevels(params.levels),
    q: parseQuery(params.q),
  };

  const session = await auth().catch(() => null);
  const isLoggedIn = Boolean(session?.user);

  // Fetch base data always
  const [allQuestions, terms, bookmarkedIds, systemTopics] = await Promise.all([
    // Skip system question fetch if viewing a custom topic
    myTopicSlug ? Promise.resolve([]) : listQuestions(filters),
    listTerms(),
    getBookmarkedIds(),
    listSystemTopics(),
  ]);

  // Custom topics for tabs — pass userId directly to avoid a second auth() call
  const userId = session?.user?.id;
  const customTopicsForTabs = userId
    ? await listCustomTopics(userId).catch(() => [])
    : [];

  // If a custom topic tab is active, fetch its questions + bookmarks
  const [customTopicData, customBookmarkIds] = await Promise.all([
    userId && myTopicSlug
      ? getCustomTopic(myTopicSlug, userId).catch(() => null)
      : Promise.resolve(null),
    userId && myTopicSlug
      ? getCustomBookmarkIds().catch(() => [] as string[])
      : Promise.resolve([] as string[]),
  ]);

  const topicLabels = Object.fromEntries(systemTopics.map((t) => [t.slug, t.name]));
  const bookmarkedSet = new Set(bookmarkedIds);
  const customBookmarkedSet = new Set(customBookmarkIds);

  // System questions (with guest level filter)
  const visibleQuestions = isLoggedIn
    ? allQuestions
    : allQuestions.filter((q) => q.level <= GUEST_MAX_LEVEL);

  const questions = isBookmarkedTab
    ? visibleQuestions.filter((q) => bookmarkedSet.has(q.id))
    : visibleQuestions;

  const hasActiveFilters =
    Boolean(filters.topic) ||
    Boolean(filters.levels?.length) ||
    Boolean(filters.q) ||
    isBookmarkedTab;

  // Custom topic question keyword filter
  const customQuestions = customTopicData
    ? filters.q
      ? customTopicData.questions.filter((q) =>
          q.question.toLowerCase().includes(filters.q!.toLowerCase()),
        )
      : customTopicData.questions
    : [];

  const isCustomTab = Boolean(myTopicSlug && isLoggedIn);

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Header ── */}
      <header className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {i18n.bank}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {isCustomTab && customTopicData
              ? customTopicData.topic.name
              : i18n.title}
          </h1>
        </div>
        {isLoggedIn && (
          <div className="flex items-center gap-2">
            {isCustomTab && (
              <Link
                href="/dashboard"
                className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                ← {i18n.dashboardBtn}
              </Link>
            )}
            <Link
              href="/questions/new"
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent"
            >
             {i18n.submitQuestion}
            </Link>
          </div>
        )}
      </header>

      {/* ── Guest upsell banner ── */}
      {!isLoggedIn && (
        <div className="mb-5 flex items-center justify-between gap-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          <p>{i18n.guestBanner(questions.length)}</p>
          <Link
            href="/signin"
            className="flex-shrink-0 rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600"
          >
            {i18n.signIn}
          </Link>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="mb-4">
        <QuestionFilters topics={systemTopics} lang={lang} />
      </div>

      {/* ── Tabs + Panel ── */}
      <div>
        <TopicTabs
          isLoggedIn={isLoggedIn}
          topics={systemTopics}
          customTopics={customTopicsForTabs}
          lang={lang}
        />

        <div className="rounded-b-lg border-x border-b border-border bg-card px-4 pb-4 pt-3">
          {/* Count + clear */}
          <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {isCustomTab
                ? `${customQuestions.length} ${customQuestions.length === 1 ? "question" : "questions"} · ${i18n.privateTopic}`
                : isBookmarkedTab && !isLoggedIn
                  ? i18n.loginForBookmarks
                  : i18n.countSuffix(questions.length, hasActiveFilters)}
            </span>
            {(hasActiveFilters || isCustomTab) && (
              <Link
                href={`/questions${lang === "tr" ? "?lang=tr" : ""}`}
                className="text-foreground hover:underline text-xs"
              >
                {i18n.clear}
              </Link>
            )}
          </div>

          {/* Custom topic questions */}
          {isCustomTab ? (
            customQuestions.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                <p>{i18n.emptyCustom}</p>
                <Link
                  href="/dashboard"
                  className="mt-3 inline-block text-xs font-medium hover:underline"
                >
                  {i18n.dashboardBtn} →
                </Link>
              </div>
            ) : (
              <ul className="space-y-1.5">
                {customQuestions.map((q, i) => (
                  <CustomQuestionCard
                    key={q.id}
                    question={q}
                    index={i + 1}
                    lang={lang}
                    initialBookmarked={customBookmarkedSet.has(q.id)}
                  />
                ))}
              </ul>
            )
          ) : questions.length === 0 ? (
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
                  isLoggedIn={isLoggedIn}
                  topicLabels={topicLabels}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
