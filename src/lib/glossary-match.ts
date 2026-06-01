// Pure, dependency-free glossary term matcher.
//
// Shared by two render paths:
//   - rehype-glossary.ts  → auto-wraps terms inside deep-dive markdown
//   - glossary-text.tsx   → wraps terms inside plain-text answers
//
// No server-only imports here, so it is safe to pull into Client Components.

export type GlossaryTerm = {
  slug: string;
  label: string;
  tooltip: string;
  tooltip_tr?: string;
};

export type GlossaryMatcher = {
  regex: RegExp;
  /** lowercased label → term */
  byLabel: Map<string, GlossaryTerm>;
};

export type Segment =
  | { kind: "text"; value: string }
  | { kind: "term"; slug: string; tooltip: string; tooltip_tr?: string; value: string };

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Build a matcher from the live term list. Pass `excludeSlugs` to skip a term
 * on its own glossary page (so a definition does not link to itself).
 */
export function buildMatcher(
  terms: GlossaryTerm[],
  excludeSlugs: string[] = [],
): GlossaryMatcher | null {
  const exclude = new Set(excludeSlugs);
  const usable = terms.filter((t) => !exclude.has(t.slug) && t.label.trim());
  if (usable.length === 0) return null;

  const byLabel = new Map<string, GlossaryTerm>();
  for (const term of usable) {
    byLabel.set(term.label.toLowerCase(), term);
  }

  // Longest labels first so "Server Component" wins over a hypothetical "Component".
  const alternation = usable
    .map((t) => t.label)
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join("|");

  // Capture group 1 = the core label; an optional trailing "s" lets a term
  // defined as "Hook" still match "Hooks" in prose.
  const regex = new RegExp(`\\b(${alternation})s?\\b`, "gi");
  return { regex, byLabel };
}

/**
 * Split a string into text / term segments. Only the FIRST occurrence of each
 * term is wrapped — `used` tracks slugs already linked so callers can share
 * one set across a whole document.
 */
export function splitText(
  text: string,
  matcher: GlossaryMatcher,
  used: Set<string>,
): Segment[] {
  const out: Segment[] = [];
  let cursor = 0;
  matcher.regex.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = matcher.regex.exec(text)) !== null) {
    const full = match[0];
    const core = match[1];
    if (!core) continue;

    const term = matcher.byLabel.get(core.toLowerCase());
    if (!term || used.has(term.slug)) continue;

    used.add(term.slug);
    if (match.index > cursor) {
      out.push({ kind: "text", value: text.slice(cursor, match.index) });
    }
    out.push({
      kind: "term",
      slug: term.slug,
      tooltip: term.tooltip,
      tooltip_tr: term.tooltip_tr,
      value: full,
    });
    cursor = match.index + full.length;
  }

  if (cursor < text.length) {
    out.push({ kind: "text", value: text.slice(cursor) });
  }
  if (out.length === 0) {
    out.push({ kind: "text", value: text });
  }
  return out;
}
