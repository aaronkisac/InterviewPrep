import { describe, expect, it } from "vitest";

import {
  countBlanks,
  isInteractive,
  validateSeedUnit,
  validateSteps,
  type Step,
} from "@/lib/course/step-schema";

const validSteps: Step[] = [
  {
    type: "concept",
    title: "What is JSX?",
    titleTr: "JSX nedir?",
    body: "JSX is a syntax extension…\n\n```jsx\nconst el = <h1>Hi</h1>;\n```",
    bodyTr: "JSX bir sözdizimi uzantısıdır…",
  },
  {
    type: "mcq",
    prompt: "Which is valid JSX?",
    promptTr: "Hangisi geçerli JSX?",
    options: [
      { text: "<div class>", textTr: "<div class>" },
      { text: "<div className>", textTr: "<div className>", correct: true },
    ],
    explanation: "JSX uses className.",
    explanationTr: "JSX className kullanır.",
  },
  {
    type: "true_false",
    statement: "Components must be capitalized.",
    statementTr: "Bileşen adları büyük harfle başlamalıdır.",
    answer: true,
    explanation: "Lowercase tags are treated as DOM elements.",
    explanationTr: "Küçük harfli etiketler DOM elemanı sayılır.",
  },
  {
    type: "fill_blank",
    prompt: "Complete the component",
    promptTr: "Bileşeni tamamla",
    code: "function App() {\n  return <h1>___</h1>;\n}",
    answers: ["{title}"],
    distractors: ["${title}", "<title>"],
    explanation: "Curly braces embed expressions.",
    explanationTr: "Süslü parantez ifade gömer.",
  },
  {
    type: "output_predict",
    prompt: "What renders?",
    promptTr: "Ne render edilir?",
    code: "const x = <p>{0 && 'hi'}</p>;",
    options: [
      { text: "<p>0</p>", textTr: "<p>0</p>", correct: true },
      { text: "<p></p>", textTr: "<p></p>" },
    ],
    explanation: "0 is rendered by JSX.",
    explanationTr: "0, JSX tarafından render edilir.",
  },
  {
    type: "order",
    prompt: "Order the render phases",
    promptTr: "Render aşamalarını sırala",
    items: [
      { text: "Trigger", textTr: "Tetikleme" },
      { text: "Render", textTr: "Render" },
      { text: "Commit", textTr: "Commit" },
    ],
    explanation: "Trigger → render → commit.",
    explanationTr: "Tetikleme → render → commit.",
  },
  {
    type: "match",
    prompt: "Match hook to purpose",
    promptTr: "Hook'u amacıyla eşleştir",
    pairs: [
      { left: "useState", leftTr: "useState", right: "state", rightTr: "state" },
      { left: "useEffect", leftTr: "useEffect", right: "side effects", rightTr: "yan etkiler" },
      { left: "useRef", leftTr: "useRef", right: "mutable box", rightTr: "değişebilir kutu" },
    ],
  },
  {
    type: "challenge",
    question: "What is JSX?",
  },
];

describe("validateSteps", () => {
  it("accepts every step type", () => {
    const result = validateSteps(validSteps);
    expect(result.ok).toBe(true);
  });

  it("rejects an empty array", () => {
    expect(validateSteps([]).ok).toBe(false);
  });

  it("rejects unknown step types with a path", () => {
    const result = validateSteps([{ type: "video" }]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]).toContain("steps[0]");
      expect(result.errors[0]).toContain("type");
    }
  });

  it("requires exactly one correct option", () => {
    const bad = {
      ...validSteps[1],
      options: [
        { text: "a", textTr: "a", correct: true },
        { text: "b", textTr: "b", correct: true },
      ],
    };
    const result = validateSteps([bad]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.includes("exactly 1 correct"))).toBe(
        true,
      );
    }
  });

  it("requires answers to match blank count in fill_blank", () => {
    const bad = { ...validSteps[3], code: "___ and ___", answers: ["one"] };
    const result = validateSteps([bad]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.includes("blank"))).toBe(true);
    }
  });

  it("requires TR fields", () => {
    const bad = { ...validSteps[0], bodyTr: "" };
    const result = validateSteps([bad]);
    expect(result.ok).toBe(false);
  });

  it("collects multiple errors in one pass", () => {
    const result = validateSteps([{ type: "mcq" }, { type: "concept" }]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.length).toBeGreaterThan(2);
    }
  });
});

describe("validateSeedUnit", () => {
  const unit = {
    topic: "react",
    slug: "components-jsx",
    title: "Components & JSX",
    titleTr: "Bileşenler ve JSX",
    section: "foundations",
    position: 1,
    lessons: [
      {
        slug: "what-is-jsx",
        title: "What is JSX?",
        titleTr: "JSX nedir?",
        position: 1,
        steps: validSteps,
      },
    ],
  };

  it("accepts a valid unit file", () => {
    expect(validateSeedUnit(unit).ok).toBe(true);
  });

  it("rejects an invalid section", () => {
    const result = validateSeedUnit({ ...unit, section: "basics" });
    expect(result.ok).toBe(false);
  });

  it("rejects duplicate lesson slugs and positions", () => {
    const result = validateSeedUnit({
      ...unit,
      lessons: [unit.lessons[0], { ...unit.lessons[0] }],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.includes("duplicate slug"))).toBe(true);
      expect(result.errors.some((e) => e.includes("duplicate position"))).toBe(
        true,
      );
    }
  });

  it("surfaces step errors with their lesson path", () => {
    const result = validateSeedUnit({
      ...unit,
      lessons: [{ ...unit.lessons[0], steps: [{ type: "mcq" }] }],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.includes("lessons[0].steps[0]"))).toBe(
        true,
      );
    }
  });
});

describe("helpers", () => {
  it("countBlanks counts ___ markers", () => {
    expect(countBlanks("a ___ b ___")).toBe(2);
    expect(countBlanks("none")).toBe(0);
  });

  it("isInteractive is false only for concept steps", () => {
    expect(isInteractive(validSteps[0]!)).toBe(false);
    for (const step of validSteps.slice(1)) {
      expect(isInteractive(step)).toBe(true);
    }
  });
});
