// Central motion vocabulary for the course experience.
// Every duration/easing/spring lives here so the "feel" is tuned in one place.
// Pure constants — safe to import from Client Components.

/** Spring for step transitions and progress bar fills. */
export const SPRING = { type: "spring", stiffness: 260, damping: 28 } as const;

/** Softer spring for node pops and celebratory elements. */
export const SPRING_POP = { type: "spring", stiffness: 300, damping: 18 } as const;

/** Step transition: out left / in from right (AnimatePresence mode="wait"). */
export const STEP_VARIANTS = {
  enter: { x: 32, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -32, opacity: 0 },
} as const;

// Keyframe arrays stay mutable on purpose — motion's TargetAndTransition
// rejects readonly tuples, so no `as const` here.

/** Horizontal shake for a wrongly chosen option (≈400ms). */
export const SHAKE_KEYFRAMES = { x: [0, -8, 8, -4, 4, 0] };
export const SHAKE_TRANSITION = { duration: 0.4 } as const;

/** Scale pulse for the correct option (≈350ms). */
export const PULSE_KEYFRAMES = { scale: [1, 1.06, 1] };
export const PULSE_TRANSITION = { duration: 0.35 } as const;

/** Feedback banner slide-up. */
export const BANNER_TRANSITION = { duration: 0.25, ease: "easeOut" } as const;

/** Stagger interval for complete-screen stat cards. */
export const STAGGER_DELAY = 0.08;
