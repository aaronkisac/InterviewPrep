import { describe, expect, it } from "vitest";

import { deriveCoursePath, type UnitMeta } from "@/lib/course/path-state";

const units: UnitMeta[] = [
  {
    id: "u1",
    position: 1,
    lessons: [
      { id: "l1", position: 1 },
      { id: "l2", position: 2 },
    ],
  },
  {
    id: "u2",
    position: 2,
    lessons: [
      { id: "l3", position: 1 },
      { id: "l4", position: 2 },
    ],
  },
];

function done(...ids: string[]): ReadonlySet<string> {
  return new Set(ids);
}

describe("deriveCoursePath", () => {
  it("starts with the first lesson active and everything else locked", () => {
    const state = deriveCoursePath(units, done());
    expect(state.activeLessonId).toBe("l1");
    expect(state.units[0]!.status).toBe("in_progress");
    expect(state.units[0]!.lessons.map((l) => l.status)).toEqual([
      "active",
      "locked",
    ]);
    expect(state.units[1]!.status).toBe("locked");
    expect(state.units[1]!.lessons.map((l) => l.status)).toEqual([
      "locked",
      "locked",
    ]);
  });

  it("advances the active lesson within a unit", () => {
    const state = deriveCoursePath(units, done("l1"));
    expect(state.activeLessonId).toBe("l2");
    expect(state.units[0]!.lessons.map((l) => l.status)).toEqual([
      "done",
      "active",
    ]);
    expect(state.units[0]!.completedPct).toBe(50);
  });

  it("unlocks the next unit only when the previous unit is fully done", () => {
    const state = deriveCoursePath(units, done("l1", "l2"));
    expect(state.units[0]!.status).toBe("done");
    expect(state.units[1]!.status).toBe("in_progress");
    expect(state.activeLessonId).toBe("l3");
  });

  it("never has more than one active lesson", () => {
    for (const completed of [done(), done("l1"), done("l1", "l2", "l3")]) {
      const state = deriveCoursePath(units, completed);
      const active = state.units
        .flatMap((u) => u.lessons)
        .filter((l) => l.status === "active");
      expect(active).toHaveLength(1);
    }
  });

  it("reports a finished course with no active lesson", () => {
    const state = deriveCoursePath(units, done("l1", "l2", "l3", "l4"));
    expect(state.activeLessonId).toBeNull();
    expect(state.units.every((u) => u.status === "done")).toBe(true);
    expect(state.units.every((u) => u.completedPct === 100)).toBe(true);
  });

  it("sorts units and lessons by position regardless of input order", () => {
    const shuffled: UnitMeta[] = [
      { ...units[1]!, lessons: [...units[1]!.lessons].reverse() },
      { ...units[0]!, lessons: [...units[0]!.lessons].reverse() },
    ];
    const state = deriveCoursePath(shuffled, done());
    expect(state.units.map((u) => u.id)).toEqual(["u1", "u2"]);
    expect(state.activeLessonId).toBe("l1");
  });

  it("ignores completion of lessons in locked units for unlock ordering", () => {
    // l3 somehow completed (e.g. content reshuffle) — unit 2 stays locked
    // because unit 1 is not done, and the active lesson remains in unit 1.
    const state = deriveCoursePath(units, done("l3"));
    expect(state.units[1]!.status).toBe("locked");
    expect(state.activeLessonId).toBe("l1");
  });
});
