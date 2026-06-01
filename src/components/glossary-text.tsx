// Renders a plain-text string with glossary terms wrapped in <TermTooltip>.
//
// Has no hooks or state, so it works in both Server and Client Components.
// Used for short answers and term definitions where the source is plain text
// rather than markdown (markdown goes through rehype-glossary instead).

import { Fragment } from "react";

import { TermTooltip } from "@/components/term-tooltip";
import type { GlossaryTerm } from "@/lib/glossary-match";
import { buildMatcher, splitText } from "@/lib/glossary-match";

export function GlossaryText({
  text,
  terms,
  excludeSlugs,
  isLoggedIn = true,
  lang = "en",
}: {
  text: string;
  terms: GlossaryTerm[];
  /** Skip these slugs — used on a term's own page so it doesn't link to itself. */
  excludeSlugs?: string[];
  isLoggedIn?: boolean;
  lang?: "en" | "tr";
}) {
  const matcher = buildMatcher(terms, excludeSlugs);
  if (!matcher) return <>{text}</>;

  const segments = splitText(text, matcher, new Set<string>());

  return (
    <>
      {segments.map((segment, index) =>
        segment.kind === "text" ? (
          <Fragment key={index}>{segment.value}</Fragment>
        ) : (
          <TermTooltip
            key={index}
            slug={segment.slug}
            tooltip={segment.tooltip}
            tooltipTr={segment.tooltip_tr}
            lang={lang}
            isLoggedIn={isLoggedIn}
          >
            {segment.value}
          </TermTooltip>
        ),
      )}
    </>
  );
}
