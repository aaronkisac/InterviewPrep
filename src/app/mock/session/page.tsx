import Link from "next/link";

import {
  getMockSessionQuestions,
  parseLevelOr,
  parseSessionLength,
  parseTopicList,
} from "@/lib/mock";

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
  const topics = parseTopicList(params.topics);
  const minLevel = parseLevelOr(params.min, 1);
  const maxLevel = parseLevelOr(params.max, 5);
  const length = parseSessionLength(params.len);

  // Tolerate a reversed range rather than returning an empty session.
  const lo = minLevel <= maxLevel ? minLevel : maxLevel;
  const hi = minLevel <= maxLevel ? maxLevel : minLevel;

  const questions =
    topics.length === 0
      ? []
      : await getMockSessionQuestions({
          topics,
          minLevel: lo,
          maxLevel: hi,
          length,
        });

  if (questions.length === 0) {
    return (
      <main className="mx-auto w-full max-w-2xl px-6 py-10">
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No questions matched this session. Try a wider topic or difficulty
            range.
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

  // A fresh key on every server render means "Restart" (router.refresh) draws
  // a new set and remounts the session with clean state.
  const sessionKey = `${topics.join("-")}-${lo}-${hi}-${length}-${Math.random()
    .toString(36)
    .slice(2)}`;

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10">
      <MockSession key={sessionKey} questions={questions} />
    </main>
  );
}
