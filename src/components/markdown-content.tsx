// Server Component — renders markdown with GitHub-flavored extensions and
// syntax-highlighted code blocks. No client JS shipped (aside from the
// TermTooltip popovers, which are client islands).
//
// Styling: leans on Tailwind utility classes via a wrapper div. We don't pull
// in @tailwindcss/typography to keep the dependency surface small; the small
// element overrides below are enough for our deep-dive content.
//
// When `glossaryTerms` is passed, rehype-glossary auto-wraps the first mention
// of each term in a <glossaryterm> element, mapped here to <TermTooltip>.

import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

import { TermTooltip } from "@/components/term-tooltip";
import type { GlossaryTerm } from "@/lib/glossary-match";
import { rehypeGlossary } from "@/lib/rehype-glossary";
import { cn } from "@/lib/utils";

type RehypePlugins = React.ComponentProps<typeof Markdown>["rehypePlugins"];
type MarkdownComponents = React.ComponentProps<typeof Markdown>["components"];

const HIGHLIGHT_OPTIONS = { detect: true, ignoreMissing: true };

// Renders the <glossaryterm> element that rehype-glossary injects. Reads slug
// and tooltip from the raw hast node properties.
function GlossaryTermNode({
  node,
  lang = "en",
  children,
}: {
  node?: { properties?: Record<string, unknown> };
  lang?: "en" | "tr";
  children?: React.ReactNode;
}) {
  const slug = node?.properties?.slug;
  const tip = node?.properties?.tip;
  const tipTr = node?.properties?.tipTr;
  if (typeof slug !== "string" || typeof tip !== "string") {
    return <>{children}</>;
  }
  return (
    <TermTooltip
      slug={slug}
      tooltip={tip}
      tooltipTr={typeof tipTr === "string" ? tipTr : undefined}
      lang={lang}
    >
      {children}
    </TermTooltip>
  );
}

export function MarkdownContent({
  source,
  className,
  glossaryTerms,
  lang = "en",
}: {
  source: string;
  className?: string;
  /** When supplied, glossary terms in the prose become hover/focus tooltips. */
  glossaryTerms?: GlossaryTerm[];
  lang?: "en" | "tr";
}) {
  const useGlossary = Boolean(glossaryTerms && glossaryTerms.length > 0);

  const rehypePlugins = (
    useGlossary
      ? [
          [rehypeGlossary, glossaryTerms],
          [rehypeHighlight, HIGHLIGHT_OPTIONS],
        ]
      : [[rehypeHighlight, HIGHLIGHT_OPTIONS]]
  ) as unknown as RehypePlugins;

  const GlossaryTermNodeWithLang = (props: Parameters<typeof GlossaryTermNode>[0]) =>
    GlossaryTermNode({ ...props, lang });

  const components = (
    useGlossary ? { glossaryterm: GlossaryTermNodeWithLang } : undefined
  ) as unknown as MarkdownComponents;

  return (
    <div
      className={cn(
        "max-w-none text-base leading-relaxed text-foreground/90",
        "[&>*+*]:mt-4",
        "[&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight",
        "[&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold",
        "[&_p]:leading-relaxed",
        "[&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:opacity-80",
        "[&_strong]:font-semibold",
        "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.9em] [&_code]:font-mono",
        // pre wrapper: only structural styling — the inner `.hljs` code element
        // brings its own background and padding from the highlight theme in globals.css.
        "[&_pre]:overflow-hidden [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-border [&_pre]:text-sm",
        // Reset inline-code background inside pre — the .hljs class handles it.
        "[&_pre_code]:!bg-transparent [&_pre_code]:!p-0 [&_pre_code]:rounded-none",
        "[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6",
        "[&_li]:my-1",
        "[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground",
        "[&_table]:w-full [&_table]:border-collapse [&_table]:text-sm",
        "[&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:px-3 [&_th]:py-2 [&_th]:text-left",
        "[&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2",
        className,
      )}
    >
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={rehypePlugins}
        components={components}
      >
        {source}
      </Markdown>
    </div>
  );
}
