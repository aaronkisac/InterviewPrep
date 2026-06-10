import { describe, expect, it } from "vitest";

import {
  parseJsonArray,
  parseMockOptionsInput,
  validateAdminImportJson,
  validateMockOptionsInput,
  validateUserImportJson,
} from "@/lib/validation/question-import";

const validOptions = [
  { optionText: "A", isCorrect: true, explanation: "why" },
  { optionText: "B", isCorrect: false },
  { optionText: "C", isCorrect: false },
  { optionText: "D", isCorrect: false },
];

describe("parseJsonArray", () => {
  it("parses a JSON array", () => {
    expect(parseJsonArray("[1,2]")).toEqual({ data: [1, 2] });
  });

  it("rejects invalid JSON", () => {
    expect(parseJsonArray("{nope").error).toMatch(/Invalid JSON/);
  });

  it("rejects non-array JSON", () => {
    expect(parseJsonArray('{"a":1}').error).toMatch(/array/);
  });
});

describe("validateMockOptionsInput", () => {
  it("accepts exactly 4 options with exactly 1 correct", () => {
    expect(validateMockOptionsInput(validOptions)).toBeNull();
  });

  it("rejects wrong option counts", () => {
    expect(validateMockOptionsInput(validOptions.slice(0, 3))).toMatch(/4/);
    expect(validateMockOptionsInput([...validOptions, validOptions[1]])).toMatch(/4/);
  });

  it("rejects zero or multiple correct answers", () => {
    const noCorrect = validOptions.map((o) => ({ ...o, isCorrect: false }));
    const twoCorrect = validOptions.map((o) => ({ ...o, isCorrect: true }));
    expect(validateMockOptionsInput(noCorrect)).toMatch(/1 correct/);
    expect(validateMockOptionsInput(twoCorrect.slice(0, 4))).toMatch(/1 correct/);
  });

  it("rejects empty option text", () => {
    const blank = [{ ...validOptions[0] }, ...validOptions.slice(1)];
    blank[1] = { ...blank[1], optionText: "   " };
    expect(validateMockOptionsInput(blank)).toMatch(/optionText/);
  });

  it("rejects non-array input", () => {
    expect(validateMockOptionsInput("nope")).toMatch(/array/);
  });
});

describe("parseMockOptionsInput", () => {
  it("trims text and normalizes the shape", () => {
    const parsed = parseMockOptionsInput([
      { optionText: "  A  ", isCorrect: true, explanation: " why " },
      ...validOptions.slice(1),
    ]);
    expect(parsed?.[0]).toEqual({
      optionText: "A",
      isCorrect: true,
      explanation: "why",
    });
  });

  it("returns undefined for invalid input", () => {
    expect(parseMockOptionsInput(validOptions.slice(0, 2))).toBeUndefined();
  });
});

describe("validateUserImportJson", () => {
  it("accepts a minimal question and defaults level to 1", () => {
    const res = validateUserImportJson('[{"question":"What is JSX?"}]');
    expect(res.parsed?.valid).toHaveLength(1);
    expect(res.parsed?.valid[0]).toMatchObject({
      question: "What is JSX?",
      answer: "",
      level: 1,
    });
  });

  it("rejects entries without a question", () => {
    const res = validateUserImportJson('[{"answer":"orphan"}]');
    expect(res.parsed?.valid).toHaveLength(0);
    expect(res.parsed?.invalid[0]).toMatchObject({ index: 1 });
  });

  it("flags invalid mock_options instead of silently dropping them", () => {
    const res = validateUserImportJson(
      JSON.stringify([{ question: "Q", mock_options: [{ optionText: "only one" }] }]),
    );
    expect(res.parsed?.valid).toHaveLength(0);
    expect(res.parsed?.invalid[0]?.reason).toMatch(/mock_options/);
  });

  it("propagates JSON syntax errors", () => {
    expect(validateUserImportJson("not json").error).toBeDefined();
  });
});

describe("validateAdminImportJson", () => {
  it("requires question, level and answerGeneral", () => {
    const res = validateAdminImportJson('[{"question":"Q"}]');
    expect(res.parsed?.valid).toHaveLength(0);
    const reasons = res.parsed?.invalid[0]?.reasons ?? [];
    expect(reasons.join(" ")).toMatch(/level/);
    expect(reasons.join(" ")).toMatch(/answerGeneral/);
  });

  it("collects all reasons for one entry", () => {
    const res = validateAdminImportJson('[{"level":99}]');
    expect(res.parsed?.invalid[0]?.reasons.length).toBeGreaterThanOrEqual(2);
  });

  it("accepts a fully specified entry with mock options", () => {
    const res = validateAdminImportJson(
      JSON.stringify([
        {
          question: "Q",
          level: 3,
          answerGeneral: "A",
          topic: "react",
          mock_options: validOptions,
        },
      ]),
    );
    expect(res.parsed?.valid).toHaveLength(1);
    expect(res.parsed?.valid[0]?.mock_options).toHaveLength(4);
  });
});
