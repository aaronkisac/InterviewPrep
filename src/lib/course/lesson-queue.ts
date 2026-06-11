// Lesson queue — pure reducer for the Duolingo-style finish-to-pass loop.
//
// Steps are queued by index. A wrong answer pushes the step to the back of
// the queue; the lesson ends only when the queue is empty, so finishing
// implies every interactive step was eventually answered correctly.
// Accuracy is measured on FIRST attempts only.

export type LessonQueueState = {
  /** Step indices still to show; head is the current step. */
  pending: number[];
  /** Steps cleared (answered correctly or concept-continued). */
  cleared: number;
  /** First-attempt result per step index (interactive steps only). */
  firstTry: Record<number, boolean>;
};

export function initQueue(stepCount: number): LessonQueueState {
  return {
    pending: Array.from({ length: stepCount }, (_, i) => i),
    cleared: 0,
    firstTry: {},
  };
}

/** Index of the current step, or null when the lesson is finished. */
export function currentStep(state: LessonQueueState): number | null {
  return state.pending[0] ?? null;
}

export function isDone(state: LessonQueueState): boolean {
  return state.pending.length === 0;
}

/**
 * Advance past a non-interactive (concept) step. No result is recorded.
 */
export function continueStep(state: LessonQueueState): LessonQueueState {
  if (state.pending.length === 0) return state;
  return {
    ...state,
    pending: state.pending.slice(1),
    cleared: state.cleared + 1,
  };
}

/**
 * Answer the current interactive step.
 * Correct → step is cleared. Wrong → step moves to the back of the queue.
 * The first attempt per step index is recorded for accuracy.
 */
export function answerStep(
  state: LessonQueueState,
  correct: boolean,
): LessonQueueState {
  const index = state.pending[0];
  if (index === undefined) return state;
  const rest = state.pending.slice(1);

  const firstTry =
    index in state.firstTry
      ? state.firstTry
      : { ...state.firstTry, [index]: correct };

  if (correct) {
    return { pending: rest, cleared: state.cleared + 1, firstTry };
  }
  return { pending: [...rest, index], cleared: state.cleared, firstTry };
}

/**
 * Progress 0–1 for the player's progress bar.
 * Defined as cleared / (cleared + pending): a wrong answer keeps the bar
 * where it is (the step goes to the back of the queue), so the bar only
 * ever moves forward and reaches 1 exactly when the queue empties.
 */
export function progress(state: LessonQueueState): number {
  const total = state.cleared + state.pending.length;
  if (total === 0) return 1;
  return state.cleared / total;
}

/**
 * First-attempt accuracy 0–100 over interactive steps answered so far.
 * Returns 100 for lessons with no interactive steps (pure reading).
 */
export function accuracyPct(state: LessonQueueState): number {
  const attempts = Object.values(state.firstTry);
  if (attempts.length === 0) return 100;
  const correct = attempts.filter(Boolean).length;
  return Math.round((correct / attempts.length) * 100);
}
