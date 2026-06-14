"use client";

import { useEffect } from "react";

import { migrateGuestProgress } from "@/lib/actions/course";
import {
  clearGuestProgress,
  getGuestProgressEntries,
} from "@/lib/course/guest-progress";

/**
 * Runs once after sign-in: pushes any course progress a visitor made while
 * logged out (stored in localStorage) into their account, then clears it.
 * The server keeps existing-account data untouched; this only seeds a fresh
 * account. Rendered only for authenticated users.
 */
export function GuestProgressMigrator() {
  useEffect(() => {
    const entries = getGuestProgressEntries();
    if (entries.length === 0) return;

    migrateGuestProgress(
      entries.map((e) => ({
        lessonId: e.lessonId,
        accuracyPct: e.accuracyPct,
        challenges: e.challenges,
      })),
    )
      // Clear only after a successful round-trip so a network error keeps the
      // local copy for the next attempt.
      .then(() => clearGuestProgress())
      .catch(() => {});
  }, []);

  return null;
}
