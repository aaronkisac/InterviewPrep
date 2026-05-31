import Link from "next/link";

import { auth } from "@/lib/auth";
import { getLang } from "@/lib/lang";
import { i18nHome } from "@/lib/i18n";
import { getTopicStats } from "@/lib/questions";
import { listSystemTopics } from "@/lib/actions/admin-topics";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth().catch(() => null);
  const user = session?.user;
  const lang = await getLang();
  const i18n = i18nHome[lang];

  const [topicStats, systemTopics] = await Promise.all([
    getTopicStats().catch(() => ({}) as Record<string, number>),
    listSystemTopics(),
  ]);
  const totalQuestions = Object.values(topicStats).reduce((s, n) => s + n, 0);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-14 px-6 py-16">
      {/* ── Hero ── */}
      <section className="space-y-5">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            {i18n.tagline}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            {i18n.headline}
          </h1>
          <p className="max-w-lg text-base text-muted-foreground">
            {i18n.heroDesc(totalQuestions, systemTopics.length)}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/questions"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            {i18n.browseQuestions}
          </Link>
          <Link
            href="/mock"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            {i18n.startMock}
          </Link>
          <Link
            href="/glossary"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            {i18n.glossary}
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

      {/* ── Features ── */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">
          {i18n.whatsInside}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {i18n.features.map((f) => (
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
        <h2 className="text-sm font-medium text-muted-foreground">{i18n.topics}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {systemTopics.map((topic) => {
            const count = topicStats[topic.slug] ?? 0;
            return (
              <Link
                key={topic.slug}
                href={`/questions?topic=${topic.slug}`}
                className="group rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-foreground/20 hover:bg-accent/40"
              >
                <p className="text-sm font-medium">{topic.name}</p>
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
