"use client";

// Vertical winding course map — Duolingo-style.
// Unit banner → its lessons as discs on a sine-offset chain, joined by SVG
// connector segments. Unlocked segments draw in; the active node pulses.
// A11y: every node is a link/button with full text state; color never alone.

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { motion } from "motion/react";
import { Check, Lock, Play, Star } from "lucide-react";

import { SPRING_POP } from "@/lib/course/motion";
import {
  getGuestCompletedServerSnapshot,
  getGuestCompletedSnapshot,
  subscribeGuestProgress,
} from "@/lib/course/guest-progress";
import type { LessonNodeStatus, UnitNodeStatus } from "@/lib/course/path-state";
import type { UnitSection } from "@/lib/supabase/types";
import { usePrefersReducedMotion } from "@/lib/course/use-reduced-motion";
import { i18nCourse } from "@/lib/i18n";
import type { Language } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

export type MapUnit = {
  id: string;
  title: string;
  titleTr: string;
  section: UnitSection;
  status: UnitNodeStatus;
  completedPct: number;
  lessons: Array<{
    id: string;
    title: string;
    titleTr: string;
    status: LessonNodeStatus;
  }>;
};

/** Horizontal offset of the n-th bubble in the winding chain. */
function offsetFor(index: number): number {
  return Math.round(Math.sin(index * 1.1) * 56);
}

function Connector({
  from,
  to,
  unlocked,
  reduced,
}: {
  from: number;
  to: number;
  unlocked: boolean;
  reduced: boolean;
}) {
  // Local coordinate space centered at 0; curve from previous to next offset.
  const w = 240;
  const h = 28;
  const x1 = w / 2 + from;
  const x2 = w / 2 + to;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="mx-auto block h-7 w-60"
      aria-hidden="true"
    >
      <motion.path
        d={`M ${x1} 0 C ${x1} ${h / 2}, ${x2} ${h / 2}, ${x2} ${h}`}
        fill="none"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={unlocked ? undefined : "1 8"}
        className={unlocked ? "stroke-primary/60" : "stroke-border"}
        initial={reduced || !unlocked ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </svg>
  );
}

const SECTION_KEYS: Record<UnitSection, "sectionFoundations" | "sectionCore" | "sectionAdvanced" | "sectionInterview"> = {
  foundations: "sectionFoundations",
  core: "sectionCore",
  advanced: "sectionAdvanced",
  interview: "sectionInterview",
};

export function CourseMap({
  topicSlug,
  topicName,
  units,
  courseDone,
  isGuest,
  lang,
}: {
  topicSlug: string;
  topicName: string;
  units: MapUnit[];
  courseDone: boolean;
  isGuest: boolean;
  lang: Language;
}) {
  const i18n = i18nCourse[lang];
  const reduced = usePrefersReducedMotion();

  // Guest progress lives in localStorage; read it through an external store so
  // the first client render still matches the server (empty → only lesson 1
  // active) and there's no setState-in-effect.
  const guestCompleted = useSyncExternalStore(
    subscribeGuestProgress,
    getGuestCompletedSnapshot,
    getGuestCompletedServerSnapshot,
  );

  // Sequential lock states for the first unit when browsing as a guest:
  // a lesson is done when stored locally, the first not-done one is active,
  // the rest stay locked until it is finished.
  const guestFirstUnitStatus = useMemo(() => {
    if (!isGuest) return null;
    const first = units[0];
    if (!first) return null;
    const map = new Map<string, LessonNodeStatus>();
    let activeAssigned = false;
    for (const l of first.lessons) {
      if (guestCompleted.has(l.id)) {
        map.set(l.id, "done");
      } else if (!activeAssigned) {
        map.set(l.id, "active");
        activeAssigned = true;
      } else {
        map.set(l.id, "locked");
      }
    }
    return map;
  }, [isGuest, units, guestCompleted]);

  // Global index of each unit's first lesson bubble (drives the sine offsets).
  // Computed before JSX — the react compiler forbids mutating closure
  // variables inside render callbacks.
  const startIndexes: number[] = [];
  let acc = 0;
  for (const unit of units) {
    startIndexes.push(acc);
    acc += unit.lessons.length;
  }

  return (
    <div>
      <h1 className="text-center text-2xl font-semibold tracking-tight">
        {topicName}
      </h1>

      {courseDone && (
        <p className="mx-auto mt-4 max-w-sm rounded-xl border border-emerald-500/40 bg-emerald-50 p-3 text-center text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
          ★ {i18n.courseComplete}
        </p>
      )}

      <div className="mt-8 space-y-1">
        {units.map((unit, uIdx) => {
          const showSection =
            uIdx === 0 || units[uIdx - 1]!.section !== unit.section;
          const unitTitle = lang === "tr" ? unit.titleTr : unit.title;

          return (
            <div key={unit.id}>
              {showSection && (
                <p className="mb-4 mt-8 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground first:mt-0">
                  — {i18n[SECTION_KEYS[unit.section]]} —
                </p>
              )}

              {/* Unit banner */}
              <div
                className={cn(
                  "mx-auto flex max-w-sm items-center justify-between gap-3 rounded-xl border-2 px-4 py-3",
                  unit.status === "done" &&
                    "border-emerald-500/50 bg-emerald-50/60 dark:bg-emerald-950/30",
                  unit.status === "in_progress" && "border-primary/50 bg-primary/5",
                  unit.status === "locked" && "border-border bg-card opacity-60",
                )}
              >
                <p className="text-sm font-semibold leading-snug">{unitTitle}</p>
                <span className="shrink-0 text-xs font-medium text-muted-foreground">
                  {unit.status === "done" ? (
                    <Check
                      role="img"
                      className="size-4 text-emerald-600"
                      aria-label={`${unitTitle}: 100%`}
                    />
                  ) : unit.status === "locked" ? (
                    <Lock role="img" className="size-4" aria-label={i18n.locked} />
                  ) : (
                    `${unit.completedPct}%`
                  )}
                </span>
              </div>

              {/* Lesson chain */}
              <div className="py-2">
                {unit.lessons.map((lesson, li) => {
                  const i = startIndexes[uIdx]! + li;
                  const offset = offsetFor(i);
                  const prevOffset = offsetFor(i - 1);
                  const title = lang === "tr" ? lesson.titleTr : lesson.title;
                  const isFirstUnit = uIdx === 0;
                  // First unit = no-login trial (sequential, localStorage-driven).
                  // Later units link to sign-in for guests.
                  let displayStatus: LessonNodeStatus;
                  let href: string;
                  let clickable: boolean;
                  if (isGuest && isFirstUnit) {
                    displayStatus =
                      guestFirstUnitStatus?.get(lesson.id) ?? lesson.status;
                    clickable = displayStatus !== "locked";
                    href = `/learn/${topicSlug}/lesson/${lesson.id}`;
                  } else if (isGuest) {
                    displayStatus = lesson.status;
                    clickable = true;
                    href = "/signin";
                  } else {
                    displayStatus = lesson.status;
                    clickable = lesson.status !== "locked";
                    href = `/learn/${topicSlug}/lesson/${lesson.id}`;
                  }
                  // "Sign in" hint on the first lesson of the first gated unit.
                  const showSignInBadge =
                    isGuest && uIdx === 1 && li === 0;

                  const disc = (
                    <motion.span
                      className={cn(
                        "relative flex size-14 items-center justify-center rounded-full border-4",
                        displayStatus === "done" &&
                          "border-emerald-600 bg-emerald-500 text-white",
                        displayStatus === "active" &&
                          "border-primary bg-primary text-primary-foreground shadow-lg",
                        displayStatus === "locked" &&
                          "border-border bg-secondary text-muted-foreground",
                      )}
                      animate={
                        !reduced && displayStatus === "active"
                          ? { scale: [1, 1.06, 1] }
                          : undefined
                      }
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {displayStatus === "done" ? (
                        <Star className="size-5 fill-current" aria-hidden="true" />
                      ) : displayStatus === "active" ? (
                        <Play className="size-5 fill-current" aria-hidden="true" />
                      ) : (
                        <Lock className="size-5" aria-hidden="true" />
                      )}
                    </motion.span>
                  );

                  return (
                    <div key={lesson.id}>
                      {li > 0 && (
                        <Connector
                          from={prevOffset}
                          to={offset}
                          unlocked={displayStatus !== "locked"}
                          reduced={reduced}
                        />
                      )}
                      <motion.div
                        className="flex items-center justify-center gap-3"
                        style={{ transform: `translateX(${offset}px)` }}
                        initial={reduced ? false : { scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ ...SPRING_POP, delay: reduced ? 0 : Math.min(i * 0.05, 0.6) }}
                      >
                        {clickable ? (
                          <Link
                            href={href}
                            aria-label={`${title}${displayStatus === "done" ? ` — ${i18n.replay}` : ""}`}
                            className="rounded-full transition hover:brightness-105 active:scale-95"
                          >
                            {disc}
                          </Link>
                        ) : (
                          <span aria-label={`${title} — ${i18n.locked}`}>{disc}</span>
                        )}
                        <span
                          className={cn(
                            "max-w-40 text-xs leading-snug",
                            displayStatus === "locked"
                              ? "text-muted-foreground/60"
                              : "text-muted-foreground",
                          )}
                          aria-hidden="true"
                        >
                          {title}
                          {displayStatus === "active" ? (
                            <span className="ml-1 inline-block rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">
                              {i18n.start}
                            </span>
                          ) : showSignInBadge ? (
                            <span className="ml-1 inline-block rounded-full bg-muted-foreground/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                              {i18n.signInToStart}
                            </span>
                          ) : null}
                        </span>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
