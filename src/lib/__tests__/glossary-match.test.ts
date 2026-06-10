import { describe, expect, it } from "vitest";

import {
  buildMatcher,
  splitText,
  type GlossaryTerm,
} from "@/lib/glossary-match";

const TERMS: GlossaryTerm[] = [
  { slug: "hook", label: "Hook", tooltip: "A React hook" },
  { slug: "server-component", label: "Server Component", tooltip: "RSC" },
  { slug: "jsx", label: "JSX", tooltip: "JavaScript XML" },
];

describe("buildMatcher", () => {
  it("returns null when no usable terms remain", () => {
    expect(buildMatcher([])).toBeNull();
    expect(buildMatcher(TERMS.slice(0, 1), ["hook"])).toBeNull();
  });

  it("excludes the given slugs", () => {
    const matcher = buildMatcher(TERMS, ["hook"]);
    expect(matcher?.byLabel.has("hook")).toBe(false);
    expect(matcher?.byLabel.has("jsx")).toBe(true);
  });

  it("escapes regex metacharacters in labels", () => {
    const matcher = buildMatcher([
      { slug: "next", label: "Next.js", tooltip: "framework" },
    ]);
    const segments = splitText("I use Next.js daily", matcher!, new Set());
    expect(segments.some((s) => s.kind === "term" && s.slug === "next")).toBe(
      true,
    );
    // The "." must not match an arbitrary character
    const noMatch = splitText("I use NextXjs daily", matcher!, new Set());
    expect(noMatch.every((s) => s.kind === "text")).toBe(true);
  });
});

describe("splitText", () => {
  it("wraps a known term and keeps surrounding text", () => {
    const matcher = buildMatcher(TERMS)!;
    const segments = splitText("Use a Hook here", matcher, new Set());
    expect(segments).toEqual([
      { kind: "text", value: "Use a " },
      {
        kind: "term",
        slug: "hook",
        tooltip: "A React hook",
        tooltip_tr: undefined,
        value: "Hook",
      },
      { kind: "text", value: " here" },
    ]);
  });

  it("matches case-insensitively and allows a plural s", () => {
    const matcher = buildMatcher(TERMS)!;
    const segments = splitText("hooks are great", matcher, new Set());
    const term = segments.find((s) => s.kind === "term");
    expect(term).toMatchObject({ slug: "hook", value: "hooks" });
  });

  it("prefers the longest label when terms overlap", () => {
    const terms: GlossaryTerm[] = [
      ...TERMS,
      { slug: "component", label: "Component", tooltip: "UI piece" },
    ];
    const matcher = buildMatcher(terms)!;
    const segments = splitText("A Server Component renders", matcher, new Set());
    const term = segments.find((s) => s.kind === "term");
    expect(term).toMatchObject({ slug: "server-component" });
  });

  it("wraps only the first occurrence of each term", () => {
    const matcher = buildMatcher(TERMS)!;
    const used = new Set<string>();
    const segments = splitText("Hook here, Hook there", matcher, used);
    const termCount = segments.filter((s) => s.kind === "term").length;
    expect(termCount).toBe(1);
    expect(used.has("hook")).toBe(true);
  });

  it("shares the used set across multiple calls", () => {
    const matcher = buildMatcher(TERMS)!;
    const used = new Set<string>();
    splitText("First Hook mention", matcher, used);
    const second = splitText("Second Hook mention", matcher, used);
    expect(second.every((s) => s.kind === "text")).toBe(true);
  });

  it("returns a single text segment when nothing matches", () => {
    const matcher = buildMatcher(TERMS)!;
    expect(splitText("nothing relevant", matcher, new Set())).toEqual([
      { kind: "text", value: "nothing relevant" },
    ]);
  });
});
