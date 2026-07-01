import { MOCK_LEADERBOARD } from "@/lib/mock-leaderboard";
import { scoreResult } from "@/lib/scoring/score";
import type { GameId } from "@/lib/games/types";
import type { DataClient, GuestProfile, MyResult } from "./types";

/**
 * No-keys mode. Keeps the app fully playable for local dev and demos:
 * scores persist in memory for the tab's lifetime, the leaderboard is the
 * placeholder set. Mirrors the real client's shape (including the event-code
 * gate) so the UI is identical and every state is reachable without keys.
 */
let session: GuestProfile | null = null;
const myResults = new Map<GameId, MyResult>();

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
  async signInWithName(guestId, eventCode) {
    const required = process.env.NEXT_PUBLIC_EVENT_CODE;
    if (required && eventCode.trim() !== required) {
      return { ok: false, reason: "bad-code" };
    }
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
    myResults.clear();
  },
  async submitResult(r) {
    if (!session) return { ok: false };
    myResults.set(r.gameId, {
      gameId: r.gameId,
      correctness: r.correctness,
      score: scoreResult(r),
      elapsedMs: r.elapsedMs,
      detail: r.detail,
    });
    return { ok: true };
  },
  async getMyResults() {
    return [...myResults.values()];
  },
  async getLeaderboard() {
    const mine = [...myResults.values()];
    return MOCK_LEADERBOARD.map((p, i) => {
      const isMe = session?.displayName === p.name;
      const byGame: Partial<
        Record<GameId, { score: number; elapsedMs: number }>
      > = {};
      Object.entries(p.byGame).forEach(([id, score]) => {
        if (score != null)
          byGame[id as GameId] = {
            score,
            elapsedMs: 45_000 + i * 7_000,
          };
      });
      if (isMe)
        mine.forEach((r) => {
          byGame[r.gameId] = { score: r.score, elapsedMs: r.elapsedMs };
        });
      const rows = Object.values(byGame);
      return {
        id: String(i),
        name: p.name,
        all: rows.reduce((s, v) => s + v.score, 0),
        gamesPlayed: rows.length,
        totalElapsedMs: rows.reduce((s, v) => s + v.elapsedMs, 0),
        firstResultAt: `2026-07-31T0${i % 10}:00:00Z`,
        byGame,
        me: isMe,
      };
    });
  },
};
