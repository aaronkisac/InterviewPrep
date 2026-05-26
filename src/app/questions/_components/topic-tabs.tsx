"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { TOPICS, TOPIC_LABELS } from "@/lib/topics";
import { cn } from "@/lib/utils";

function Tab({
  label,
  isActive,
  isBookmark,
  onClick,
  extraClass,
}: {
  label: string;
  isActive: boolean;
  isBookmark: boolean;
  onClick: () => void;
  extraClass?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        // Base — all tabs
        "-mb-px px-3 py-[5px] pb-[7px] text-[11px] font-medium whitespace-nowrap",
        "rounded-t-md border border-b-0 transition-colors select-none",
        // Active states
        isActive && !isBookmark &&
          "bg-card text-foreground border-border z-10",
        isActive && isBookmark &&
          "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 z-10",
        // Inactive states
        !isActive && !isBookmark &&
          "bg-muted/40 text-muted-foreground border-border/60 hover:bg-muted hover:text-foreground",
        !isActive && isBookmark &&
          "bg-muted/40 text-amber-600/50 border-border/60 hover:bg-amber-950/20 hover:text-amber-500",
        extraClass,
      )}
    >
      {label}
    </button>
  );
}

export function TopicTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentTopic = searchParams.get("topic") ?? "";

  function selectTopic(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("topic", value);
    } else {
      params.delete("topic");
    }
    startTransition(() => {
      router.replace(`/questions?${params.toString()}`, { scroll: false });
    });
  }

  const allTab = { value: "", label: "All" };
  const bookmarkTab = { value: "bookmarked", label: "★ Bookmarked" };
  const topicTabs = TOPICS.map((t) => ({ value: t, label: TOPIC_LABELS[t] }));

  // Active topic tab is always placed right after "All" so it sits
  // next to it in the bottom row (wrap-reverse fills bottom row first).
  const activeTopicTab = topicTabs.find((t) => t.value === currentTopic);
  const otherTopicTabs = topicTabs.filter((t) => t.value !== currentTopic);
  const orderedDesktopTabs = [
    allTab,
    ...(activeTopicTab ? [activeTopicTab] : []),
    ...otherTopicTabs,
    bookmarkTab,
  ];

  // Mobile keeps stable order (horizontal scroll, no reordering needed)
  const mobileTabs = [allTab, ...topicTabs, bookmarkTab];

  return (
    <div className={cn("relative", isPending && "opacity-70")}>
      {/* Mobile: single scrollable row, stable order */}
      <div className="flex sm:hidden overflow-x-auto gap-[3px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-b border-border">
        {mobileTabs.map((tab) => (
          <Tab
            key={`mob-${tab.value}`}
            label={tab.label}
            isActive={currentTopic === tab.value}
            isBookmark={tab.value === "bookmarked"}
            onClick={() => selectTopic(tab.value)}
            extraClass="flex-shrink-0"
          />
        ))}
      </div>

      {/* Desktop: wrap-reverse — bottom row fills first, rows grow upward */}
      <div className="hidden sm:flex flex-wrap-reverse gap-[3px] border-b border-border">
        {orderedDesktopTabs.map((tab) => (
          <Tab
            key={tab.value}
            label={tab.label}
            isActive={currentTopic === tab.value}
            isBookmark={tab.value === "bookmarked"}
            onClick={() => selectTopic(tab.value)}
          />
        ))}
      </div>
    </div>
  );
}
