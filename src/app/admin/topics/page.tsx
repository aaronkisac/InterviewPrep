import { redirect } from "next/navigation";
import { Lock } from "lucide-react";

import { auth } from "@/lib/auth";
import { listSystemTopics } from "@/lib/actions/admin-topics";
import { NewTopicForm } from "./_components/topic-form";
import { DeleteTopicButton } from "./_components/delete-topic-button";
import { JsonImportAdmin } from "./_components/json-import-admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Topics" };

export default async function AdminTopicsPage() {
  const session = await auth().catch(() => null);
  if (!session?.user?.id || session.user.role !== "admin") redirect("/");

  const topics = await listSystemTopics();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10 space-y-8">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Admin</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Topics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage system topics and bulk-import questions via JSON.
        </p>
      </div>

      <NewTopicForm />

      <section>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          All topics ({topics.length})
        </h2>
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
                        <Lock className="size-2.5" /> builtin
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    {topic.slug} · {topic.question_count} questions
                  </p>
                </div>

                <JsonImportAdmin topicSlug={topic.slug} topicName={topic.name} />

                {!topic.is_builtin && <DeleteTopicButton slug={topic.slug} />}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
