import { MOCK_LEADERBOARD } from "@/lib/mock-leaderboard";
import type { DataClient, GuestProfile } from "./types";

/**
 * No-keys mode. Keeps the app fully playable for local dev and demos:
 * sign-in accepts any event code, scores aren't persisted, the leaderboard is
 * the placeholder set. Mirrors the real client's shape so the UI is identical.
 */
let session: GuestProfile | null = null;

const ROSTER = MOCK_LEADERBOARD.map((p, i) => ({
  id: String(i),
  name: p.name,
}));

export const mockClient: DataClient = {
  mode: "mock",
  async getProfile() {
    return session;
  },
  async listGuests() {
    return ROSTER;
  },
  async signInWithName(guestId) {
    const g = ROSTER.find((r) => r.id === guestId);
    if (!g) return { ok: false, reason: "unknown" };
    session = {
      id: g.id,
      displayName: g.name,
      firstName: g.name.split(" ")[0],
    };
    return { ok: true };
  },
  async signOut() {
    session = null;
  },
  async submitResult() {
    // no-op: scores aren't persisted in mock mode
  },
  async getLeaderboard() {
    return MOCK_LEADERBOARD.map((p) => ({
      name: p.name,
      all: Object.values(p.byGame).reduce<number>((s, v) => s + (v ?? 0), 0),
      byGame: p.byGame,
      me: session?.displayName === p.name,
    }));
  },
};
