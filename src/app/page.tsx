import Link from "next/link";

import { auth } from "@/lib/auth";
import { TOPIC_LABELS, TOPICS } from "@/lib/topics";
import { getTopicStats } from "@/lib/questions";

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    title: "Q&A bank",
    description:
      "Questions across 13 topics with general and personal answers. Filter by topic and seniority level.",
    href: "/questions",
    cta: "Browse questions",
  },
  {
    title: "Mock interviews",
    description:
      "Pick a topic, answer multiple-choice questions under simulated interview conditions, and review your score.",
    href: "/mock",
    cta: "Start a session",
  },
  {
    title: "Glossary",
    description:
      "105 frontend terms with concise definitions — auto-linked inline as you read through answers.",
    href: "/glossary",
    cta: "Explore terms",
  },
] as const;

export default async function HomePage() {
  const session = await auth().catch(() => null);
  const user = session?.user;

  const topicStats = await getTopicStats().catch(
    () => ({}) as Record<string, number>,
  );
  const totalQuestions = Object.values(topicStats).reduce((s, n) => s + n, 0);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-14 px-6 py-16">
      {/* ── Hero ── */}
      <section className="space-y-5">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            Frontend Interview Prep
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            React · TypeScript · Next.js
          </h1>
          <p className="max-w-lg text-base text-muted-foreground">
            {totalQuestions > 0
              ? `${totalQuestions}+ questions`
              : "Hundreds of questions"}{" "}
            across {TOPICS.length} topics. Structured Q&amp;A, a term glossary,
            and timed mock interview sessions.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/questions"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Browse questions
          </Link>
          <Link
            href="/mock"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Start mock interview
          </Link>
          <Link
            href="/glossary"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Glossary
          </Link>
        </div>
      </section>

      {/* ── Logged-in welcome ── */}
      {user && (
        <section className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-5 py-4">
          <div>
            <p className="text-sm font-medium">
              Welcome back
              {user.name ? `, ${user.name.split(" ")[0]}` : ""}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Track your sessions, bookmarks, and topic progress on your
              dashboard.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="shrink-0 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent"
          >
            View dashboard →
          </Link>
        </section>
      )}

      {/* ── Features ── */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">
          What&apos;s inside
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-foreground/20 hover:bg-accent/40"
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
        <h2 className="text-sm font-medium text-muted-foreground">Topics</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {TOPICS.map((topic) => {
            const count = topicStats[topic] ?? 0;
            return (
              <Link
                key={topic}
                href={`/questions?topic=${topic}`}
                className="group rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-foreground/20 hover:bg-accent/40"
              >
                <p className="text-sm font-medium">{TOPIC_LABELS[topic]}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {count > 0 ? `${count} questions` : "Coming soon"}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Sign-in CTA (guests only) ── */}
      {!user && (
        <section className="rounded-lg border border-dashed border-border px-6 py-10 text-center">
          <p className="text-sm font-semibold">Track your progress</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Sign in to save mock session results, bookmark questions, and
            monitor your improvement over time.
          </p>
          <Link
            href="/signin"
            className="mt-6 inline-block rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Sign in to get started
          </Link>
        </section>
      )}

      <footer className="border-t border-border pt-6 text-xs text-muted-foreground">
        Interview Prep — built for Senior Frontend Engineers
      </footer>
    </main>
  );
}
