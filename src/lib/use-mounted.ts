import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * True after hydration, false during SSR/hydration render.
 * useSyncExternalStore-based so it satisfies react-hooks/set-state-in-effect
 * (no mount effect + setState cascade).
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
