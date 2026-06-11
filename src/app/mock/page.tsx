import { auth } from "@/lib/auth";
import { getMockReadyMeta } from "@/lib/mock";
import { listSystemTopics } from "@/lib/actions/admin-topics";
import { listCustomTopics, getCustomMockReadyMeta } from "@/lib/actions/custom-topics";
import { getTopicMasteryStats } from "@/lib/actions/user-tracking";
import { getLang } from "@/lib/lang";
import { i18nMock } from "@/lib/i18n";
import type { MockReadyMeta } from "@/lib/mock-shared";

import { MockConfigTabs, type TopicEntry, type TopicStats } from "./_components/mock-config-tabs";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mock interview",
  robots: { index: false, follow: false },
};

export default async function MockPage() {
  const session = await auth().catch(() => null);
  const userId = session?.user?.id;
  const lang = await getLang();

  const [systemMeta, systemTopics, customTopics, customMockMeta] = await Promise.all([
    getMockReadyMeta(),
    listSystemTopics(),
    userId ? listCustomTopics(userId).catch(() => []) : Promise.resolve([]),
    userId ? getCustomMockReadyMeta(userId).catch(() => []) : Promise.resolve([]),
  ]);

  // Combine system + custom mock-ready meta
  const meta: MockReadyMeta[] = [
    ...systemMeta,
    ...(customMockMeta as MockReadyMeta[]),
  ];

  // Topic labels map for display
  const topicLabels: Record<string, string> = Object.fromEntries(
    systemTopics.map((t) => [t.slug, t.name]),
  );
  for (const t of customTopics) {
    topicLabels[`custom:${t.slug}`] = t.name;
  }

  // Mock tab: system topics that have mock-ready questions
  const systemSlugsWithMock = new Set(
    systemMeta.map((m) => m.topic).filter((s) => !s.startsWith("custom:")),
  );
  const mockSystemTopics: TopicEntry[] = systemTopics
    .filter((t) => systemSlugsWithMock.has(t.slug))
    .map((t) => ({ key: t.slug, name: t.name }));

  // Mock tab: custom topics that have mock-ready questions
  const mockCustomTopics: TopicEntry[] = customTopics
    .filter((t) => (t.mock_question_count ?? 0) > 0)
    .map((t) => ({ key: `custom:${t.slug}`, name: t.name, isPrivate: true }));

  const mockTopics: TopicEntry[] = [...mockSystemTopics, ...mockCustomTopics];

  // Flashcard tab: ALL system topics + all custom topics with any questions
  const flashSystemTopics: TopicEntry[] = systemTopics.map((t) => ({
    key: t.slug,
    name: t.name,
    total: t.question_count,
  }));
  const flashCustomTopics: TopicEntry[] = customTopics
    .filter((t) => t.question_count > 0)
    .map((t) => ({ key: `custom:${t.slug}`, name: t.name, isPrivate: true, total: t.question_count }));

  const flashcardTopics: TopicEntry[] = [...flashSystemTopics, ...flashCustomTopics];

  // Topic mastery stats for chip display ("CSS 12/22")
  const allTopicKeys = [
    ...mockTopics.map((t) => t.key),
    ...flashcardTopics.map((t) => t.key),
  ];
  const uniqueTopicKeys = [...new Set(allTopicKeys)];

  const [mockMasteryStats, flashMasteryStats] = userId
    ? await Promise.all([
        getTopicMasteryStats(userId, uniqueTopicKeys, "mock"),
        getTopicMasteryStats(userId, uniqueTopicKeys, "flashcard"),
      ])
    : [{}  as Record<string, number>, {} as Record<string, number>];

  const topicStats: TopicStats = {
    mock: mockMasteryStats,
    flashcard: flashMasteryStats,
  };

  const i18n = i18nMock[lang];

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <header>
        <p className="text-sm font-medium text-muted-foreground">
          {i18n.practice}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{i18n.pageTitle}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {i18n.subtitle}
        </p>
      </header>
      <MockConfigTabs
        mockMeta={meta}
        mockTopics={mockTopics}
        flashcardTopics={flashcardTopics}
        topicLabels={topicLabels}
        topicStats={topicStats}
        lang={lang}
      />
    </main>
  );
}
