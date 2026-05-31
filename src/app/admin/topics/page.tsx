import { redirect } from "next/navigation";
import { Lock } from "lucide-react";

import { auth } from "@/lib/auth";
import { listSystemTopics } from "@/lib/actions/admin-topics";
import { listCustomTopics } from "@/lib/actions/custom-topics";
import { getLang } from "@/lib/lang";
import { i18nAdmin } from "@/lib/i18n";
import { NewTopicForm } from "./_components/topic-form";
import { DeleteTopicButton } from "./_components/delete-topic-button";
import { JsonImportAdmin } from "./_components/json-import-admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Topics" };

export default async function AdminTopicsPage() {
  const lang = await getLang();
  const i18n = i18nAdmin[lang];
  const session = await auth().catch(() => null);
  if (!session?.user?.id || (session.user.role !== "admin" && session.user.role !== "super_admin")) redirect("/");

  const [topics, myTopics] = await Promise.all([
    listSystemTopics(),
    listCustomTopics(session.user.id).catch(() => []),
  ]);

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Admin</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{i18n.topicsTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{i18n.topicsSub}</p>
      </div>

      <NewTopicForm lang={lang} />

      <section>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">{i18n.allTopics(topics.length)}</h2>
        <div className="space-y-2">
          {topics.map((topic) => (
            <div
              key={topic.slug}
              className="rounded-lg border border-border bg-card"
            >
              {/* Topic header row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{topic.name}</span>
                    {topic.is_builtin && (
                      <span className="flex items-center gap-0.5 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        <Lock className="size-2.5" /> {i18n.builtin}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    {topic.slug} · {topic.question_count} {i18n.questions}
                  </p>
                </div>

                <JsonImportAdmin topicSlug={topic.slug} topicName={topic.name} lang={lang} />

                {!topic.is_builtin && <DeleteTopicButton slug={topic.slug} />}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── My Topics (private) ── */}
      {myTopics.length > 0 && (
        <section>
          <h2 className="mb-1 text-sm font-medium text-muted-foreground">
            {i18n.myTopics(myTopics.length)}
          </h2>
          <p className="mb-3 text-xs text-muted-foreground">
            {i18n.myTopicsSub}
          </p>
          <div className="space-y-2">
            {myTopics.map((topic) => (
              <div
                key={topic.id}
                className="rounded-lg border border-violet-500/20 bg-violet-50/30 dark:bg-violet-950/10"
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Lock className="size-3 shrink-0 text-violet-500" />
                      <span className="font-medium">{topic.name}</span>
                    </div>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                      {topic.slug} · {topic.question_count} {i18n.questions}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
