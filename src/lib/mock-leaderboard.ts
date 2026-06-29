/**
 * Placeholder leaderboard data for local dev and demos (mock mode, no keys).
 * Per-game scores on the real 0–1000 scale; `all` is derived as their sum.
 * Not everyone has played every game, so the per-game boards have different
 * leaders — which is the whole point of breaking the board out by game.
 */
export interface LeaderEntry {
  name: string;
  byGame: Partial<Record<string, number>>;
}

export const MOCK_LEADERBOARD: LeaderEntry[] = [
  {
    name: "Valentine",
    byGame: { wordle: 920, trivia: 780, "two-truths": 640, travel: 800 },
  },
  {
    name: "Léa",
    byGame: { wordle: 700, trivia: 880, "two-truths": 720, travel: 540 },
  },
  { name: "Margaux", byGame: { wordle: 810, trivia: 600, travel: 900 } },
  { name: "Amara", byGame: { wordle: 660, "two-truths": 870, travel: 720 } },
  { name: "Thomas", byGame: { wordle: 990, trivia: 540, "two-truths": 600 } },
  { name: "Hugo", byGame: { trivia: 720, travel: 680 } },
  {
    name: "Colt",
    byGame: { wordle: 760, trivia: 820, "two-truths": 900, travel: 640 },
  },
  { name: "Sanjay", byGame: { wordle: 580, travel: 760 } },
];
