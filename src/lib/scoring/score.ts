import { SCORING } from "./config";
import { SCHEDULE } from "../games/registry";
import type { GameId, RawResult } from "../games/types";

const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));

/**
 * Normalize a raw result to a 0..1000 score: correctness is the game (up to
 * 900), plus a flat 100 for playing on the day the game opened. Speed never
 * earns points — total session time is only a leaderboard tiebreaker.
 * See docs/SCORING.md.
 */
export function scoreResult(raw: RawResult): number {
  const correctness = clamp(raw.correctness, 0, 1) * SCORING.CORRECTNESS_MAX;
  const dayOf = raw.onDay ? SCORING.DAY_OF_BONUS : 0;
  return Math.round(correctness) + dayOf;
}

// The deterministic tiebreaker sort (docs/SCORING.md) lives in the
// Leaderboard screen, where it also covers the per-game boards.

/** "Played every day" badge, read off the data at the reception reveal. */
export function isStreak(playedGameIds: GameId[]): boolean {
  return SCHEDULE.every((g) => playedGameIds.includes(g.id));
}
