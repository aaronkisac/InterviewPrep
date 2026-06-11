// Pure Leitner-box scheduling — no server dependencies, unit-testable.

/** Review intervals in days, indexed by box (1–5). Box 1 = due immediately. */
export const BOX_INTERVAL_DAYS: Record<number, number> = {
  1: 0,
  2: 1,
  3: 3,
  4: 7,
  5: 21,
};

export const MAX_BOX = 5;

/**
 * Next box after an answer: correct promotes one box (capped at MAX_BOX),
 * wrong demotes straight to box 1. `current` is undefined for first sight.
 */
export function nextBox(current: number | undefined, correct: boolean): number {
  if (!correct) return 1;
  return Math.min((current ?? 0) + 1, MAX_BOX);
}

/** ISO timestamp when a question in `box` should resurface. */
export function nextDueAt(box: number, from: Date): string {
  const days = BOX_INTERVAL_DAYS[box] ?? 0;
  return new Date(from.getTime() + days * 86_400_000).toISOString();
}
