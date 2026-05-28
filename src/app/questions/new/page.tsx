import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { LEVELS } from "@/lib/topics";
import { submitQuestion } from "@/lib/actions/questions";
import { listSystemTopics } from "@/lib/actions/admin-topics";
import { listCustomTopics, getCustomTopic, createCustomQuestion } from "@/lib/actions/custom-topics";
import { NewQuestionForm } from "./_components/new-question-form";

export const metadata = { title: "Submit a question — Interview Prep" };

export default async function NewQuestionPage() {
  const session = await auth().catch(() => null);
  if (!session?.user) redirect("/signin");

  const [systemTopics, customTopics] = await Promise.all([
    listSystemTopics(),
    listCustomTopics(session.user.id).catch(() => []),
  ]);

  async function handleSubmit(formData: FormData) {
    "use server";

    const session = await auth().catch(() => null);
    if (!session?.user?.id) redirect("/signin");

    const topic = formData.get("topic") as string;
    const level = Number(formData.get("level")) as 1 | 2 | 3 | 4 | 5;
    const question = (formData.get("question") as string | null)?.trim() ?? "";
    const answer_general =
      (formData.get("answer_general") as string | null)?.trim() ?? "";

    if (!question || !answer_general || !topic || !level) return;

    // Custom topic — always private, save to custom_questions
    if (topic.startsWith("custom:")) {
      const slug = topic.slice("custom:".length);
      const data = await getCustomTopic(slug, session.user.id).catch(() => null);
      if (!data) return;
      await createCustomQuestion(data.topic.id, question, answer_general, level);
      redirect("/dashboard");
    }

    // System topic — respect visibility choice
    const visibility = formData.get("visibility") as string;
    const is_shared = visibility === "public";

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

      <NewQuestionForm
        systemTopics={systemTopics}
        customTopics={customTopics}
        levels={LEVELS}
        action={handleSubmit}
      />
    </main>
  );
}
