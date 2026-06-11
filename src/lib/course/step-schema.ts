// Course step schema — types + dependency-free runtime validator.
// Used by the seed importer (validate authored JSON) and the lesson player
// (full type safety over lessons.steps JSONB).
//
// Authoring notes:
// - EN/TR fields live side by side (`prompt` / `promptTr`), same as questions.
// - Markdown bodies may contain fenced code blocks — rendered client-side via
//   the existing react-markdown + rehype-highlight pipeline.
// - `challenge` steps reference a bank question by exact question text; the
//   seed importer resolves it to a UUID and writes `questionId` into the
//   stored JSON (mock-options seeder pattern).
// - `fill_blank` marks blanks in `code` with `___` (three underscores);
//   `answers[i]` fills the i-th blank.

export type ConceptStep = {
  type: "concept";
  title: string;
  titleTr: string;
  /** Markdown; may include fenced code blocks. */
  body: string;
  bodyTr: string;
  /** Optional named diagram component (src/components/course/visuals). */
  visual?: string;
};

export type StepOption = {
  text: string;
  textTr: string;
  correct?: boolean;
};

export type McqStep = {
  type: "mcq";
  prompt: string;
  promptTr: string;
  /** Optional code snippet shown above the options. */
  code?: string;
  options: StepOption[]; // 2–5, exactly 1 correct
  explanation: string;
  explanationTr: string;
};

export type TrueFalseStep = {
  type: "true_false";
  statement: string;
  statementTr: string;
  code?: string;
  answer: boolean;
  explanation: string;
  explanationTr: string;
};

export type FillBlankStep = {
  type: "fill_blank";
  prompt: string;
  promptTr: string;
  /** Code with `___` markers; answers fill blanks in order. */
  code: string;
  answers: string[];
  /** Extra wrong tokens mixed into the word bank. */
  distractors: string[];
  explanation: string;
  explanationTr: string;
};

export type OutputPredictStep = {
  type: "output_predict";
  prompt: string;
  promptTr: string;
  code: string; // required — "what does this print/render?"
  options: StepOption[]; // 2–5, exactly 1 correct
  explanation: string;
  explanationTr: string;
};

export type OrderStep = {
  type: "order";
  prompt: string;
  promptTr: string;
  /** Items in CORRECT order; the player shuffles for display. */
  items: Array<{ text: string; textTr: string }>; // 3–6
  explanation: string;
  explanationTr: string;
};

export type MatchStep = {
  type: "match";
  prompt: string;
  promptTr: string;
  pairs: Array<{
    left: string;
    leftTr: string;
    right: string;
    rightTr: string;
  }>; // 3–5
};

export type ChallengeStep = {
  type: "challenge";
  /** Exact question text from the bank (topic comes from the unit file). */
  question: string;
  /** Resolved by the seed importer; present in stored JSON, not in authoring. */
  questionId?: string;
};

export type Step =
  | ConceptStep
  | McqStep
  | TrueFalseStep
  | FillBlankStep
  | OutputPredictStep
  | OrderStep
  | MatchStep
  | ChallengeStep;

export type StepType = Step["type"];

export const STEP_TYPES: readonly StepType[] = [
  "concept",
  "mcq",
  "true_false",
  "fill_blank",
  "output_predict",
  "order",
  "match",
  "challenge",
];

/** Steps the user answers (everything except concept cards). */
export function isInteractive(step: Step): boolean {
  return step.type !== "concept";
}

// ---------------------------------------------------------------------------
// Unit seed file shape (data/seed-courses/<topic>/<unit-slug>.json)
// ---------------------------------------------------------------------------

export type SeedLesson = {
  slug: string;
  title: string;
  titleTr: string;
  position: number;
  steps: Step[];
};

export type SeedUnit = {
  topic: string;
  slug: string;
  title: string;
  titleTr: string;
  section: "foundations" | "core" | "advanced" | "interview";
  position: number;
  lessons: SeedLesson[];
};

export const UNIT_SECTIONS = [
  "foundations",
  "core",
  "advanced",
  "interview",
] as const;

// ---------------------------------------------------------------------------
// Validator — dependency-free, returns every error with a JSON path.
// ---------------------------------------------------------------------------

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: string[] };

type Ctx = { path: string; errors: string[] };

function fail(ctx: Ctx, msg: string): void {
  ctx.errors.push(`${ctx.path}: ${msg}`);
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function reqString(ctx: Ctx, obj: Record<string, unknown>, key: string): void {
  const v = obj[key];
  if (typeof v !== "string" || v.trim() === "") {
    fail(ctx, `"${key}" must be a non-empty string`);
  }
}

function optString(ctx: Ctx, obj: Record<string, unknown>, key: string): void {
  const v = obj[key];
  if (v !== undefined && (typeof v !== "string" || v.trim() === "")) {
    fail(ctx, `"${key}" must be a non-empty string when present`);
  }
}

function validateOptions(ctx: Ctx, v: unknown): void {
  if (!Array.isArray(v) || v.length < 2 || v.length > 5) {
    fail(ctx, `"options" must be an array of 2–5 items`);
    return;
  }
  let correct = 0;
  v.forEach((opt, i) => {
    const optCtx = { ...ctx, path: `${ctx.path}.options[${i}]` };
    if (!isRecord(opt)) {
      fail(optCtx, "must be an object");
      return;
    }
    reqString(optCtx, opt, "text");
    reqString(optCtx, opt, "textTr");
    if (opt.correct !== undefined && typeof opt.correct !== "boolean") {
      fail(optCtx, `"correct" must be a boolean when present`);
    }
    if (opt.correct === true) correct += 1;
  });
  if (correct !== 1) {
    fail(ctx, `"options" must have exactly 1 correct item (found ${correct})`);
  }
}

/** Count `___` blank markers in a fill_blank code snippet. */
export function countBlanks(code: string): number {
  return (code.match(/___/g) ?? []).length;
}

function validateStep(step: unknown, path: string, errors: string[]): void {
  const ctx: Ctx = { path, errors };
  if (!isRecord(step)) {
    fail(ctx, "must be an object");
    return;
  }
  const type = step.type;
  if (typeof type !== "string" || !STEP_TYPES.includes(type as StepType)) {
    fail(ctx, `"type" must be one of: ${STEP_TYPES.join(", ")}`);
    return;
  }

  switch (type as StepType) {
    case "concept": {
      reqString(ctx, step, "title");
      reqString(ctx, step, "titleTr");
      reqString(ctx, step, "body");
      reqString(ctx, step, "bodyTr");
      optString(ctx, step, "visual");
      break;
    }
    case "mcq": {
      reqString(ctx, step, "prompt");
      reqString(ctx, step, "promptTr");
      optString(ctx, step, "code");
      validateOptions(ctx, step.options);
      reqString(ctx, step, "explanation");
      reqString(ctx, step, "explanationTr");
      break;
    }
    case "true_false": {
      reqString(ctx, step, "statement");
      reqString(ctx, step, "statementTr");
      optString(ctx, step, "code");
      if (typeof step.answer !== "boolean") {
        fail(ctx, `"answer" must be a boolean`);
      }
      reqString(ctx, step, "explanation");
      reqString(ctx, step, "explanationTr");
      break;
    }
    case "fill_blank": {
      reqString(ctx, step, "prompt");
      reqString(ctx, step, "promptTr");
      reqString(ctx, step, "code");
      reqString(ctx, step, "explanation");
      reqString(ctx, step, "explanationTr");
      const answers = step.answers;
      const distractors = step.distractors;
      if (
        !Array.isArray(answers) ||
        answers.length === 0 ||
        answers.some((a) => typeof a !== "string" || a.trim() === "")
      ) {
        fail(ctx, `"answers" must be a non-empty array of non-empty strings`);
      }
      if (
        !Array.isArray(distractors) ||
        distractors.some((d) => typeof d !== "string" || d.trim() === "")
      ) {
        fail(ctx, `"distractors" must be an array of non-empty strings`);
      }
      if (
        typeof step.code === "string" &&
        Array.isArray(answers) &&
        countBlanks(step.code) !== answers.length
      ) {
        fail(
          ctx,
          `"code" has ${countBlanks(step.code)} blank(s) but "answers" has ${answers.length}`,
        );
      }
      break;
    }
    case "output_predict": {
      reqString(ctx, step, "prompt");
      reqString(ctx, step, "promptTr");
      reqString(ctx, step, "code");
      validateOptions(ctx, step.options);
      reqString(ctx, step, "explanation");
      reqString(ctx, step, "explanationTr");
      break;
    }
    case "order": {
      reqString(ctx, step, "prompt");
      reqString(ctx, step, "promptTr");
      reqString(ctx, step, "explanation");
      reqString(ctx, step, "explanationTr");
      const items = step.items;
      if (!Array.isArray(items) || items.length < 3 || items.length > 6) {
        fail(ctx, `"items" must be an array of 3–6 items`);
      } else {
        items.forEach((item, i) => {
          const itemCtx = { ...ctx, path: `${path}.items[${i}]` };
          if (!isRecord(item)) {
            fail(itemCtx, "must be an object");
            return;
          }
          reqString(itemCtx, item, "text");
          reqString(itemCtx, item, "textTr");
        });
      }
      break;
    }
    case "match": {
      reqString(ctx, step, "prompt");
      reqString(ctx, step, "promptTr");
      const pairs = step.pairs;
      if (!Array.isArray(pairs) || pairs.length < 3 || pairs.length > 5) {
        fail(ctx, `"pairs" must be an array of 3–5 items`);
      } else {
        pairs.forEach((pair, i) => {
          const pairCtx = { ...ctx, path: `${path}.pairs[${i}]` };
          if (!isRecord(pair)) {
            fail(pairCtx, "must be an object");
            return;
          }
          reqString(pairCtx, pair, "left");
          reqString(pairCtx, pair, "leftTr");
          reqString(pairCtx, pair, "right");
          reqString(pairCtx, pair, "rightTr");
        });
      }
      break;
    }
    case "challenge": {
      reqString(ctx, step, "question");
      optString(ctx, step, "questionId");
      break;
    }
  }
}

export function validateSteps(
  steps: unknown,
  path = "steps",
): ValidationResult<Step[]> {
  const errors: string[] = [];
  if (!Array.isArray(steps) || steps.length === 0) {
    return { ok: false, errors: [`${path}: must be a non-empty array`] };
  }
  steps.forEach((step, i) => validateStep(step, `${path}[${i}]`, errors));
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, value: steps as Step[] };
}

export function validateSeedUnit(input: unknown): ValidationResult<SeedUnit> {
  const errors: string[] = [];
  const ctx: Ctx = { path: "unit", errors };
  if (!isRecord(input)) {
    return { ok: false, errors: ["unit: must be an object"] };
  }
  reqString(ctx, input, "topic");
  reqString(ctx, input, "slug");
  reqString(ctx, input, "title");
  reqString(ctx, input, "titleTr");
  if (
    typeof input.section !== "string" ||
    !(UNIT_SECTIONS as readonly string[]).includes(input.section)
  ) {
    fail(ctx, `"section" must be one of: ${UNIT_SECTIONS.join(", ")}`);
  }
  if (!Number.isInteger(input.position) || (input.position as number) < 1) {
    fail(ctx, `"position" must be a positive integer`);
  }

  const lessons = input.lessons;
  if (!Array.isArray(lessons) || lessons.length === 0) {
    fail(ctx, `"lessons" must be a non-empty array`);
  } else {
    const seenSlugs = new Set<string>();
    const seenPositions = new Set<number>();
    lessons.forEach((lesson, i) => {
      const lessonCtx: Ctx = { path: `unit.lessons[${i}]`, errors };
      if (!isRecord(lesson)) {
        fail(lessonCtx, "must be an object");
        return;
      }
      reqString(lessonCtx, lesson, "slug");
      reqString(lessonCtx, lesson, "title");
      reqString(lessonCtx, lesson, "titleTr");
      if (!Number.isInteger(lesson.position) || (lesson.position as number) < 1) {
        fail(lessonCtx, `"position" must be a positive integer`);
      } else if (seenPositions.has(lesson.position as number)) {
        fail(lessonCtx, `duplicate position ${lesson.position}`);
      } else {
        seenPositions.add(lesson.position as number);
      }
      if (typeof lesson.slug === "string") {
        if (seenSlugs.has(lesson.slug)) {
          fail(lessonCtx, `duplicate slug "${lesson.slug}"`);
        }
        seenSlugs.add(lesson.slug);
      }
      const result = validateSteps(lesson.steps, `unit.lessons[${i}].steps`);
      if (!result.ok) errors.push(...result.errors);
    });
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, value: input as unknown as SeedUnit };
}
