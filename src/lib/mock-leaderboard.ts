/**
 * Placeholder leaderboard data for the design build. Replaced by a Supabase
 * query against the `leaderboard` view once auth + scoring are wired
 * (see docs/ARCHITECTURE.md, docs/SCORING.md). Shape is intentionally close to
 * what the view returns so the swap is mechanical.
 */
export interface LeaderEntry {
  name: string;
  today: number;
  all: number;
}

export const MOCK_LEADERBOARD: LeaderEntry[] = [
  { name: "Valentine", today: 10, all: 60 },
  { name: "Léa", today: 9, all: 51 },
  { name: "Margaux", today: 8, all: 42 },
  { name: "Amara", today: 8, all: 39 },
  { name: "Thomas", today: 7, all: 48 },
  { name: "Hugo", today: 6, all: 33 },
  { name: "Colt", today: 5, all: 55 },
  { name: "Sanjay", today: 4, all: 44 },
];
