import Link from "next/link";

import { auth } from "@/lib/auth";
import {
  getMockSessionQuestions,
  parseLevelOr,
  parseSessionLength,
  parseTopicList,
} from "@/lib/mock";
import { listSystemTopics } from "@/lib/actions/admin-topics";
import { getCustomMockQuestions, listCustomTopics } from "@/lib/actions/custom-topics";
import { getMasteredIds } from "@/lib/actions/user-tracking";
import { LEVELS } from "@/lib/topics";
import type { MockQuestion, Level } from "@/lib/mock-shared";

import { MockSession } from "./_components/mock-session";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  topics?: string;
  min?: string;
  max?: string;
  len?: string;
}>;

export default async function MockSessionPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const allTopics = parseTopicList(params.topics);
  const minLevel = parseLevelOr(params.min, 1);
  const maxLevel = parseLevelOr(params.max, 5);
  const length = parseSessionLength(params.len);

  const lo = minLevel <= maxLevel ? minLevel : maxLevel;
  const hi = minLevel <= maxLevel ? maxLevel : minLevel;

  // Split system vs custom topics
  const systemTopics = allTopics.filter((t) => !t.startsWith("custom:"));
  const customSlugs = allTopics
    .filter((t) => t.startsWith("custom:"))
    .map((t) => t.slice("custom:".length));

  if (allTopics.length === 0) {
    return (
      <main className="mx-auto w-full max-w-2xl px-6 py-10">
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">No questions matched this session</p>
          <Link href="/mock" className="mt-4 inline-block rounded-md border border-border px-4 py-2 text-sm font-medium transition hover:bg-accent">
            Back to config
          </Link>
        </div>
      </main>
    );
  }

  // Auth (always needed now for mastery lookup)
  const session = await auth().catch(() => null);
  const userId = session?.user?.id;

  const [systemQuestions, sysTopicList, customQuestionsRaw, customTopicList] =
    await Promise.all([
      systemTopics.length > 0
        // Fetch all matching questions (no length limit yet — we need the full pool for 80/20)
        ? getMockSessionQuestions({ topics: systemTopics, minLevel: lo, maxLevel: hi, length: 9999 })
  