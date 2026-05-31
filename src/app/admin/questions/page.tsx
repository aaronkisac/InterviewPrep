import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getLang } from "@/lib/lang";
import { i18nAdmin, i18nLevels } from "@/lib/i18n";
import {
  getPendingSubmissions,
  approveQuestion,
  rejectQuestion,
  adminDeleteQuestion,
} from "@/lib/actions/questions";
import { listSystemTopics } from "@/lib/actions/admin-topics";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Pending questions" };

export default async function AdminQuestionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) redirect("/signin");

  const lang = await getLang();
  const i18n = i18nAdmin[lang];

  const params = await searchParams;
  const message = params.message;

  const [pending, systemTopics] = await Promise.all([
    getPendingSubmissions(),
    listSystemTopics(),
  ]);
  const topicLabels = Object.fromEntries(systemTopics.map((t) => [t.slug, t.name]));

  async function handleApprove(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await approveQuestion(id);
    redirect("/admin/questions?message=approved");
  }

  async function handleReject(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await rejectQuestion(id);
    redirect("/admin/questions?message=rejected");
  }

  async function handleDelete(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await adminDeleteQuestion(id);
    redirect("/admin/questions?message=deleted");
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Admin
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {i18n.pendingTitle}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {pending.length === 0 ? i18n.noPending : i18n.pendingCount(pending.length)}
        </p>
      </div>

      {message && (
        <div className="rounded-md border border-border bg-card px-4 py-3 text-sm">
          {message === "approved" ? i18n.approved : message === "deleted" ? i18n.deleted : i18n.rejected}
        </div>
      )}

      {pending.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">{i18n.allCaughtUp}</p>
          <Link href="/questions" className="mt-4 inline-block text-sm font-medium hover:underline">
            {i18n.browseQuestions}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((q) => (
            <article key={q.id} className="rounded-lg border border-border bg-card p-5 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                  {topicLabels[q.topic] ?? q.topic}
                </span>
                <span className="rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                  {i18n.level(q.level, i18nLevels[lang][q.level as keyof typeof i18nLevels.en] ?? String(q.level))}
                </span>
                {q.submitted_by_email && (
                  <span className="text-xs text-muted-foreground">
                    {i18n.by} {q.submitted_by_email}
                  </span>
                )}
                <span className="ml-auto text-xs text-muted-foreground">
                  {new Date(q.created_at).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-GB", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">{q.question}</p>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {q.answer_general}
                </p>
              </div>

              <div className="flex gap-2 pt-1">
                <form action={handleApprove}>
                  <input type="hidden" name="id" value={q.id} />
                  <button type="submit" className="rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90">
                    {i18n.approve}
                  </button>
                </form>
                <form action={handleReject}>
                  <input type="hidden" name="id" value={q.id} />
                  <button type="submit" className="rounded-md border border-border px-4 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10">
                    {i18n.reject}
                  </button>
                </form>
                <form action={handleDelete}>
                  <input type="hidden" name="id" value={q.id} />
                  <button type="submit" className="rounded-md border border-border px-4 py-1.5 text-xs font-medium text-muted-foreground hover:border-destructive hover:text-destructive">
                    {i18n.delete}
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
