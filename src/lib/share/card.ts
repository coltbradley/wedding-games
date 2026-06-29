import type { GameId } from "../games/types";

/**
 * Spoiler-free, emoji-style result cards that paste cleanly into WhatsApp and
 * carry a link back so non-players can tap straight in. Every game emits one —
 * the consistency is what powers the growth loop. Keep it restrained (that's the
 * whole genius of Wordle's version). See docs/DECISIONS.md #7.
 *
 * These are intentionally thin stubs — each game fills in its own `detail`
 * shape when the game UIs are built. The header + link wrapper is shared.
 */

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

const HEADERS: Record<GameId, string> = {
  wordle: "Wedding Wordle",
  trivia: "How well do you know us?",
  "two-truths": "Two Truths & a Lie",
  travel: "France or Sri Lanka?",
  connections: "Connections",
};

/** Wrap a game's emoji grid with a title and a tap-back link. */
export function buildCard(
  gameId: GameId,
  emojiGrid: string,
  dayLabel: string,
): string {
  return [
    `${HEADERS[gameId]} — ${dayLabel}`,
    "",
    emojiGrid,
    "",
    `Play: ${appUrl}`,
  ].join("\n");
}

// --- Per-game emoji grids (examples of the intended shape) ---

/** Wordle: one row per guess, 🟩 correct / 🟨 present / ⬜ absent. */
export function wordleGrid(
  rows: ("correct" | "present" | "absent")[][],
): string {
  const map = { correct: "🟩", present: "🟨", absent: "⬜" } as const;
  return rows.map((r) => r.map((c) => map[c]).join("")).join("\n");
}

/** Quiz games (trivia / two-truths / travel): one square per answer. */
export function quizGrid(correct: boolean[]): string {
  return correct.map((c) => (c ? "🟩" : "🟥")).join("");
}
