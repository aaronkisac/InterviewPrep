import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getDueReviews } from "@/lib/actions/user-tracking";
import { getQuestionsByIds } from "@/lib/questions";
import { getLang } from "@/lib/lang";
import { i18nDashboard } from "@/lib/i18n";

import type { FlashcardQuestion } from "../flashcard/_components/flashcard-session";
import { FlashcardSession } from "../flashcard/_components/flashcard-session";

export const dynamic = "force-dynamic";

const REVIEW_SESSION_LIMIT = 20;

/**
 * Spaced-repetition review session: flashcards over the questions whose
 * Leitner box interval has elapsed, earliest due first. Answering updates
 * the boxes via the existing FlashcardSession → saveTopicMastery flow.
 */
export default async function ReviewPage() {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) redirect("/signin");

  const lang = await getLang();
  const i18n = i18nDashboard[lang];

  const due = await getDueReviews(session.user.id, REVIEW_SESSION_LIMIT);

  if (due.length === 0) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {i18n.reviewTitle}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {i18n.reviewAllCaughtUp}
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          ← Dashboard
        </Link>
      </main>
    );
  }

  // Hydrate question content, preserving due order (earliest first)
  const rows = await getQuestionsByIds(due.map((d) => d.questionId));
  const byId = new Map(rows.map((q) => [q.id, q]));
  const questions: FlashcardQuestion[] = [];
  for (const d of due) {
    const q = byId.get(d.questionId);
    if (!q) continue; // question deleted since it was answered
    questions.push({
      id: q.id,
      question: lang === "tr" && q.question_tr ? q.question_tr : q.question,
      answer:
        (lang === "tr" ? q.answer_general_tr : q.answer_general) ||
        q.answer_general ||
        "",
      level: q.level ?? 1,
      topic: q.topic,
      answer_personal:
        (lang === "tr" ? q.answer_personal_tr : q.answer_personal) ?? null,
    });
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-10">
      <FlashcardSession
        questions={questions}
        topicName={i18n.reviewTitle}
        lang={lang}
      />
    </main>
  );
}
