import Link from "next/link";
import { notFound } from "next/navigation";

import { GlossaryText } from "@/components/glossary-text";
import { MarkdownContent } from "@/components/markdown-content";
import { getQuestionById, TOPIC_LABELS } from "@/lib/questions";
import { listTerms } from "@/lib/terms";
import { parseLanguage, TR_FALLBACK } from "@/lib/topics";

import { PersonalExample } from "./_components/personal-example";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ lang?: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const question = await getQuestionById(id).catch(() => null);
  return {
    title: question ? `${question.question} — Interview Prep` : "Interview Prep",
  };
}

export default async function QuestionDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const { lang: langParam } = await searchParams;
  const lang = parseLanguage(langParam);
  const [question, terms] = await Promise.all([
    getQuestionById(id),
    listTerms(),
  ]);
  if (!question) notFound();

  const shortAnswer =
    lang === "tr"
      ? question.answer_general_tr || TR_FALLBACK
      : question.answer_general;

  const deepDive =
    lang === "tr" ? question.detail_md_tr : question.detail_md;

  const personal =
    lang === "tr" ? question.answer_personal_tr : question.answer_personal;

  const i18n = {
    back: lang === "tr" ? "← Tüm sorular" : "← All questions",
    summary: lang === "tr" ? "Özet" : "Summary",
    deepDive: lang === "tr" ? "Detaylı anlatım" : "Deep dive",
    noDetail:
      lang === "tr"
        ? "Detaylı anlatım yakında eklenecek."
        : "Deep-dive content coming soon.",
    noAnswer:
      lang === "tr" ? "Henüz cevap yazılmadı." : "No answer authored yet.",
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href={`/questions${lang === "tr" ? "?lang=tr" : ""}`}
          className="hover:underline"
        >
          {i18n.back}
        </Link>
      </nav>

      <header className="border-b border-border pb-6">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Link
            href={`/questions?topic=${question.topic}${lang === "tr" ? "&lang=tr" : ""}`}
            className="rounded bg-secondary px-1.5 py-0.5 font-medium text-secondary-foreground hover:opacity-80"
          >
            {TOPIC_LABELS[question.topic]}
          </Link>
          <Link
            href={`/questions?level=${question.level}${lang === "tr" ? "&lang=tr" : ""}`}
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
