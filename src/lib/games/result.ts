import type { GameId, RawResult } from "./types";
import type { Lang } from "../strings";
import { triviaView, twoTruthsView, travelView, wordleView } from "./view";

/** How much correctness each wrong Connections guess costs (see docs/SCORING.md). */
export const CONN_MISTAKE_PENALTY = 0.05;

/** The game-state slices needed to score a finished game. */
export interface ResultInput {
  wordle: { guesses: string[] };
  trivia: { picks: number[] };
  tt: { picks: number[] };
  travel: { picks: ("france" | "srilanka")[] };
  conn: { solved: { g: number; revealed?: boolean }[]; mistakes: number };
}

/**
 * Turns finished game state into a RawResult (correctness 0..1 + timing + detail).
 * The data layer normalizes this to a 0..1000 score via src/lib/scoring.
 *
 * The `detail` blob carries everything needed to rebuild the result card and
 * share grid after a reload (guesses/picks + the language the game was played
 * in) — the client rehydrates finished games from it on boot.
 */
export function buildRawResult(
  gameId: GameId,
  s: ResultInput,
  lang: Lang,
  elapsedMs: number,
): RawResult {
  let correctness = 0;
  let detail: Record<string, unknown> = {};

  if (gameId === "wordle") {
    const ans = wordleView(lang).answer;
    const solved = s.wordle.guesses.includes(ans);
    const tries = s.wordle.guesses.length;
    correctness = solved ? (7 - tries) / 6 : 0;
    detail = { solved, tries, guesses: s.wordle.guesses, lang };
  } else if (gameId === "trivia") {
    const qs = triviaView();
    const right = s.trivia.picks.filter(
      (p, i) => p === qs[i]?.answerIndex,
    ).length;
    correctness = qs.length ? right / qs.length : 0;
    detail = { right, total: qs.length, picks: s.trivia.picks };
  } else if (gameId === "two-truths") {
    const rs = twoTruthsView();
    const right = s.tt.picks.filter((p, i) => p === rs[i]?.lieIndex).length;
    correctness = rs.length ? right / rs.length : 0;
    detail = { right, total: rs.length, picks: s.tt.picks };
  } else if (gameId === "travel") {
    const items = travelView();
    const right = s.travel.picks.filter(
      (p, i) => p === items[i]?.answer,
    ).length;
    correctness = items.length ? right / items.length : 0;
    detail = { right, total: items.length, picks: s.travel.picks };
  } else if (gameId === "connections") {
    // Only groups the player actually found count — the end-of-game reveal
    // (revealed: true) is presentation, not achievement. Each wrong guess
    // shaves a little off, so a clean solve beats a scrappy one.
    const found = s.conn.solved.filter((x) => !x.revealed);
    correctness = Math.max(
      0,
      Math.min(1, found.length / 4 - s.conn.mistakes * CONN_MISTAKE_PENALTY),
    );
    detail = {
      solved: found.length,
      mistakes: s.conn.mistakes,
      failed: found.length < 4,
      groups: found.map((x) => x.g),
      lang,
    };
  }

  return { gameId, correctness, elapsedMs, detail };
}
