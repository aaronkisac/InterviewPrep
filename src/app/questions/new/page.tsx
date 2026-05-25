import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { TOPIC_LABELS, TOPICS, LEVELS } from "@/lib/topics";
import { submitQuestion } from "@/lib/actions/questions";

export const metadata = { title: "Submit a question — Interview Prep" };

export default async function NewQuestionPage() {
  const session = await auth().catch(() => null);
  if (!session?.user) redirect("/signin");

  async function handleSubmit(formData: FormData) {
    "use server";

    const topic = formData.get("topic") as string;
    const level = Number(formData.get("level")) as 1 | 2 | 3 | 4 | 5;
    const question = (formData.get("question") as string | null)?.trim() ?? "";
    const answer_general =
      (formData.get("answer_general") as string | null)?.trim() ?? "";
    const visibility = formData.get("visibility") as string;
    const is_shared = visibility === "public";

    if (!question || !answer_general || !topic || !level) return;

    const result = await submitQuestion({
      topic: topic as never,
      level,
      question,
      answer_general,
      is_shared,
    });

    if (result.ok) {
      redirect(is_shared ? "/dashboard?submitted=public" : "/dashboard?submitted=private");
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
        <div className="mb-8 space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            <Link href="/questions" className="hover:underline">
              Questions
            </Link>{" "}
            / Submit
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Submit a question
          </h1>
          <p className="text-sm text-muted-foreground">
            Private questions are visible only to you. Public submissions go to
            the admin review queue before appearing in the shared bank.
          </p>
        </div>

        <form action={handleSubmit} className="space-y-6">
          {/* Topic + Level row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="topic"
                className="text-sm font-medium"
              >
                Topic
              </label>
              <select
                id="topic"
                name="topic"
                required
                defaultValue=""
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="" disabled>
                  Select a topic…
                </option>
                {TOPICS.map((t) => (
                  <option key={t} value={t}>
                    {TOPIC_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="level" className="text-sm font-medium">
                Level
              </label>
              <select
                id="level"
                name="level"
                required
                defaultValue=""
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="" disabled>
                  Select a level…
                </option>
                {LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.value} — {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Question text */}
          <div className="space-y-1.5">
            <label htmlFor="question" className="text-sm font-medium">
              Question
            </label>
            <textarea
              id="question"
              name="question"
              required
              rows={3}
              placeholder="e.g. What is the difference between useMemo and useCallback?"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Answer */}
          <div className="space-y-1.5">
            <label htmlFor="answer_general" className="text-sm font-medium">
              Answer
            </label>
            <textarea
              id="answer_general"
              name="answer_general"
              required
              rows={6}
              placeholder="Write a clear, concise answer. Markdown is supported on the detail page."
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Visibility */}
          <fieldset className="space-y-3 rounded-lg border border-border p-4">
            <legend className="px-1 text-sm font-medium">Visibility</legend>

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="radio"
                name="visibility"
                value="private"
                defaultChecked
                className="mt-0.5"
              />
              <span>
                <span className="text-sm font-medium">Private</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  Only you can see this question. Goes live immediately.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="radio"
                name="visibility"
                value="public"
                className="mt-0.5"
              />
              <span>
                <span className="text-sm font-medium">Submit for review</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  Propose this question for the shared bank. An admin will
                  review and approve or reject it.
                </span>
              </span>
            </label>
          </fieldset>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Submit question
            </button>
            <Link
              href="/questions"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Link>
          </div>
        </form>
    </main>
  );
}
