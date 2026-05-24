"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";

import { toggleBookmark } from "@/lib/actions/user-tracking";
import { cn } from "@/lib/utils";

export function BookmarkButton({
  questionId,
  initialBookmarked,
}: {
  questionId: string;
  initialBookmarked: boolean;
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isPending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation(); // don't toggle the card open
    startTransition(async () => {
      const result = await toggleBookmark(questionId);
      if (result !== null) setBookmarked(result.bookmarked);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={bookmarked ? "Remove bookmark" : "Bookmark question"}
      className={cn(
        "rounded p-1 transition hover:bg-accent disabled:opacity-50",
        bookmarked
          ? "text-amber-500"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Bookmark
        className="size-4"
        fill={bookmarked ? "currentColor" : "none"}
      />
    </button>
  );
}
