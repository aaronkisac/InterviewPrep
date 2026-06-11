"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Bookmark, Lock, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { i18nQuestions } from "@/lib/i18n";
import { getTopicIcon } from "@/lib/topic-icons";
import type { Language } from "@/lib/supabase/types";

function Tab({
  label,
  isActive,
  isBookmark,
  isPrivate,
  onClick,
  extraClass,
  icon: Icon,
}: {
  label: string;
  isActive: boolean;
  isBookmark: boolean;
  isPrivate?: boolean;
  onClick: () => void;
  extraClass?: string;
  icon?: LucideIcon;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={cn(
        // Base — all tabs
        "-mb-px px-3 py-[5px] pb-[7px] text-[11px] sm:text-sm font-medium whitespace-nowrap",
        "rounded-t-md border border-b-0 transition-colors select-none",
        // Active states
        isActive && !isBookmark && !isPrivate &&
          "bg-card text-foreground border-border z-10",
        isActive && isBookmark &&
          "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 z-10",
        isActive && isPrivate &&
          "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800 z-10",
        // Inactive states
        !isActive && !isBookmark && !isPrivate &&
          "bg-muted/40 text-muted-foreground border-border/60 hover:bg-muted hover:text-foreground",
        !isActive && isBookmark &&
          "bg-muted/40 text-amber-600/50 border-border/60 hover:bg-amber-950/20 hover:text-amber-500",
        !isActive && isPrivate &&
          "bg-muted/40 text-violet-600/50 border-border/60 hover:bg-violet-950/20 hover:text-violet-500",
        extraClass,
      )}
    >
      {isPrivate ? (
        <span className="flex items-center gap-1">
          <Lock className="size-2.5" />
          {label}
        </span>
      ) : Icon ? (
        <span className="flex items-center gap-1.5">
          <Icon className="size-3 sm:size-3.5 shrink-0" aria-hidden="true" />
          {label}
        </span>
      ) : (
        label
      )}
    </button>
  );
}

export function TopicTabs({
  isLoggedIn = true,
  topics = [],
  customTopics = [],
  lang = "en",
}: {
  isLoggedIn?: boolean;
  topics?: Array<{ slug: string; name: string }>;
  customTopics?: Array<{ slug: string; name: string }>;
  lang?: Language;
}) {
  const i18n = i18nQuestions[lang];
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentTopic = searchParams.get("topic") ?? "";
  const currentMyTopic = searchParams.get("mytopic") ?? "";

  function selectTopic(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    params.delete("mytopic");
    if (value) {
      params.set("topic", value);
    } else {
      params.delete("topic");
    }
    startTransition(() => {
      router.replace(`/questions?${params.toString()}`, { scroll: false });
    });
  }

  function selectMyTopic(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    params.delete("topic");
    params.set("mytopic", slug);
    startTransition(() => {
      router.replace(`/questions?${params.toString()}`, { scroll: false });
    });
  }

  const allTab = {
    value: "",
    label: i18n.tabAll,
    icon: undefined as LucideIcon | undefined,
  };
  const bookmarkTab = {
    value: "bookmarked",
    label: i18n.tabBookmarked,
    icon: Bookmark as LucideIcon | undefined,
  };
  const topicTabs = topics.map((t) => ({
    value: t.slug,
    label: t.name,
    icon: getTopicIcon(t.slug) as LucideIcon | undefined,
  }));
  const myTopicTabs = customTopics.map((t) => ({ value: t.slug, label: t.name }));

  const activeTopicTab = topicTabs.find((t) => t.value === currentTopic);
  const otherTopicTabs = topicTabs.filter((t) => t.value !== currentTopic);
  const activeMyTab = myTopicTabs.find((t) => t.value === currentMyTopic);
  const otherMyTabs = myTopicTabs.filter((t) => t.value !== currentMyTopic);

  const orderedDesktopTabs = [
    allTab,
    ...(activeTopicTab ? [activeTopicTab] : []),
    ...otherTopicTabs,
    ...(isLoggedIn ? [bookmarkTab] : []),
  ];

  const mobileTabs = [allTab, ...topicTabs, ...(isLoggedIn ? [bookmarkTab] : [])];

  return (
    <div className={cn("relative", isPending && "opacity-70")}>
      {/* Mobile: single scrollable row */}
      <div className="flex sm:hidden overflow-x-auto gap-[3px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-b border-border">
        {mobileTabs.map((tab) => (
          <Tab
            key={`mob-${tab.value}`}
            label={tab.label}
            icon={tab.icon}
            isActive={currentTopic === tab.value && currentMyTopic === ""}
            isBookmark={tab.value === "bookmarked"}
            onClick={() => selectTopic(tab.value)}
            extraClass="flex-shrink-0"
          />
        ))}
        {isLoggedIn && myTopicTabs.map((tab) => (
          <Tab
            key={`mob-my-${tab.value}`}
            label={tab.label}
            isActive={currentMyTopic === tab.value}
            isBookmark={false}
            isPrivate
            onClick={() => selectMyTopic(tab.value)}
            extraClass="flex-shrink-0"
          />
        ))}
      </div>

      {/* Desktop: wrap-reverse */}
      <div className="hidden sm:flex flex-wrap-reverse gap-[3px] border-b border-border">
        {orderedDesktopTabs.map((tab) => (
          <Tab
            key={tab.value}
            label={tab.label}
            icon={tab.icon}
            isActive={currentTopic === tab.value && currentMyTopic === ""}
            isBookmark={tab.value === "bookmarked"}
            onClick={() => selectTopic(tab.value)}
          />
        ))}
        {isLoggedIn && (
          <>
            {(activeMyTab ? [activeMyTab] : []).map((tab) => (
              <Tab
                key={`my-${tab.value}`}
                label={tab.label}
                isActive={true}
                isBookmark={false}
                isPrivate
                onClick={() => selectMyTopic(tab.value)}
              />
            ))}
            {otherMyTabs.map((tab) => (
              <Tab
                key={`my-${tab.value}`}
                label={tab.label}
                isActive={false}
                isBookmark={false}
                isPrivate
                onClick={() => selectMyTopic(tab.value)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
