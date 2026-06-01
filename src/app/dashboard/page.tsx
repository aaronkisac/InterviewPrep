import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getDashboardData } from "@/lib/actions/user-tracking";
import { getUserSubmissions } from "@/lib/actions/questions";
import { listTopicsWithQuestions } from "@/lib/actions/custom-topics";
import { listSystemTopics } from "@/lib/actions/admin-topics";
import { getLang } from "@/lib/lang";
import { i18nDashboard } from "@/lib/i18n";

import { DeleteSubmissionButton } from "@/app/dashboard/_components/delete-submission-button";
import { GradeChip } from "@/app/dashboard/_components/grade-chip";
import { MyTopicsSection } from "@/app/dashboard/_components/my-topics/my-topics-section";
import { StatusChip } from "@/app/dashboard/_components/status-chip";
import { getGrade } from "@/lib/grade";
import { formatDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

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
                const { barClass } = getGrade(pct, lang);
                return (
                  <div key={topic} className="flex items-center gap-4 px-4 py-3">
                    <span className="w-36 shrink-0 text-sm font-medium">
                      {topicLabels[topic] ?? topic}
                    </span>
                    <div className="flex-1">
                      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                        <div
                          className={cn("h-full rounded-full transition-all", barClass)}
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