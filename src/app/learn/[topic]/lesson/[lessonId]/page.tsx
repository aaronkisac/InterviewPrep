import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getCourseUnits, getLessonBundle } from "@/lib/course-data";
import { getLang } from "@/lib/lang";

import { LessonPlayer } from "./_components/lesson-player";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function LessonPage({
  params,
}: {
  params: Promise<{ topic: string; lessonId: string }>;
}) {
  const { topic, lessonId } = await params;

  const session = await auth().catch(() => null);

  // Guests get a no-login trial limited to the first unit of the course.
  // Any later lesson still redirects to sign-in.
  if (!session?.user?.id) {
    const units = await getCourseUnits(topic);
    const firstUnit = units[0];
    const inFirstUnit =
      !!firstUnit && firstUnit.lessons.some((l) => l.id === lessonId);
    if (!inFirstUnit) redirect("/signin");
  }

  const lang = await getLang();
  const bundle = await getLessonBundle(lessonId);
  if (!bundle || bundle.unit.topicSlug !== topic) notFound();

  return (
    <main className="flex flex-1 flex-col">
      <LessonPlayer
        lesson={{
          id: bundle.id,
          title: bundle.title,
          titleTr: bundle.titleTr,
          topicSlug: bundle.unit.topicSlug,
          steps: bundle.steps,
          challenges: bundle.challenges,
          nextLessonId: bundle.nextLessonId,
        }}
        lang={lang}
        isGuest={!session?.user?.id}
      />
    </main>
  );
}
