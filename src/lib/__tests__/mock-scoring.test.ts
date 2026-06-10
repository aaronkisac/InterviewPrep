import { describe, expect, it } from "vitest";

import { buildQuestionResults, computeMockScore } from "@/lib/mock-scoring";
import type { MockQuestion } from "@/lib/mock-shared";

function makeQuestion(
  id: string,
  correctOptionId: string,
  optionIds: string[],
): MockQuestion {
  return {
    id,
    topic: "react",
    level: 1,
    levelLabel: "Junior",
    question: `Question ${id}`,
    questionTr: `Soru ${id}`,
    options: optionIds.map((oid) => ({
      id: oid,
      text: `Option ${oid}`,
      textTr: `Seçenek ${oid}`,
      isCorrect: oid === correctOptionId,
      explanation: "",
      explanationTr: "",
    })),
  };
}

const questions: MockQuestion[] = [
  makeQuestion("q1", "a", ["a", "b", "c", "d"]),
  makeQuestion("q2", "c", ["a", "b", "c", "d"]),
  makeQuestion("q3", "b", ["a", "b", "c", "d"]),
];

describe("computeMockScore", () => {
  it("counts only correct selections", () => {
    expect(computeMockScore(questions, ["a", "c", "a"])).toBe(2);
  });

  it("returns 0 when nothing is selected", () => {
    expect(computeMockScore(questions, [null, null, null])).toBe(0);
  });

  it("returns full score when every answer is correct", () => {
    expect(computeMockScore(questions, ["a", "c", "b"])).toBe(3);
  });

  it("ignores selection ids that do not exist on the question", () => {
    expect(computeMockScore(questions, ["zzz", "c", null])).toBe(1);
  });

  it("handles an empty question list", () => {
    expect(computeMockScore([], [])).toBe(0);
  });
});

describe("buildQuestionResults", () => {
  it("maps each question to id, topic and correctness", () => {
    const results = buildQuestionResults(questions, ["a", "b", null]);
    expect(results).toEqual([
      { questionId: "q1", topic: "react", correct: true },
      { questionId: "q2", topic: "react", correct: false },
      { questionId: "q3", topic: "react", correct: false },
    ]);
  });

  it("treats unanswered questions as incorrect", () => {
    const results = buildQuestionResults(questions, [null, null, null]);
    expect(results.every((r) => r.correct === false)).toBe(true);
  });
});
