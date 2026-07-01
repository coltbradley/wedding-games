import type { GameId, RawResult } from "@/lib/games/types";

export type { RawResult };

/** The signed-in guest. */
export interface GuestProfile {
  id: string;
  displayName: string;
  firstName: string | null;
}

/** A roster entry for the name-pick sign-in. */
export interface RosterEntry {
  id: string;
  name: string;
}

/**
 * One leaderboard row. `all` is the cumulative total; `byGame` holds the score
 * for each game the guest has played. The UI picks which board to show
 * (all-time, or a single game). The elapsed/firstResultAt fields exist for the
 * deterministic tiebreakers (docs/SCORING.md) — a tie at the reception reveal
 * must resolve the same way every time.
 */
export interface LeaderRow {
  id: string;
  name: string;
  all: number;
  gamesPlayed: number;
  totalElapsedMs: number;
  firstResultAt: string; // ISO timestamp of their earliest result ("" if none)
  byGame: Partial<Record<GameId, { score: number; elapsedMs: number }>>;
  me: boolean;
}

/** A guest's own saved result, for rehydrating played state after a reload. */
export interface MyResult {
  gameId: GameId;
  correctness: number;
  score: number;
  elapsedMs: number;
  detail: Record<string, unknown>;
}

export type SignInResult =
  { ok: true } | { ok: false; reason: "bad-code" | "taken" | "unknown" };

/**
 * The whole backend surface the UI depends on. Two implementations:
 * `mock` (no keys — the app still runs and demos) and `supabase` (real).
 * The selector in ./index picks based on whether Supabase env keys are present.
 * Keeping every backend touch behind this interface is the modular seam:
 * adding email-OTP sign-in later means extending this, not rewiring screens.
 */
export interface DataClient {
  mode: "mock" | "supabase";
  /** Current signed-in guest, or null. Used to skip the sign-in screen on return. */
  getProfile(): Promise<GuestProfile | null>;
  /** Roster for the name-pick screen. */
  listGuests(): Promise<RosterEntry[]>;
  /** Name-pick sign-in: pick a guest, enter the shared event code. */
  signInWithName(guestId: string, eventCode: string): Promise<SignInResult>;
  signOut(): Promise<void>;
  /**
   * Persist a finished game's result (score computed from the raw result).
   * Resolves { ok: false } when the write did not land, so the UI can say so
   * and offer a retry — a result card must never lie about persistence.
   */
  submitResult(r: RawResult): Promise<{ ok: boolean }>;
  /** The signed-in guest's saved results, for rehydration on boot. */
  getMyResults(): Promise<MyResult[]>;
  getLeaderboard(): Promise<LeaderRow[]>;
}
