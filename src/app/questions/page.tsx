import Link from "next/link";

import { auth } from "@/lib/auth";
import { getBookmarkedIds } from "@/lib/actions/user-tracking";
import {
  listQuestions,
  listQuestionsPage,
  parseLevels,
  parsePage,
  parsePageSize,
  parseQuery,
  parseTopic,
} from "@/lib/questions";
import { listTerms } from "@/lib/terms";
import { getLang } from "@/lib/lang";
import { i18nQuestions } from "@/lib/i18n";
import { listSystemTopics } from "@/lib/actions/admin-topics";
import { listCustomTopics, getCustomTopic, getCustomBookmarkIds, getBookmarkedCustomQuestions, type BookmarkedCustomQuestion } from "@/lib/actions/custom-topics";

import { PageSizeSelect } from "@/components/page-size-select";
import { Pagination } from "@/components/pagination";
import { TopicTabs } from "./_components/topic-tabs";
import { QuestionFilters } from "./_components/filters";
import { QuestionCard } from "./_components/question-card";
import { CustomQuestionCard } from "./_components/custom-question-card";
import { TermsProvider } from "./_components/terms-context";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  topic?: string;
  mytopic?: string;
  levels?: string;
  q?: string;
  page?: string;
  per?: string;
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
    lang,
  };
  const page = parsePage(params.page);
  const pageSize = parsePageSize(params.per);

  const session = await auth().catch(() => null);
  const isLoggedIn = Boolean(session?.user);
  const userId = session?.user?.id;

  // Guests only ever see level 1–2 — push that into the DB query so
  // pagination counts are correct.
  const guestLevels = (filters.levels ?? ([1, 2] as (1 | 2)[])).filter(
    (l) => l <= GUEST_MAX_LEVEL,
  );
  const browseFilters = isLoggedIn
    ? filters
    : { ...filters, levels: guestLevels };
  // A guest who filtered to levels 3+ matches nothing — skip the query
  // (an empty levels array would be ignored by the query builder).
  const guestNoLevels = !isLoggedIn && guestLevels.length === 0;
  const skipBrowse = Boolean(myTopicSlug) || isBookmarkedTab || guestNoLevels;

  // Fetch all base data in parallel — userId passed directly to avoid repeated auth() calls
  const [browsePage, allForBookmarks, terms, bookmarkedIds, systemTopics, customTopicsForTabs] =
    await Promise.all([
      skipBrowse
        ? Promise.resolve({ items: [], total: 0 })
        : listQuestionsPage(browseFilters, page, pageSize),
      isBookmarkedTab ? listQuestions(filters) : Promise.resolve([]),
      listTerms(),
      getBookmarkedIds(userId),
      listSystemTopics(),
      userId ? listCustomTopics(userId).catch(() => []) : Promise.resolve([]),
    ]);

  // If a custom topic tab is active, fetch its questions + bookmarks
  // If on bookmarked tab, also fetch all bookmarked custom questions
  const [customTopicData, customBookmarkIds, bookmarkedCustomQuestions] = await Promise.all([
    userId && myTopicSlug
      ? getCustomTopic(myTopicSlug, userId).catch(() => null)
      : Promise.resolve(null),
    userId && myTopicSlug
      ? getCustomBookmarkIds(userId).catch(() => [] as string[])
      : Promise.resolve([] as string[]),
    userId && isBookmarkedTab
      ? getBookmarkedCustomQuestions(userId).catch(() => [])
      : Promise.resolve([]),
  ]);

  const topicLabels = Object.fromEntries(systemTopics.map((t) => [t.slug, t.name]));
  const bookmarkedSet = new Set(bookmarkedIds);
  const customBookmarkedSet = new Set(customBookmarkIds);

  // System questions — bookmarked tab filters the full list in memory
  // (a user's bookmarks are small); the browse tab is DB-paginated.
  const visibleForBookmarks = isLoggedIn
    ? allForBookmarks
    : allForBookmarks.filter((q) => q.level <= GUEST_MAX_LEVEL);

  const questions = isBookmarkedTab
    ? visibleForBookmarks.filter((q) => bookmarkedSet.has(q.id))
    : browsePage.items;
  const total = isBookmarkedTab ? questions.length : browsePage.total;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const indexOffset = isBookmarkedTab ? 0 : (page - 1) * pageSize;

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
          <p>{i18n.guestBanner(total)}</p>
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
                  : i18n.countSuffix(total + bookmarkedCustomQuestions.length, hasActiveFilters)}
            </span>
            <span className="flex items-center gap-3">
              {!isCustomTab && !isBookmarkedTab && (
                <PageSizeSelect value={pageSize} label={i18n.perPage} basePath="/questions" />
              )}
              {(hasActiveFilters || isCustomTab) && (
                <Link
                  href={`/questions${lang === "tr" ? "?lang=tr" : ""}`}
                  className="text-foreground hover:underline text-xs"
                >
                  {i18n.clear}
                </Link>
              )}
            </span>
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
          ) : questions.length === 0 && bookmarkedCustomQuestions.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              {i18n.empty}
            </p>
          ) : (
            <TermsProvider terms={terms}>
              <ul className="space-y-1.5">
                {questions.map((question, i) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    index={indexOffset + i + 1}
                    lang={lang}
                    isBookmarked={bookmarkedSet.has(question.id)}
                    showTopic={isBookmarkedTab || !filters.topic}
                    isLoggedIn={isLoggedIn}
                    topicLabels={topicLabels}
                  />
                ))}
                {(bookmarkedCustomQuestions as BookmarkedCustomQuestion[]).map((q, i) => (
                  <CustomQuestionCard
                    key={q.id}
                    question={q}
                    index={questions.length + i + 1}
                    lang={lang}
                    initialBookmarked={true}
                    topicName={q.topicName}
                  />
                ))}
              </ul>
            </TermsProvider>
          )}

          {!isCustomTab && !isBookmarkedTab && (
            <Pagination
              page={page}
              totalPages={totalPages}
              basePath="/questions"
              searchParams={{
                topic: params.topic,
                levels: params.levels,
                q: params.q,
                per: params.per,
              }}
              labels={{
                prev: i18n.paginationPrev,
                next: i18n.paginationNext,
                pageOf: i18n.pageOf(page, totalPages),
              }}
            />
          )}
        </div>
      </div>
    </main>
  );
}
