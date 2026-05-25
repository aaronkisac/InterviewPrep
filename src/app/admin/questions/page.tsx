import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { TOPIC_LABELS, LEVELS } from "@/lib/topics";
import {
  getPendingSubmissions,
  approveQuestion,
  rejectQuestion,
  adminDeleteQuestion,
} from "@/lib/actions/questions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Pending questions" };

function levelLabel(level: number) {
  return LEVELS.find((l) => l.value === level)?.label ?? String(level);
}

export default async function AdminQuestionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  // Layout already guards admin access — auth check here is just for type safety
  const session = await auth().catch(() => null);
  if (!session?.user?.id) redirect("/signin");

  const params = await searchParams;
  const message = params.message;

  const pending = await getPendingSubmissions();

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
    <main className="mx-auto w-full max-w-3xl px-6 py-12 space-y-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Admin
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Pending submissions
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {pending.length === 0
              ? "No submissions awaiting review."
              : `${pending.length} question${pending.length === 1 ? "" : "s"} awaiting review.`}
          </p>
        </div>

        {/* Toast-style flash message */}
        {message && (
          <div className="rounded-md border border-border bg-card px-4 py-3 text-sm">
            {message === "approved"
              ? "✓ Question approved and published."
              : message === "deleted"
                ? "🗑 Question permanently deleted."
                : "✗ Question rejected and hidden."}
          </div>
        )}

        {pending.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              All caught up — no pending submissions.
            </p>
            <Link
              href="/questions"
              className="mt-4 inline-block text-sm font-medium hover:underline"
            >
              Browse questions →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((q) => (
              <article
                key={q.id}
                className="rounded-lg border border-border bg-card p-5 space-y-3"
              >
                {/* Meta chips */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                    {TOPIC_LABELS[q.topic as keyof typeof TOPIC_LABELS] ??
                      q.topic}
                  </span>
                  <span className="rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                    Level {q.level} — {levelLabel(q.level)}
                  </span>
                  {q.submitted_by_email && (
                    <span className="text-xs text-muted-foreground">
                      by {q.submitted_by_email}
                    </span>
                  )}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {new Date(q.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <p className="text-sm font-medium">{q.question}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {q.answer_general}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <form action={handleApprove}>
                    <input type="hidden" name="id" value={q.id} />
                    <button
                      type="submit"
                      className="rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
                    >
                      Approve
                    </button>
                  </form>
                  <form action={handleReject}>
                    <input type="hidden" name="id" value={q.id} />
                    <button
                      type="submit"
                      className="rounded-md border border-border px-4 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
                    >
                      Reject
                    </button>
                  </form>
                  <form action={handleDelete}>
                    <input type="hidden" name="id" value={q.id} />
                    <button
                      type="submit"
                      className="rounded-md border border-border px-4 py-1.5 text-xs font-medium text-muted-foreground hover:border-destructive hover:text-destructive"
                    >
                      Delete
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
