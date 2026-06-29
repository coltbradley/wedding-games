import { GAME_IDS, type GameId } from "./types";

/**
 * The schedule: which game unlocks on which day, keyed to Europe/Paris.
 * Day 1 = LAUNCH_DATE (Fri Jul 31, 2026). Past days stay playable (catch-up);
 * future days are locked. See docs/DECISIONS.md #9.
 */

export interface GameMeta {
  id: GameId;
  day: number; // 1..5
  /** Target solve time in seconds; the speed bonus decays to 0 here. See docs/SCORING.md. */
  targetSeconds: number;
}

export const SCHEDULE: GameMeta[] = [
  { id: "wordle", day: 1, targetSeconds: 120 },
  { id: "trivia", day: 2, targetSeconds: 90 },
  { id: "two-truths", day: 3, targetSeconds: 90 },
  { id: "travel", day: 4, targetSeconds: 75 },
  { id: "connections", day: 5, targetSeconds: 180 },
];

const LAUNCH_DATE = process.env.LAUNCH_DATE ?? "2026-07-31";
const TZ = process.env.APP_TIMEZONE ?? "Europe/Paris";

/** Today's date as YYYY-MM-DD in the event timezone (Paris), regardless of device. */
export function parisDateToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** How many days since launch (0-based): 0 on launch day, 1 the next day, etc. */
function daysSinceLaunch(today: string): number {
  const ms = Date.parse(today) - Date.parse(LAUNCH_DATE);
  return Math.floor(ms / 86_400_000);
}

/** The highest day index currently unlocked (1..5), or 0 before launch. */
export function unlockedThroughDay(now: Date = new Date()): number {
  const elapsed = daysSinceLaunch(parisDateToday(now));
  if (elapsed < 0) return 0;
  return Math.min(elapsed + 1, SCHEDULE.length);
}

export function isUnlocked(gameId: GameId, now: Date = new Date()): boolean {
  const meta = SCHEDULE.find((g) => g.id === gameId);
  return meta ? meta.day <= unlockedThroughDay(now) : false;
}

export function todaysGame(now: Date = new Date()): GameMeta | null {
  const day = unlockedThroughDay(now);
  return SCHEDULE.find((g) => g.day === day) ?? null;
}

export { GAME_IDS };
