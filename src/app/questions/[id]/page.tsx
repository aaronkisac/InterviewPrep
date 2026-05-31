import Link from "next/link";
import { notFound } from "next/navigation";

import { GlossaryText } from "@/components/glossary-text";
import { MarkdownContent } from "@/components/markdown-content";
import { getQuestionById } from "@/lib/questions";
import { listSystemTopics } from "@/lib/actions/admin-topics";
import { listTerms } from "@/lib/terms";
import { TR_FALLBACK } from "@/lib/topics";
import { getLang } from "@/lib/lang";
import { i18nQuestionDetail } from "@/lib/i18n";

import { PersonalExample } from "./_components/personal-example";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const question = await getQuestionById(id).catch(() => null);
  return {
    title: question ? `${question.question} — Interview Prep` : "Interview Prep",
  };
}

export default async function QuestionDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const lang = await getLang();
  const [question, terms, systemTopics] = await Promise.all([
    getQuestionById(id),
    listTerms(),
    listSystemTopics(),
  ]);
  const topicLabels = Object.fromEntries(systemTopics.map((t) => [t.slug, t.name]));
  if (!question) notFound();

  const shortAnswer =
    lang === "tr"
      ? question.answer_general_tr || TR_FALLBACK
      : question.answer_general;

  const deepDive =
    lang === "tr" ? question.detail_md_tr : question.detail_md;

  const personal =
    lang === "tr" ? question.answer_personal_tr : question.answer_personal;

  const i18n = i18nQuestionDetail[lang];

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-10">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/questions"
          className="hover:underline"
        >
          {i18n.back}
        </Link>
      </nav>

      <header className="border-b border-border pb-6">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Link
            href={`/questions?topic=${question.topic}`}
            className="rounded bg-secondary px-1.5 py-0.5 font-medium text-secondary-foreground hover:opacity-80"
          >
            {topicLabels[question.topic] ?? question.topic}
          </Link>
          <Link
            href={`/questions?level=${question.level}`}
            className="text-muted-foreground hover:underline"
          >
            {question.level_label}
          </Link>
        </div>
        <h1 className="mt-3 text-2xl font-semibold leading-tight tracking-tight">
          {question.question}
        </h1>
      </header>

      <section className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {i18n.summary}
        </h2>
        <div className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
          {shortAnswer ? (
            <GlossaryText text={shortAnswer} terms={terms} />
          ) : (
            <span className="text-muted-foreground italic">{i18n.noAnswer}</span>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {i18n.deepDive}
        </h2>
        <div className="mt-3">
          {deepDive ? (
            <MarkdownContent source={deepDive} glossaryTerms={terms} />
          ) : (
            <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm italic text-muted-foreground">
              {i18n.noDetail}
            </p>
          )}
        </div>
      </section>

      {personal && <PersonalExample text={personal} lang={lang} />}
    </main>
  );
}
