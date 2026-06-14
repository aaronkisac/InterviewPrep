// Guest course progress — persisted in localStorage so a logged-out visitor
// can complete the first unit and keep their place. On first sign-in the
// entries are migrated to the account (see actions/course.ts
// `migrateGuestProgress` + components/guest-progress-migrator.tsx).
//
// Client-only: every function guards `typeof window` so it is safe to import
// from components that also render on the server.

const STORAGE_KEY = "ip:guest-course-progress";

/** One finished lesson, shaped to match the server's RecordLessonResultInput. */
export type GuestLessonResult = {
  lessonId: string;
  /** First-attempt accuracy 0–100. */
  accuracyPct: number;
  /** First-attempt result per challenge question (UUIDs). */
  challenges: Array<{ questionId: string; correct: boolean }>;
  /** ISO timestamp of first completion. */
  completedAt: string;
};

type Store = Record<string, GuestLessonResult>;

function read(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as Store) : {};
  } catch {
    return {};
  }
}

function write(store: Store): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Quota / private-mode — non-critical.
  }
}

/** Lesson ids the guest has completed (drives map lock states). */
export function getGuestCompletedLessonIds(): Set<string> {
  return new Set(Object.keys(read()));
}

/** All stored results, for migration to a fresh account. */
export function getGuestProgressEntries(): GuestLessonResult[] {
  return Object.values(read());
}

/**
 * Record a finished lesson. Keeps the best accuracy and the earliest
 * completion timestamp if the lesson was already done.
 */
export function saveGuestLessonResult(
  input: Omit<GuestLessonResult, "completedAt">,
): void {
  const store = read();
  const existing = store[input.lessonId];
  store[input.lessonId] = {
    lessonId: input.lessonId,
    accuracyPct: Math.max(
      0,
      Math.min(100, Math.round(input.accuracyPct)),
      existing?.accuracyPct ?? 0,
    ),
    challenges: input.challenges,
    completedAt: existing?.completedAt ?? new Date().toISOString(),
  };
  write(store);
}

export function clearGuestProgress(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
