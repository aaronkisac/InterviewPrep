import Link from "next/link";
import { notFound } from "next/navigation";

import { GlossaryText } from "@/components/glossary-text";
import { MarkdownContent } from "@/components/markdown-content";
import { getRelatedTerms, getTermBySlug, listTerms } from "@/lib/terms";
import { TOPIC_LABELS } from "@/lib/topics";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const term = await getTermBySlug(slug).catch(() => null);
  return {
    title: term ? `${term.label} — Glossary` : "Glossary",
  };
}

export default async function TermDetailPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const [term, allTerms] = await Promise.all([
    getTermBySlug(slug),
    listTerms(),
  ]);
  if (!term) notFound();

  const related = await getRelatedTerms(term.related_slugs);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/glossary" className="hover:underline">
          ← Glossary
        </Link>
      </nav>

      <header className="border-b border-border pb-6">
        {term.topic && (
          <Link
            href={`/questions?topic=${term.topic}`}
            className="rounded bg-secondary px-1.5 py-0.5 text-xs font-medium text-secondary-foreground hover:opacity-80"
          >
            {TOPIC_LABELS[term.topic]}
          </Link>
        )}
        <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight">
          {term.label}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          {term.tooltip}
        </p>
      </header>

      <section className="mt-8">
        <h2 className="sr-only">Definition</h2>
        <div className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
          <GlossaryText
            text={term.definition}
            terms={allTerms}
            excludeSlugs={[term.slug]}
          />
        </div>
      </section>

      {term.code_example && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Example
          </h2>
          <div className="mt-3">
            <MarkdownContent source={"```ts\n" + term.code_example + "\n```"} />
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Related
          </h2>
          <ul className="mt-3 space-y-2">
            {related.map((rel) => (
              <li key={rel.id}>
                <Link
                  href={`/glossary/${rel.slug}`}
                  className="block rounded-lg border border-border bg-card p-3 text-sm transition hover:border-foreground/30 hover:bg-accent/50"
                >
                  <p className="font-medium">{rel.label}</p>
                  <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                    {rel.tooltip}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
