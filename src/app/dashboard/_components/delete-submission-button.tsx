"use client";

import { useTransition } from "react";
import { deleteOwnQuestion } from "@/lib/actions/questions";

export function DeleteSubmissionButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Delete this question?")) return;
    startTransition(async () => {
      await deleteOwnQuestion(id);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label="Delete question"
      className="rounded p-1 text-muted-foreground transition hover:text-destructive disabled:opacity-40"
    >
      {isPending ? "…" : "×"}
    </button>
  );
}
