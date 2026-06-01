import {
  MOCK_OPTION_COUNT,
  type MockOptionInput,
} from "@/types/mock";

export type JsonParseResult =
  | { data: unknown[]; error?: never }
  | { error: string; data?: never };

export function parseJsonArray(raw: string): JsonParseResult {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { error: "Invalid JSON — check syntax" };
  }
  if (!Array.isArray(data)) return { error: "Expected a JSON array [ ... ]" };
  return { data };
}

/** Returns a human-readable error or null when valid. */
export function validateMockOptionsInput(opts: unknown): string | null {
  if (!Array.isArray(opts)) return '"mock_options" must be an array';
  if (opts.length !== MOCK_OPTION_COUNT) {
    return `"mock_options" must have exactly ${MOCK_OPTION_COUNT} items`;
  }
  const correctCount = opts.filter(
    (o) => (o as Record<string, unknown>).isCorrect === true,
  ).length;
  if (correctCount !== 1) {
    return '"mock_options" must have exactly 1 correct answer';
  }
  for (const o of opts) {
    const opt = o as Record<string, unknown>;
    if (
      !opt.optionText ||
      typeof opt.optionText !== "string" ||
      !(opt.optionText as string).trim()
    ) {
      return 'Each option needs a non-empty "optionText"';
    }
  }
  return null;
}

/** Parses and normalizes mock_options from raw JSON. Returns undefined when invalid. */
export function parseMockOptionsInput(raw: unknown): MockOptionInput[] | undefined {
  const err = validateMockOptionsInput(raw);
  if (err) return undefined;

  const opts = (raw as Record<string, unknown>[]).map((obj) => ({
    optionText: (obj.optionText as string).trim(),
    isCorrect: Boolean(obj.isCorrect),
    explanation:
      typeof obj.explanation === "string" ? obj.explanation.trim() : undefined,
  }));

  const correctCount = opts.filter((o) => o.isCorrect).length;
  if (correctCount !== 1) return undefined;
  return opts;
}

export type UserImportQuestion = {
  question: string;
  answer: string;
  level: number;
  answer_personal?: string;
  mock_options?: MockOptionInput[];
};

export type UserImportValidation = {
  valid: UserImportQuestion[];
  invalid: Array<{ index: number; reason: string }>;
};

export function validateUserImportJson(raw: string):
  | { parsed: UserImportValidation; error?: never }
  | { error: string; parsed?: never } {
  const parsed = parseJsonArray(raw);
  if (parsed.error || !parsed.data) return { error: parsed.error ?? "Invalid JSON" };

  const valid: UserImportQuestion[] = [];
  const invalid: Array<{ index: number; reason: string }> = [];

  for (let i = 0; i < parsed.data.length; i++) {
    const item = parsed.data[i] as Record<string, unknown>;
    if (
      !item.question ||
      typeof item.question !== "string" ||
      !item.question.trim()
    ) {
      invalid.push({
        index: i + 1,
        reason: '"question" is required (non-empty string)',
      });
      continue;
    }

    const rawLevel = Number(item.level);
    const level = rawLevel >= 1 && rawLevel <= 5 ? rawLevel : 1;

    const mock_options =
      item.mock_options != null
        ? parseMockOptionsInput(item.mock_options)
        : undefined;

    if (item.mock_options != null && mock_options === undefined) {
      invalid.push({
        index: i + 1,
        reason:
          '"mock_options" must be an array of exactly 4 objects with "optionText" and exactly 1 "isCorrect: true"',
      });
      continue;
    }

    valid.push({
      question: item.question.trim(),
      answer: typeof item.answer === "string" ? item.answer.trim() : "",
      level,
      answer_personal:
        typeof item.answer_personal === "string"
          ? item.answer_personal.trim()
          : undefined,
      mock_options,
    });
  }

  return { parsed: { valid, invalid } };
}

export type AdminImportQuestion = {
  question: string;
  level: number;
  answerGeneral: string;
  topic?: string;
  answerGeneralTr?: string;
  answerPersonal?: string;
  answerPersonalTr?: string;
  detailMd?: string;
  detailMdTr?: string;
  mock_options?: MockOptionInput[];
};

export type AdminImportValidation = {
  valid: AdminImportQuestion[];
  invalid: Array<{ index: number; reasons: string[] }>;
};

export function validateAdminImportJson(raw: string):
  | { parsed: AdminImportValidation; error?: never }
  | { error: string; parsed?: never } {
  const parsed = parseJsonArray(raw);
  if (parsed.error || !parsed.data) return { error: parsed.error ?? "Invalid JSON" };

  const valid: AdminImportQuestion[] = [];
  const invalid: Array<{ index: number; reasons: string[] }> = [];

  for (let i = 0; i < parsed.data.length; i++) {
    const item = parsed.data[i] as Record<string, unknown>;
    const reasons: string[] = [];

    if (
      !item.question ||
      typeof item.question !== "string" ||
      !item.question.trim()
    ) {
      reasons.push('"question" is required (non-empty string)');
    }

    const level = Number(item.level);
    if (!item.level || !Number.isInteger(level) || level < 1 || level > 5) {
      reasons.push('"level" is required (integer 1–5)');
    }

    if (
      !item.answerGeneral ||
      typeof item.answerGeneral !== "string" ||
      !item.answerGeneral.trim()
    ) {
      reasons.push('"answerGeneral" is required (non-empty string)');
    }

    if (item.mock_options !== undefined && item.mock_options !== null) {
      const optErr = validateMockOptionsInput(item.mock_options);
      if (optErr) reasons.push(optErr);
    }

    if (reasons.length > 0) {
      invalid.push({ index: i + 1, reasons });
    } else {
      valid.push({
        question: (item.question as string).trim(),
        level,
        answerGeneral: (item.answerGeneral as string).trim(),
        topic: typeof item.topic === "string" ? item.topic.trim() : undefined,
        answerGeneralTr:
          typeof item.answerGeneralTr === "string"
            ? item.answerGeneralTr.trim()
            : undefined,
        answerPersonal:
          typeof item.answerPersonal === "string"
            ? item.answerPersonal.trim()
            : undefined,
        answerPersonalTr:
          typeof item.answerPersonalTr === "string"
            ? item.answerPersonalTr.trim()
            : undefined,
        detailMd:
          typeof item.detailMd === "string" ? item.detailMd.trim() : undefined,
        detailMdTr:
          typeof item.detailMdTr === "string" ? item.detailMdTr.trim() : undefined,
        mock_options:
          item.mock_options != null
            ? parseMockOptionsInput(item.mock_options)
            : undefined,
      });
    }
  }

  return { parsed: { valid, invalid } };
}
