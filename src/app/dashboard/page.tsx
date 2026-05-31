import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getDashboardData } from "@/lib/actions/user-tracking";
import { getUserSubmissions } from "@/lib/actions/questions";
import { listTopicsWithQuestions } from "@/lib/actions/custom-topics";
import { listSystemTopics } from "@/lib/actions/admin-topics";
import { getLang } from "@/lib/lang";
import { i18nCommon, i18nDashboard } from "@/lib/i18n";
import type { Language } from "@/lib/supabase/types";

// suppress unused-import lint for type-only usage above
import { DeleteSubmissionButton } from "@/app/dashboard/_components/delete-submission-button";
import { MyTopicsSection } from "@/app/dashboard/_components/my-topics-section";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function formatDate(iso: string, lang: Language): string {
  return new Date(iso).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type DashboardI18n = (typeof i18nDashboard)[Language];

function StatusChip({
  status,
  isShared,
  i18n,
}: {
  status: string;
  isShared: boolean;
  i18n: DashboardI18n;
}) {
  if (!isShared) {
    return (
      <span className="shrink-0 rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
        {i18n.private}
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="shrink-0 rounded-md border border-amber-500/40 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
        {i18n.pendingReview}
      </span>
    );
  }
  if (status === "active") {
    return (
      <span className="shrink-0 rounded-md border border-emerald-500/40 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
        {i18n.published}
      </span>
    );
  }
  return (
    <span className="shrink-0 rounded-md border border-rose-500/40 bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
      {i18n.rejected}
    </span>
  );
}

function GradeChip({ pct, lang }: { pct: number; lang: Language }) {
  const common = i18nCommon[lang];
  const { label, cls } =
    pct === 100
      ? { label: common.perfect, cls: "border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" }
      : pct >= 80
        ? { label: common.strong, cls: "border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" }
        : pct >= 60
          ? { label: common.decent, cls: "border-amber-500/40 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" }
          : { label: common.needsWork, cls: "border-rose-500/40 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300" };

  return (
    <span className={cn("rounded-md border px-2 py-0.5 text-xs font-medium", cls)}>
      {pct}% {label}
    </span>
  );
}

export default async function DashboardPage() {
  const session = await auth().catch(() => null);
  if (!session?.user) redirect("/signin");

  const lang = await getLang();
  const i18n = i18nDashboard[lang];

  const [data, submissions, { topics: customTopics, questionsMap }, systemTopics] = await Promise.all([
    getDashboardData(),
    getUserSubmissions(),
    listTopicsWithQuestions(),
    listSystemTopics(),
  ]);
  const topicLabels = Object.fromEntries(systemTopics.map((t) => [t.slug, t.name]));

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          {i18n.progressHeading}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{i18n.title}</h1>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-2xl font-semibold">{data?.mockSessions.length ?? 0}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {i18n.sessions}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-2xl font-semibold">
            {data?.topicProgress.reduce((s, t) => s + t.seen, 0) ?? 0}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {i18n.questionsAnswered}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-2xl font-semibold">{data?.bookmarkCount ?? 0}</p>
          <p className="mt-1 text-xs text-muted-foreground">{i18n.bookmarks}</p>
        </div>
      </div>

      {/* Topic progress */}
      {data && data.topicProgress.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">
            {i18n.topicProgress}
          </h2>
          <div className="rounded-lg border border-border bg-card divide-y divide-border">
            {data.topicProgress
              .sort((a, b) => b.seen - a.seen)
              .map(({ topic, seen, correct }) => {
                const pct = seen > 0 ? Math.round((correct / seen) * 100) : 0;
                return (
                  <div key={topic} className="flex items-center gap-4 px-4 py-3">
                    <span className="w-36 shrink-0 text-sm font-medium">
                      {topicLabels[topic] ?? topic}
                    </span>
                    <div className="flex-1">
                      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            pct >= 80
                              ? "bg-emerald-500"
                              : pct >= 60
                                ? "bg-amber-500"
                                : "bg-rose-500",
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-24 text-right text-xs text-muted-foreground">
                      {correct}/{seen} {i18n.correct}
                    </span>
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* Mock session history */}
      {data && data.mockSessions.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">
            {i18n.sessionHistory}
          </h2>
          <div className="space-y-2">
            {data.mockSessions.map((s) => (
              <div
                key={s.id}
                className="rounded-lg border border-border bg-card px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">
                      {s.score} / {s.total}
                    </span>
                    <GradeChip pct={s.pct} lang={lang} />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(s.createdAt, lang)}
                  </span>
                </div>
                {s.topics.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {s.topics.map((topic) => (
                      <span
                        key={topic}
                        className="rounded bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground"
                      >
                        {topicLabels[topic] ?? topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Bookmarks CTA */}
      {data && data.bookmarkCount > 0 && (
        <section>
          <div className="rounded-lg border border-dashed border-border p-6 text-center">
            <p className="text-sm text-muted-foreground">
              {i18n.bookmarkCount(data.bookmarkCount)}
            </p>
            <Link
              href="/questions"
              className="mt-3 inline-block rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              {i18n.submitQuestionBtn}
            </Link>
          </div>
        </section>
      )}

      {/* My Topics */}
      <MyTopicsSection
        initialTopics={customTopics}
        initialQuestionsMap={questionsMap}
        lang={lang}
      />

      {/* My submissions */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-muted-foreground">{i18n.mySubmissions}</h2>
          <Link
            href="/questions/new"
            className="rounded-md border border-border px-3 py-1 text-xs font-medium hover:bg-accent"
          >
            {i18n.submitQuestionBtn}
          </Link>
        </div>

        {submissions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-5 py-6 text-center">
            <p className="text-sm text-muted-foreground">{i18n.noSubmissions}</p>
            <Link
              href="/questions/new"
              className="mt-3 inline-block text-sm font-medium hover:underline"
            >
              {i18n.submitQuestion}
            </Link>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card divide-y divide-border">
            {submissions.map((q) => (
              <div key={q.id} className="flex items-start gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{q.question}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {topicLabels[q.topic] ?? q.topic}
                    {" · "}
                    {q.level_label}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusChip status={q.status} isShared={q.is_shared} i18n={i18n} />
                  <DeleteSubmissionButton id={q.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Empty state */}
      {(!data || (data.mockSessions.length === 0 && data.topicProgress.length === 0)) && (
        <div className="rounded-lg border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">
            {i18n.noTopicActivity}
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link
              href="/mock"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              {i18n.startMockCta}
            </Link>
            <Link
              href="/questions"
              className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              {i18n.browseQuestionsCta}
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}