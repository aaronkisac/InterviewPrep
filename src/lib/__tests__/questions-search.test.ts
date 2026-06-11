import { describe, expect, it } from "vitest";

import { buildSearchOrFilter, parsePage } from "@/lib/questions";

describe("buildSearchOrFilter", () => {
  it("combines ilike + english FTS for the default language", () => {
    expect(buildSearchOrFilter("closure", undefined)).toBe(
      "question.ilike.%closure%,search_vector.wfts(english).closure",
    );
  });

  it("searches both languages' columns when lang is tr", () => {
    const filter = buildSearchOrFilter("kapanış", "tr");
    expect(filter).toContain("question_tr.ilike.%kapanış%");
    expect(filter).toContain("question.ilike.%kapanış%");
    expect(filter).toContain("search_vector_tr.wfts(simple).kapanış");
    expect(filter).toContain("search_vector.wfts(english).kapanış");
  });

  it("strips PostgREST-reserved characters (commas, parens)", () => {
    expect(buildSearchOrFilter("useMemo(), useCallback()", undefined)).toBe(
      "question.ilike.%useMemo useCallback%,search_vector.wfts(english).useMemo useCallback",
    );
  });

  it("collapses whitespace and returns null for empty input", () => {
    expect(buildSearchOrFilter("   ", undefined)).toBeNull();
    expect(buildSearchOrFilter(",()", undefined)).toBeNull();
    expect(buildSearchOrFilter("  a   b  ", undefined)).toContain("%a b%");
  });
});

describe("parsePage", () => {
  it("accepts positive integers", () => {
    expect(parsePage("1")).toBe(1);
    expect(parsePage("42")).toBe(42);
  });

  it("falls back to 1 for invalid input", () => {
    expect(parsePage("0")).toBe(1);
    expect(parsePage("-3")).toBe(1);
    expect(parsePage("2.5")).toBe(1);
    expect(parsePage("abc")).toBe(1);
    expect(parsePage(undefined)).toBe(1);
  });
});
