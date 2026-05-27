"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteSystemTopic } from "@/lib/actions/admin-topics";

export function DeleteTopicButton({ slug }: { slug: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handle() {
    if (!confirm(`Delete topic "${slug}"? Existing questions will remain but won't be filterable.`)) return;
    startTransition(async () => {
      const result = await deleteSystemTopic(slug);
      if (result.ok) router.refresh();
      else alert(result.error);
    });
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={isPending}
      aria-label="Delete topic"
      className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-40 transition-colors"
    >
      <Trash2 className="size-3.5" />
    </button>
  );
}
