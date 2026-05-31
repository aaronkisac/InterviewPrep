import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getCustomTopic } from "@/lib/actions/custom-topics";
import { listQuestions } from "@/lib/questions";
import { listSystemTopics } from "@/lib/actions/admin-topics";
import { getMasteredIds } from "@/lib/actions/user-tracking";
import { getLang } from "@/lib/lang";
import { i18nFlashcard } from "@/lib/i18n";
import type { FlashcardQuestion } from "./_components/flashcard-session";
import { FlashcardSession } from "./_components/flashcard-session";

export const dynamic = "force-dynamic";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export default async function FlashcardPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; topics?: string; min?: string; max?: string; len?: string }>;
}) {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) redirect("/signin");

  const params = await searchParams;
  const lang = await getLang();
  const i18n = i18nFlashcard[lang];

  // Support both ?topic= (legacy single-topic) and ?topics= (multi-topic from MockConfigTabs)
  const rawTopics = params.topics
    ? params.topics.split(",").map((t) => t.trim()).filter(Boolean)
    : params.topic
      ? [params.topic.trim()]
      : [];

  if (rawTopics.length === 0) redirect("/mock");

  const minLevel = Math.max(1, Math.min(5, Number(params.min) || 1));
  const maxLevel = Math.max(1, Math.min(5, Number(params.max) || 5));
  const cardLimit = Math.max(1, Number(params.len) || 10);

  const systemSlugs = rawTopics.filter((t) => !t.startsWith("custom:"));
  const customSlugs = rawTopics
    .filter((t) => t.startsWith("custom:"))
    .map((t) => t.slice("custom:".length));

  let allQuestions: FlashcardQuestion[] = [];
  let hasPrivate = false;
  const topicNameParts: string[] = [];

  // Fetch system topics + question sets
  const systemTopicsList = systemSlugs.length > 0 ? await listSystemTopics() : [];
  const systemQuestionSets = await Promise.all(
    systemSlugs.map((slug) => listQuestions({ topic: slug }).catch(() => [])),
  );

  for (let i = 0; i < systemSlugs.length; i++) {
    const slug = systemSlugs[i]!;
    const qs = systemQuestionSets[i]!;
    const name = systemTopicsList.find((t) => t.slug === slug)?.name ?? slug;
    topicNameParts.push(name);
    for (const q of qs) {
      allQuestions.push({
        id: q.id,
        question: q.question,
        answer: q.answer_general ?? "",
        level: q.level ?? 1,
        topic: slug,
        answer_personal: q.answer_personal ?? null,
      });
    }
  }

  // Fetch custom topics sequentially (each needs userId check)
  for (const slug of customSlugs) {
    const data = await getCustomTopic(slug, session.user.id).catch(() => null);
    if (!data || data.questions.length === 0) continue;
    hasPrivate = true;
    topicNameParts.push(data.topic.name);
    for (const q of data.questions) {
      allQuestions.push({
        id: q.id,
        question: q.question,
        answer: q.answer,
        level: q.level ?? 1,
        topic: `custom:${slug}`,
        answer_personal: q.answer_personal,
      });
    }
  }

  // Filter by level range
  allQuestions = allQuestions.filter(
    (q) => q.level >= minLevel && q.level <= maxLevel,
  );

  if (allQuestions.length === 0) redirect("/mock");

  // 80/20 adaptive split
  const shuffled = shuffle(allQuestions);
  const masteredIds = await getMasteredIds(session.user.id, rawTopics, "flashcard");

  const unseen = shuffled.filter((q) => !masteredIds.has(q.id));
  const mastered = shuffled.filter((q) => masteredIds.has(q.id));

  const take80 = Math.ceil(cardLimit * 0.8);
  const take20 = cardLimit - take80;

  const questions = [
    ...unseen.slice(0, take80),
    ...mastered.slice(0, take20),
    ...unseen.slice(take80, take80 + Math.max(0, take20 - mastered.length)),
  ].slice(0, cardLimit);

  // Build header label
  const topicName =
    topicNameParts.length === 1
      ? topicNameParts[0] ?? ""
      : topicNameParts.length <= 3
        ? topicNameParts.join(", ")
        : `${topicNameParts.slice(0, 2).join(", ")} +${topicNameParts.length - 2} more`;

  const isMulti = rawTopics.length > 1;

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-6">
        <p className="text-sm font-medium text-muted-foreground">
          {i18n.pageTitle}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{topicName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {i18n.cards(questions.length)}
          {isMulti && ` · ${i18n.topics(rawTopics.length)}`}
          {hasPrivate && i18n.includesPrivate}
        </p>
      </header>

      <FlashcardSession questions={questions} topicName={topicName} lang={lang} />
    </main>
   );
}
