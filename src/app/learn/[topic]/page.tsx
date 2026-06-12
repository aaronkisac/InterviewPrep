import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { getCompletedLessonIds, getCourseUnits } from "@/lib/course-data";
import { deriveCoursePath } from "@/lib/course/path-state";
import { getLang } from "@/lib/lang";
import { listSystemTopics } from "@/lib/actions/admin-topics";

import { CourseMap, type MapUnit } from "./_components/course-map";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Course map — vertical winding path of units and lessons.
 * Guest-visible (read-only: bubbles link to /signin); lock/active/done states
 * are derived per user via path-state, never stored.
 */
export default async function CourseMapPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic } = await params;

  const session = await auth().catch(() => null);
  const lang = await getLang();

  const units = await getCourseUnits(topic);
  if (units.length === 0) notFound();

  const completed = session?.user?.id
    ? await getCompletedLessonIds(session.user.id)
    : new Set<string>();

  const state = deriveCoursePath(
    units.map((u) => ({
      id: u.id,
      position: u.position,
      lessons: u.lessons.map((l) => ({ id: l.id, position: l.position })),
    })),
    completed,
  );
  const stateByUnit = new Map(state.units.map((u) => [u.id, u]));

  const systemTopics = await listSystemTopics();
  const topicName =
    systemTopics.find((t) => t.slug === topic)?.name ?? topic;

  const mapUnits: MapUnit[] = units.map((u) => {
    const unitState = stateByUnit.get(u.id);
    const lessonStates = new Map(
      (unitState?.lessons ?? []).map((l) => [l.id, l.status]),
    );
    return {
      id: u.id,
      title: u.title,
      titleTr: u.titleTr,
      section: u.section,
      status: unitState?.status ?? "locked",
      completedPct: unitState?.completedPct ?? 0,
      lessons: u.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        titleTr: l.titleTr,
        status: lessonStates.get(l.id) ?? "locked",
      })),
    };
  });

  return (
    <main className="mx-auto w-full max-w-xl px-4 sm:px-6 py-10">
      <CourseMap
        topicSlug={topic}
        topicName={topicName}
        units={mapUnits}
        courseDone={state.activeLessonId === null}
        isGuest={!session?.user}
        lang={lang}
      />
    </main>
  );
}
