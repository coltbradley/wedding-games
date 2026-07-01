import { SCORING } from "./config";
import { SCHEDULE } from "../games/registry";
import type { GameId, RawResult } from "../games/types";

const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));

/**
 * Normalize a raw result to a 0..1000 score: correctness dominates, speed is a
 * capped bonus that decays to 0 at the game's targetSeconds. "Speed" is the
 * session duration, never how early in the week it was played. See docs/SCORING.md.
 */
export function scoreResult(raw: RawResult): number {
  const meta = SCHEDULE.find((g) => g.id === raw.gameId);
  const targetMs = (meta?.targetSeconds ?? 120) * 1000;

  const correctness = clamp(raw.correctness, 0, 1) * SCORING.CORRECTNESS_MAX;

  const elapsed = Math.max(raw.elapsedMs, SCORING.MIN_PLAUSIBLE_MS);
  const speed = clamp(1 - elapsed / targetMs, 0, 1) * SCORING.SPEED_MAX;

  return Math.round(correctness + speed);
}

// The deterministic tiebreaker sort (docs/SCORING.md) lives in the
// Leaderboard screen, where it also covers the per-game boards.

/** "Played every day" badge, read off the data at the reception reveal. */
export function isStreak(playedGameIds: GameId[]): boolean {
  return SCHEDULE.every((g) => playedGameIds.includes(g.id));
}
