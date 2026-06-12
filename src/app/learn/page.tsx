import type { Metadata } from "next";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { listCourseSummaries } from "@/lib/course-data";
import { getLang } from "@/lib/lang";
import { i18nCourse } from "@/lib/i18n";
import { listSystemTopics } from "@/lib/actions/admin-topics";
import { getTopicIcon } from "@/lib/topic-icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/** SVG progress ring — completed lessons over total. */
function ProgressRing({ pct, label }: { pct: number; label: string }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <svg
      viewBox="0 0 64 64"
      className="size-16 shrink-0 -rotate-90"
      role="img"
      aria-label={label}
    >
      <circle
        cx="32"
        cy="32"
        r={r}
        fill="none"
        strokeWidth="6"
        className="stroke-secondary"
      />
      <circle
        cx="32"
        cy="32"
        r={r}
        fill="none"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct / 100)}
        className="stroke-primary transition-[stroke-dashoffset] duration-500"
      />
      <text
        x="32"
        y="32"
        textAnchor="middle"
        dominantBaseline="central"
        className="rotate-90 origin-center fill-foreground text-[13px] font-semibold"
      >
        {pct}%
      </text>
    </svg>
  );
}

/**
 * Course grid — every topic that has a learning path. Guest-visible
 * (read-only teaser); the lesson player itself requires auth.
 */
export default async function LearnPage() {
  const session = await auth().catch(() => null);
  const lang = await getLang();
  const i18n = i18nCourse[lang];

  const [courses, systemTopics] = await Promise.all([
    listCourseSummaries(session?.user?.id),
    listSystemTopics(),
  ]);
  const topicNames = Object.fromEntries(
    systemTopics.map((t) => [t.slug, t.name]),
  );

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">
        {i18n.coursesTitle}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{i18n.coursesSubtitle}</p>

      {courses.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">{i18n.noCourses}</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const Icon = getTopicIcon(course.topicSlug);
            const pct =
              course.lessonCount === 0
                ? 0
                : Math.round((course.completedCount / course.lessonCount) * 100);
            return (
              <Link
                key={course.topicSlug}
                href={`/learn/${course.topicSlug}`}
                className="card-lift flex items-center gap-4 rounded-xl border border-border bg-card p-5"
              >
                <ProgressRing
                  pct={pct}
                  label={i18n.lessonsDone(course.completedCount, course.lessonCount)}
                />
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-semibold">
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">
                      {topicNames[course.topicSlug] ?? course.topicSlug}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {i18n.lessonsDone(course.completedCount, course.lessonCount)}
                  </p>
                  <p className="mt-2 text-xs font-medium text-primary">
                    {!session?.user
                      ? i18n.signInToStart
                      : course.completedCount === 0
                        ? i18n.startLearning
                        : i18n.continueLearning}{" "}
                    →
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
