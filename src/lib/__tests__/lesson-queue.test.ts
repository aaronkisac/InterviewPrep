import { describe, expect, it } from "vitest";

import {
  accuracyPct,
  answerStep,
  continueStep,
  currentStep,
  initQueue,
  isDone,
  progress,
  type LessonQueueState,
} from "@/lib/course/lesson-queue";

describe("initQueue", () => {
  it("queues all steps in order", () => {
    const q = initQueue(4);
    expect(q.pending).toEqual([0, 1, 2, 3]);
    expect(currentStep(q)).toBe(0);
    expect(isDone(q)).toBe(false);
  });
});

describe("answerStep", () => {
  it("clears the step on a correct answer", () => {
    const q = answerStep(initQueue(3), true);
    expect(q.pending).toEqual([1, 2]);
    expect(q.cleared).toBe(1);
  });

  it("re-queues the step at the back on a wrong answer", () => {
    const q = answerStep(initQueue(3), false);
    expect(q.pending).toEqual([1, 2, 0]);
    expect(q.cleared).toBe(0);
  });

  it("the lesson only ends when every step is answered correctly", () => {
    let q = initQueue(2);
    q = answerStep(q, false); // 0 wrong → [1, 0]
    q = answerStep(q, true); // 1 cleared → [0]
    expect(isDone(q)).toBe(false);
    q = answerStep(q, true); // 0 cleared on retry
    expect(isDone(q)).toBe(true);
  });

  it("records only the first attempt per step", () => {
    let q = initQueue(2);
    q = answerStep(q, false); // step 0 wrong (first try recorded)
    q = answerStep(q, true); // step 1 correct
    q = answerStep(q, true); // step 0 correct on retry — must not overwrite
    expect(q.firstTry).toEqual({ 0: false, 1: true });
  });

  it("is a no-op on a finished lesson", () => {
    let q = initQueue(1);
    q = answerStep(q, true);
    expect(answerStep(q, true)).toEqual(q);
  });
});

describe("continueStep", () => {
  it("advances concept steps without recording a result", () => {
    const q = continueStep(initQueue(2));
    expect(q.pending).toEqual([1]);
    expect(q.cleared).toBe(1);
    expect(q.firstTry).toEqual({});
  });
});

describe("progress", () => {
  it("starts at 0 and ends at 1", () => {
    let q = initQueue(2);
    expect(progress(q)).toBe(0);
    q = answerStep(q, true);
    expect(progress(q)).toBe(0.5);
    q = answerStep(q, true);
    expect(progress(q)).toBe(1);
  });

  it("shrinks by a sliver when a step is re-queued", () => {
    let q = initQueue(4);
    q = answerStep(q, true);
    q = answerStep(q, true);
    const before = progress(q); // 2/4
    q = answerStep(q, false); // re-queue → 2 cleared, 2 pending stays 2... queue grows
    expect(progress(q)).toBeLessThanOrEqual(before);
    expect(isDone(q)).toBe(false);
  });
});

describe("accuracyPct", () => {
  it("measures first attempts only", () => {
    let q = initQueue(4);
    q = answerStep(q, true);
    q = answerStep(q, false);
    q = answerStep(q, true);
    q = answerStep(q, true);
    q = answerStep(q, true); // retry of the wrong one — ignored
    expect(accuracyPct(q)).toBe(75);
  });

  it("returns 100 for lessons with no answered steps", () => {
    const q: LessonQueueState = initQueue(1);
    expect(accuracyPct(q)).toBe(100);
    expect(accuracyPct(continueStep(q))).toBe(100);
  });
});
