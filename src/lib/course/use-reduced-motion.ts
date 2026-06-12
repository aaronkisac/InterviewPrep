"use client";

import { useSyncExternalStore } from "react";

// Media queries are an external store — useSyncExternalStore avoids both the
// setState-in-effect lint and any first-paint flicker. SSR snapshot: false.

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * Tracks the user's prefers-reduced-motion setting. When true, the lesson
 * player swaps every animation for an instant state change and skips confetti.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
