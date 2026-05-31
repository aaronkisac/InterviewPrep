"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { cn } from "@/lib/utils";

export type GlossaryTabItem = {
  value: string;
  label: string;
};

function Tab({
  label,
  isActive,
  onClick,
  extraClass,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  extraClass?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "-mb-px px-3 py-[5px] pb-[7px] text-[11px] font-medium whitespace-nowrap",
        "rounded-t-md border border-b-0 transition-colors select-none",
        isActive
          ? "bg-card text-foreground border-border z-10"
          : "bg-muted/40 text-muted-foreground border-border/60 hover:bg-muted hover:text-foreground",
        extraClass,
      )}
    >
      {label}
    </button>
  );
}

export function GlossaryTopicTabs({
  availableTabs,
  allLabel = "All",
}: {
  availableTabs: GlossaryTabItem[];
  allLabel?: string;
}) {
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
      router.replace(`/glossary?${params.toString()}`, { scroll: false });
    });
  }

  const allTab: GlossaryTabItem = { value: "", label: allLabel };

  // Active tab moves to index 1 (next to All) for wrap-reverse bottom-row placement
  const activeTab = availableTabs.find((t) => t.value === currentTopic);
  const otherTabs = availableTabs.filter((t) => t.value !== currentTopic);
  const orderedDesktopTabs = [
    allTab,
    ...(activeTab ? [activeTab] : []),
    ...otherTabs,
  ];

  const mobileTabs = [allTab, ...availableTabs];

  return (
    <div className={cn("relative", isPending && "opacity-70")}>
      {/* Mobile: horizontal scroll */}
      <div className="flex sm:hidden overflow-x-auto gap-[3px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-b border-border">
        {mobileTabs.map((tab) => (
          <Tab
            key={`mob-${tab.value}`}
            label={tab.label}
            isActive={currentTopic === tab.value}
            onClick={() => selectTopic(tab.value)}
            extraClass="flex-shrink-0"
          />
        ))}
      </div>

      {/* Desktop: wrap-reverse — fills bottom row first, grows upward */}
      <div className="hidden sm:flex flex-wrap-reverse gap-[3px] border-b border-border">
        {orderedDesktopTabs.map((tab) => (
          <Tab
            key={tab.value}
            label={tab.label}
            isActive={currentTopic === tab.value}
            onClick={() => selectTopic(tab.value)}
          />
        ))}
      </div>
    </div>
  );
}
