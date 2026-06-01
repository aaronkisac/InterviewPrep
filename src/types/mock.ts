/** Mock option shape for forms, JSON import, and DB storage. */
export type MockOptionInput = {
  optionText: string;
  isCorrect: boolean;
  explanation?: string;
};

export const MOCK_OPTION_COUNT = 4 as const;

export const DEFAULT_MOCK_OPTIONS: MockOptionInput[] = [
  { optionText: "", isCorrect: true, explanation: "" },
  { optionText: "", isCorrect: false, explanation: "" },
  { optionText: "", isCorrect: false, explanation: "" },
  { optionText: "", isCorrect: false, explanation: "" },
];

/** @deprecated Use MockOptionInput — kept for gradual migration. */
export type MockOption = MockOptionInput;
