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
        : Promise.resolve([] as MockQuestion[]),
      listSystemTopics(),
      customSlugs.length > 0 && userId
        ? getCustomMockQuestions(userId, customSlugs)
        : Promise.resolve([]),
      customSlugs.length > 0 && userId
        ? listCustomTopics(userId).catch(() => [])
        : Promise.resolve([]),
    ]);

  // Convert custom questions to MockQuestion format, respecting level range
  const customMockQuestions: MockQuestion[] = customQuestionsRaw
    .filter((q) => {
      const lvl = q.level ?? 1;
      return lvl >= lo && lvl <= hi;
    })
    .map((q) => {
      const opts = q.mock_options!;
      const level = Math.min(5, Math.max(1, q.level ?? 1)) as Level;
      const levelLabel = LEVELS.find((l) => l.value === level)?.label ?? "Entry";
      const topicSlug = customTopicList.find((t) =>
        t.id === q.topic_id,
      )?.slug ?? q.topic_id;
      return {
        id: q.id,
        topic: `custom:${topicSlug}`,
        level,
        levelLabel,
        question: q.question,
        options: opts.map((o, i) => ({
          id: `${q.id}-opt-${i}`,
          text: o.optionText,
          isCorrect: o.isCorrect,
          explanation: o.explanation ?? "",
        })),
      };
    });

  function shuffle<T>(arr: T[]): T[] {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j]!, out[i]!];
    }
    return out;
  }

  // 80/20 adaptive split: 80% from unseen/wrong, 20% from already mastered
  const allPool = shuffle([...systemQuestions, ...customMockQuestions]);

  const masteredIds = userId
    ? await getMasteredIds(userId, allTopics, "mock")
    : new Set<string>();

  const unseen = allPool.filter((q) => !masteredIds.has(q.id));
  const mastered = allPool.filter((q) => masteredIds.has(q.id));

  const take80 = Math.ceil(length * 0.8);
  const take20 = length - take80;

  const combined = [
    ...unseen.slice(0, take80),
    ...mastered.slice(0, take20),
    ...unseen.slice(take80, take80 + Math.max(0, take20 - mastered.length)),
  ].slice(0, length);

  // Build topic labels
  const topicLabels: Record<string, string> = Object.fromEntries(
    sysTopicList.map((t) => [t.slug, t.name]),
  );
  for (const t of customTopicList) {
    topicLabels[`custom:${t.slug}`] = t.name;
  }

  if (combined.length === 0) {
    return (
      <main className="mx-auto w-full max-w-2xl px-6 py-10">
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No questions matched this session. Try a wider topic or difficulty range.
          </p>
          <Link
            href="/mock"
            className="mt-4 inline-block rounded-md border border-border px-4 py-2 text-sm font-medium transition hover:bg-accent"
          >
            Back to config
          </Link>
        </div>
      </main>
    );
  }

  const sessionKey = `${allTopics.join("-")}-${lo}-${hi}-${length}-${Math.random()
    .toString(36)
    .slice(2)}`;

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10">
      <MockSession key={sessionKey} questions={combined} topicLabels={topicLabels} />
    </main>
  );
}
