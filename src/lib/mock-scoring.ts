import type { MockQuestion } from "@/lib/mock-shared";

export function computeMockScore(
  questions: MockQuestion[],
  selected: ReadonlyArray<string | null>,
): number {
  return questions.reduce((sum, q, i) => {
    const picked = q.options.find((o) => o.id === selected[i]);
    return sum + (picked?.isCorrect ? 1 : 0);
  }, 0);
}

export function buildQuestionResults(
  questions: MockQuestion[],
  selected: ReadonlyArray<string | null>,
): Array<{ questionId: string; topic: string; correct: boolean }> {
  return questions.map((q, i) => ({
    questionId: q.id,
    topic: q.topic,
    correct: q.options.find((o) => o.id === selected[i])?.isCorrect ?? false,
  }));
}
