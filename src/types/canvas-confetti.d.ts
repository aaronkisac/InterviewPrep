// Minimal local declaration — canvas-confetti ships no types and we only use
// the default fire function. Swap for @types/canvas-confetti if more of the
// API is ever needed.

declare module "canvas-confetti" {
  export type ConfettiOptions = {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    ticks?: number;
    scalar?: number;
    colors?: string[];
    origin?: { x?: number; y?: number };
    disableForReducedMotion?: boolean;
  };

  const confetti: (options?: ConfettiOptions) => Promise<null> | null;
  export default confetti;
}
