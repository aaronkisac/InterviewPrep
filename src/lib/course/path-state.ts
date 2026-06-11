// Course path state derivation — pure, no server dependencies.
// Lock/active/done states are ALWAYS derived from completion records,
// never stored (see .docs/learning-map-spec.md).

export type LessonMeta = {
  id: string;
  position: number;
};

export type UnitMeta = {
  id: string;
  position: number;
  lessons: LessonMeta[];
};

export type LessonNodeStatus = "locked" | "active" | "done";
export type UnitNodeStatus = "locked" | "in_progress" | "done";

export type LessonNode = {
  id: string;
  status: LessonNodeStatus;
};

export type UnitNode = {
  id: string;
  status: UnitNodeStatus;
  /** 0–100, completed lessons over total lessons. */
  completedPct: number;
  lessons: LessonNode[];
};

export type CoursePathState = {
  units: UnitNode[];
  /** The single next lesson to do, or null when the course is finished. */
  activeLessonId: string | null;
};

/**
 * Derive node states for a course.
 *
 * Rules:
 * - Units and lessons progress strictly in `position` order.
 * - Unit N unlocks when every lesson of unit N−1 is completed.
 * - Within an unlocked unit, the first uncompleted lesson is `active`;
 *   later uncompleted lessons are `locked`.
 * - Exactly one lesson is `active` across the whole course (none if done).
 * - Completed lessons are `done` (and stay replayable in the UI).
 */
export function deriveCoursePath(
  units: UnitMeta[],
  completedLessonIds: ReadonlySet<string>,
): CoursePathState {
  const sortedUnits = [...units].sort((a, b) => a.position - b.position);

  let previousUnitsDone = true;
  let activeLessonId: string | null = null;

  const unitNodes: UnitNode[] = sortedUnits.map((unit) => {
    const sortedLessons = [...unit.lessons].sort(
      (a, b) => a.position - b.position,
    );
    const unitUnlocked = previousUnitsDone;

    let previousLessonsDone = true;
    const lessonNodes: LessonNode[] = sortedLessons.map((lesson) => {
      const done = completedLessonIds.has(lesson.id);
      let status: LessonNodeStatus;
      if (done) {
        status = "done";
      } else if (
        unitUnlocked &&
        previousLessonsDone &&
        activeLessonId === null
      ) {
        status = "active";
        activeLessonId = lesson.id;
      } else {
        status = "locked";
      }
      previousLessonsDone = previousLessonsDone && done;
      return { id: lesson.id, status };
    });

    const doneCount = lessonNodes.filter((l) => l.status === "done").length;
    const total = lessonNodes.length;
    const unitDone = total > 0 && doneCount === total;

    const status: UnitNodeStatus = unitDone
      ? "done"
      : unitUnlocked
        ? "in_progress"
        : "locked";

    previousUnitsDone = previousUnitsDone && unitDone;

    return {
      id: unit.id,
      status,
      completedPct: total === 0 ? 0 : Math.round((doneCount / total) * 100),
      lessons: lessonNodes,
    };
  });

  return { units: unitNodes, activeLessonId };
}
