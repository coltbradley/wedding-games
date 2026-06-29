import type { GameId, RawResult } from "./types";
import type { Lang } from "../strings";
import { triviaView, twoTruthsView, travelView, wordleView } from "./view";

/** The game-state slices needed to score a finished game. */
export interface ResultInput {
  wordle: { guesses: string[] };
  trivia: { picks: number[] };
  tt: { picks: number[] };
  travel: { picks: ("france" | "srilanka")[] };
  conn: { solved: { g: number }[]; mistakes: number };
}

/**
 * Turns finished game state into a RawResult (correctness 0..1 + timing + detail).
 * The data layer normalizes this to a 0..1000 score via src/lib/scoring. The
 * `detail` blob carries per-game bits for later share-card rendering.
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
    detail = { solved, tries };
  } else if (gameId === "trivia") {
    const qs = triviaView();
    const right = s.trivia.picks.filter(
      (p, i) => p === qs[i]?.answerIndex,
    ).length;
    correctness = qs.length ? right / qs.length : 0;
    detail = { right, total: qs.length };
  } else if (gameId === "two-truths") {
    const rs = twoTruthsView();
    const right = s.tt.picks.filter((p, i) => p === rs[i]?.lieIndex).length;
    correctness = rs.length ? right / rs.length : 0;
    detail = { right, total: rs.length };
  } else if (gameId === "travel") {
    const items = travelView();
    const right = s.travel.picks.filter(
      (p, i) => p === items[i]?.answer,
    ).length;
    correctness = items.length ? right / items.length : 0;
    detail = { right, total: items.length };
  } else if (gameId === "connections") {
    correctness = s.conn.solved.length / 4;
    detail = { solved: s.conn.solved.length, mistakes: s.conn.mistakes };
  }

  return { gameId, correctness, elapsedMs, detail };
}
