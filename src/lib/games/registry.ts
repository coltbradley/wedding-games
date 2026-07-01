import { GAME_IDS, type GameId } from "./types";
import type { Lang } from "../strings";

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

const LAUNCH_DATE = process.env.NEXT_PUBLIC_LAUNCH_DATE ?? "2026-07-31";
const TZ = "Europe/Paris";

/**
 * Dev/preview escape hatch: set NEXT_PUBLIC_UNLOCK_ALL=1 to open every game
 * regardless of date (for testing before launch). Never set in production.
 */
const UNLOCK_ALL = process.env.NEXT_PUBLIC_UNLOCK_ALL === "1";

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
  if (UNLOCK_ALL) return SCHEDULE.length;
  const elapsed = daysSinceLaunch(parisDateToday(now));
  if (elapsed < 0) return 0;
  return Math.min(elapsed + 1, SCHEDULE.length);
}

/** Days until launch (0 on launch day, negative after). For the countdown. */
export function daysUntilLaunch(now: Date = new Date()): number {
  return -daysSinceLaunch(parisDateToday(now));
}

/** The calendar date a given day unlocks, for "Opens Fri 31 Jul" copy. */
export function unlockDate(day: number): Date {
  return new Date(Date.parse(LAUNCH_DATE) + (day - 1) * 86_400_000);
}

/** Localized "vendredi 31 juillet" / "Friday 31 July" for a schedule day. */
export function unlockDateLabel(day: number, lang: Lang): string {
  // The date is a plain calendar day (parsed as UTC midnight), so format in
  // UTC — any local timezone would shift it near midnight.
  return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(unlockDate(day));
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
