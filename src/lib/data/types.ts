import type { RawResult } from "@/lib/games/types";

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

/** One leaderboard row (both metrics carried; the UI picks today vs all-time). */
export interface LeaderRow {
  name: string;
  today: number;
  all: number;
  me: boolean;
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
  /** Persist a finished game's result (score computed from the raw result). */
  submitResult(r: RawResult): Promise<void>;
  getLeaderboard(): Promise<LeaderRow[]>;
}
