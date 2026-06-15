import Link from "next/link";

import { auth } from "@/lib/auth";
import { getLang } from "@/lib/lang";
import { i18nHome, i18nCourse } from "@/lib/i18n";
import { getTopicStats } from "@/lib/questions";
import { getFeaturedCourses } from "@/lib/course-data";
import { getTopicIcon } from "@/lib/topic-icons";
import { listSystemTopics } from "@/lib/actions/admin-topics";

export const dynamic = "force-dynamic";

export const metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const session = await auth().catch(() => null);
  const user = session?.user;
  const lang = await getLang();
  const i18n = i18nHome[lang];

  const [topicStats, systemTopics, featuredCourses] = await Promise.all([
    getTopicStats().catch(() => ({}) as Record<string, number>),
    listSystemTopics(),
    getFeaturedCourses(user?.id, 3).catch(() => []),
  ]);
  const totalQuestions = Object.values(topicStats).reduce((s, n) => s + n, 0);
  const topicNames = Object.fromEntries(systemTopics.map((t) => [t.slug, t.name]));
  const i18nC = i18nCourse[lang];
  const hasCourseProgress = featuredCourses.some((c) => c.completedCount > 0);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-14 px-6 py-16">
      {/* ── Hero ── */}
      <section className="space-y-5">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            {i18n.tagline}
          </p>
          <h1 className="max-w-2xl bg-gradient-to-br from-foreground via-foreground to-foreground/55 bg-clip-text text-4xl font-semibold tracking-tight text-transparent sm:text-5xl">
            {i18n.headline}
          </h1>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {i18n.stack}
          </p>
          <p className="max-w-xl text-base text-muted-foreground">
            {i18n.heroDesc(totalQuestions, systemTopics.length)}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/learn"
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-[0.98]"
          >
            {i18n.startLearningCta}
          </Link>
          <Link
            href="/questions"
            className="rounded-md border border-border px-5 py-2.5 text-sm font-medium transition hover:bg-accent active:scale-[0.98]"
          >
            {i18n.browseQuestions}
          </Link>
        </div>
      </section>

      {/* ── Logged-in welcome ── */}
      {user && (
        <section className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-5 py-4">
          <div>
            <p className="text-sm font-medium">
              {i18n.welcomeBack}
              {user.name ? `, ${user.name.split(" ")[0]}` : ""}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {i18n.welcomeSub}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="shrink-0 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent"
          >
            {i18n.viewDashboard}
          </Link>
        </section>
      )}

      {/* ── Courses (continue / explore) ── */}
      {featuredCourses.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-medium text-muted-foreground">
              {hasCourseProgress ? i18n.continueTitle : i18n.exploreTitle}
            </h2>
            <Link
              href="/learn"
              className="shrink-0 text-xs font-medium text-primary hover:underline"
            >
              {i18n.allCourses}
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {featuredCourses.map((course) => {
              const Icon = getTopicIcon(course.topicSlug);
              const pct =
                course.lessonCount === 0
                  ? 0
                  : Math.round(
                      (course.completedCount / course.lessonCount) * 100,
                    );
              return (
                <Link
                  key={course.topicSlug}
                  href={`/learn/${course.topicSlug}`}
                  className="card-lift group flex flex-col rounded-lg border border-border bg-card p-4 hover:bg-accent/40"
                >
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
                    <span className="truncate">
                      {topicNames[course.topicSlug] ?? course.topicSlug}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {course.completedCount > 0
                      ? `${i18nC.lessonsDone(course.completedCount, course.lessonCount)} · ${pct}%`
                      : i18nC.lessonsDone(course.completedCount, course.lessonCount)}
                  </p>
                  <p className="mt-3 text-xs font-medium text-primary group-hover:underline">
                    {!user
                      ? i18nC.signInToStart
                      : course.completedCount === 0
                        ? i18nC.startLearning
                        : i18nC.continueLearning}{" "}
                    →
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Features ── */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">
          {i18n.whatsInside}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {i18n.features.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="card-lift group rounded-lg border border-border bg-card p-5 hover:bg-accent/40"
            >
              <p className="text-sm font-semibold">{f.title}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {f.description}
              </p>
              <p className="mt-4 text-xs font-medium group-hover:underline">
                {f.cta} →
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Topic grid ── */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">{i18n.topics}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {systemTopics.map((topic) => {
            const count = topicStats[topic.slug] ?? 0;
            const Icon = getTopicIcon(topic.slug);
            return (
              <Link
                key={topic.slug}
                href={`/questions?topic=${topic.slug}`}
                className="card-lift group rounded-lg border border-border bg-card px-4 py-3 hover:bg-accent/40"
              >
                <p className="flex items-center gap-2 text-sm font-medium">
                  <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
                  {topic.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {i18n.questions(count)}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Sign-in CTA (guests only) ── */}
      {!user && (
        <section className="rounded-lg border border-dashed border-border px-6 py-10 text-center">
          <p className="text-sm font-semibold">{i18n.trackProgress}</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            {i18n.trackProgressSub}
          </p>
          <Link
            href="/signin"
            className="mt-6 inline-block rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            {i18n.signInCta}
          </Link>
        </section>
      )}

      <footer className="border-t border-border pt-6 text-xs text-muted-foreground">
        {i18n.footer}
      </footer>
    </main>
  );
}
