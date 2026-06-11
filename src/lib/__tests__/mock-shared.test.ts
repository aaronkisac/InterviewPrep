import { describe, expect, it } from "vitest";

import {
  parseLevelOr,
  parseSessionLength,
  parseTimerSeconds,
  parseTopicList,
} from "@/lib/mock-shared";

describe("parseTopicList", () => {
  it("splits a comma-separated list and trims whitespace", () => {
    expect(parseTopicList("react, nextjs ,typescript")).toEqual([
      "react",
      "nextjs",
      "typescript",
    ]);
  });

  it("drops empty entries", () => {
    expect(parseTopicList("react,,nextjs,")).toEqual(["react", "nextjs"]);
  });

  it("returns an empty array for undefined or empty input", () => {
    expect(parseTopicList(undefined)).toEqual([]);
    expect(parseTopicList("")).toEqual([]);
  });
});

describe("parseLevelOr", () => {
  it("accepts integers 1–5", () => {
    expect(parseLevelOr("1", 3)).toBe(1);
    expect(parseLevelOr("5", 3)).toBe(5);
  });

  it("falls back for out-of-range, non-integer or missing values", () => {
    expect(parseLevelOr("0", 3)).toBe(3);
    expect(parseLevelOr("6", 3)).toBe(3);
    expect(parseLevelOr("2.5", 3)).toBe(3);
    expect(parseLevelOr("abc", 3)).toBe(3);
    expect(parseLevelOr(undefined, 2)).toBe(2);
  });
});

describe("parseSessionLength", () => {
  it("accepts the allowed lengths", () => {
    expect(parseSessionLength("5")).toBe(5);
    expect(parseSessionLength("10")).toBe(10);
    expect(parseSessionLength("20")).toBe(20);
  });

  it("defaults to 10 for anything else", () => {
    expect(parseSessionLength("15")).toBe(10);
    expect(parseSessionLength("abc")).toBe(10);
    expect(parseSessionLength(undefined)).toBe(10);
  });
});

describe("parseTimerSeconds", () => {
  it("accepts the allowed timer values", () => {
    expect(parseTimerSeconds("30")).toBe(30);
    expect(parseTimerSeconds("60")).toBe(60);
    expect(parseTimerSeconds("90")).toBe(90);
  });

  it("defaults to 0 (off) for anything else", () => {
    expect(parseTimerSeconds("45")).toBe(0);
    expect(parseTimerSeconds("-30")).toBe(0);
    expect(parseTimerSeconds("abc")).toBe(0);
    expect(parseTimerSeconds(undefined)).toBe(0);
  });
});
