/**
 * All scoring constants in one place, tunable without touching logic.
 * The model is documented in docs/SCORING.md.
 */
export const SCORING = {
  /** Max points from getting it right — the game itself. */
  CORRECTNESS_MAX: 900,
  /**
   * Flat bonus for finishing a game on the day it opens (Paris time, with a
   * grace window for far-west timezones — see registry.isUnlockDay). Rewards
   * the daily ritual; catch-up stays allowed and costs only this.
   */
  DAY_OF_BONUS: 100,
  /** Floor for implausibly fast sessions — keeps the time tiebreaker honest. */
  MIN_PLAUSIBLE_MS: 3_000,
} as const;

export const TOTAL_MAX = SCORING.CORRECTNESS_MAX + SCORING.DAY_OF_BONUS; // 1000
