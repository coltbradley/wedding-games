/**
 * All scoring constants in one place, tunable without touching logic.
 * The model is documented in docs/SCORING.md.
 */
export const SCORING = {
  /** Max points from getting it right. */
  CORRECTNESS_MAX: 700,
  /** Max points from speed (always smaller than correctness so it can't dominate). */
  SPEED_MAX: 300,
  /** Floor for implausibly fast submissions — anti-fluke, not anti-cheat. */
  MIN_PLAUSIBLE_MS: 3_000,
} as const;

export const TOTAL_MAX = SCORING.CORRECTNESS_MAX + SCORING.SPEED_MAX; // 1000
