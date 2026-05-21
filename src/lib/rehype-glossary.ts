// rehype plugin — auto-wraps glossary terms inside rendered markdown.
//
// Runs over the hast tree BEFORE rehype-highlight so code text is still a
// direct child of <code> and can be skipped cleanly. Each matched term
// becomes a <glossaryterm> element, which MarkdownContent maps to <TermTooltip>.
//
// Used as a unified attacher: [rehypeGlossary, terms] in a rehypePlugins list.

import type { GlossaryTerm } from "./glossary-match";
import { buildMatcher, splitText } from "./glossary-match";

type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

// Never wrap terms inside these — code, existing links, raw scripts/styles.
const SKIP_TAGS = new Set(["code", "pre", "a", "script", "style"]);

export function rehypeGlossary(terms: GlossaryTerm[]) {
  return function transformer(tree: HastNode): void {
    const built = buildMatcher(terms);
    if (!built) return;
    // Alias to a non-null const so the nested visit closure keeps the type.
    const matcher = built;

    // Shared across the whole document — only the first hit per term is linked.
    const used = new Set<string>();

    function visit(node: HastNode, skip: boolean): void {
      if (!node.children) return;

      const next: HastNode[] = [];
      for (const child of node.children) {
        if (child.type === "text" && !skip && typeof child.value === "string") {
          const segments = splitText(child.value, matcher, used);
          if (segments.length === 1 && segments[0]?.kind === "text") {
            next.push(child);
            continue;
          }
          for (const seg of segments) {
            if (seg.kind === "text") {
              next.push({ type: "text", value: seg.value });
            } else {
              next.push({
                type: "element",
                tagName: "glossaryterm",
                properties: { slug: seg.slug, tip: seg.tooltip },
                children: [{ type: "text", value: seg.value }],
              });
            }
          }
        } else {
          if (child.type === "element") {
            const childSkip =
              skip || (child.tagName ? SKIP_TAGS.has(child.tagName) : false);
            visit(child, childSkip);
          }
          next.push(child);
        }
      }
      node.children = next;
    }

    visit(tree, false);
  };
}
