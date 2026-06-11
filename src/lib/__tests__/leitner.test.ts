import { describe, expect, it } from "vitest";

import { BOX_INTERVAL_DAYS, MAX_BOX, nextBox, nextDueAt } from "@/lib/leitner";

describe("nextBox", () => {
  it("starts an unseen question at box 1 when correct", () => {
    expect(nextBox(undefined, true)).toBe(1);
  });

  it("promotes one box per correct answer", () => {
    expect(nextBox(1, true)).toBe(2);
    expect(nextBox(4, true)).toBe(5);
  });

  it("caps promotion at MAX_BOX", () => {
    expect(nextBox(5, true)).toBe(MAX_BOX);
  });

  it("demotes to box 1 on a wrong answer regardless of current box", () => {
    expect(nextBox(5, false)).toBe(1);
    expect(nextBox(2, false)).toBe(1);
    expect(nextBox(undefined, false)).toBe(1);
  });
});

describe("nextDueAt", () => {
  const base = new Date("2026-06-11T12:00:00.000Z");

  it("box 1 is due immediately", () => {
    expect(nextDueAt(1, base)).toBe(base.toISOString());
  });

  it("applies the interval for each box", () => {
    expect(nextDueAt(2, base)).toBe("2026-06-12T12:00:00.000Z");
    expect(nextDueAt(3, base)).toBe("2026-06-14T12:00:00.000Z");
    expect(nextDueAt(4, base)).toBe("2026-06-18T12:00:00.000Z");
    expect(nextDueAt(5, base)).toBe("2026-07-02T12:00:00.000Z");
  });

  it("falls back to 0 days for unknown boxes", () => {
    expect(nextDueAt(99, base)).toBe(base.toISOString());
  });

  it("intervals grow monotonically", () => {
    const days = [1, 2, 3, 4, 5].map((b) => BOX_INTERVAL_DAYS[b]!);
    expect([...days].sort((a, b) => a - b)).toEqual(days);
  });
});
