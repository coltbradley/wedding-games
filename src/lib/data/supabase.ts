import { createClient } from "@/lib/supabase/client";
import { scoreResult } from "@/lib/scoring/score";
import type { GameId } from "@/lib/games/types";
import type { DataClient, GuestProfile, MyResult } from "./types";

/**
 * Real backend. Name-pick sign-in uses Supabase anonymous auth (so there is an
 * auth.uid() for row-level security), then the security-definer `link_me` RPC
 * binds that auth user to the chosen guest (see migration 0002).
 *
 * NOTE: enable "Anonymous sign-ins" in Supabase Auth settings for this to work.
 * NOTE: scoring runs here on the client via the shared scoring lib. For a wedding
 * game that's fine; if stricter trust were ever needed it would move to an edge
 * function with no UI change (the score is recomputed from the raw result).
 *
 * Email-OTP sign-in is intentionally NOT wired here yet — name-pick is the
 * shipped path. Adding it later means a requestCode/verifyCode pair plus
 * link_me(null); the schema already supports it.
 */
function sb() {
  return createClient();
}

async function currentGuest(): Promise<GuestProfile | null> {
  const supabase = sb();
  // getSession reads from local storage (and refreshes if needed) without the
  // extra network round-trip getUser does — more reliable on flaky phone
  // networks, which is the whole point of "remember me on this device".
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return null;
  const { data } = await supabase
    .from("guests")
    .select("id, display_name, first_name")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    displayName: data.display_name,
    firstName: data.first_name,
  };
}

export const supabaseClient: DataClient = {
  mode: "supabase",

  getProfile: currentGuest,

  async listGuests() {
    const { data } = await sb()
      .from("guests")
      .select("id, display_name")
      .order("display_name");
    return (data ?? []).map((g) => ({ id: g.id, name: g.display_name }));
  },

  async signInWithName(guestId, eventCode) {
    const required = process.env.NEXT_PUBLIC_EVENT_CODE;
    if (required && eventCode.trim() !== required) {
      return { ok: false, reason: "bad-code" };
    }
    const supabase = sb();

    const freshAnon = async () => {
      await supabase.auth.signOut();
      const { error } = await supabase.auth.signInAnonymously();
      return !error;
    };

    // Reuse an existing session if there is one, so re-tapping your name keeps
    // the same auth user instead of minting a new anonymous one each time.
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session && !(await freshAnon())) {
      return { ok: false, reason: "unknown" };
    }

    let { error } = await supabase.rpc("link_me", { p_guest_id: guestId });
    // A stored session can outlive its auth user (e.g. the project's anonymous
    // users were wiped). link_me then fails to bind, so start a clean session
    // and try once more before giving up — this is what keeps a returning
    // guest from getting stuck on "something went wrong".
    if (error) {
      if (!(await freshAnon())) return { ok: false, reason: "unknown" };
      ({ error } = await supabase.rpc("link_me", { p_guest_id: guestId }));
    }
    if (error) return { ok: false, reason: "unknown" };
    return { ok: true };
  },

  async signOut() {
    await sb().auth.signOut();
  },

  async submitResult(r) {
    const attempt = async () => {
      const me = await currentGuest();
      if (!me) return false;
      const score = scoreResult(r);
      const { error } = await sb().from("game_results").upsert(
        {
          guest_id: me.id,
          game_id: r.gameId,
          correctness: r.correctness,
          score,
          elapsed_ms: r.elapsedMs,
          detail: r.detail,
        },
        { onConflict: "guest_id,game_id" },
      );
      return !error;
    };
    // One silent retry absorbs a flaky phone network; beyond that the UI
    // shows "didn't save" with a retry button (see docs/LESSONS.md: verify
    // writes against the database, not the screen).
    try {
      if (await attempt()) return { ok: true };
      return { ok: await attempt() };
    } catch {
      return { ok: false };
    }
  },

  async getMyResults(): Promise<MyResult[]> {
    const me = await currentGuest();
    if (!me) return [];
    const { data } = await sb()
      .from("game_results")
      .select("game_id, correctness, score, elapsed_ms, detail")
      .eq("guest_id", me.id);
    return (data ?? []).map((r) => ({
      gameId: r.game_id as GameId,
      correctness: r.correctness,
      score: r.score,
      elapsedMs: r.elapsed_ms,
      detail: (r.detail ?? {}) as Record<string, unknown>,
    }));
  },

  async getLeaderboard() {
    const supabase = sb();
    const me = await currentGuest();
    const [{ data: guests }, { data: results }] = await Promise.all([
      supabase.from("guests").select("id, display_name"),
      supabase
        .from("game_results")
        .select("guest_id, game_id, score, elapsed_ms, created_at"),
    ]);
    interface Agg {
      name: string;
      all: number;
      gamesPlayed: number;
      totalElapsedMs: number;
      firstResultAt: string;
      byGame: Record<string, { score: number; elapsedMs: number }>;
    }
    const byGuest = new Map<string, Agg>();
    (guests ?? []).forEach((g) =>
      byGuest.set(g.id, {
        name: g.display_name,
        all: 0,
        gamesPlayed: 0,
        totalElapsedMs: 0,
        firstResultAt: "",
        byGame: {},
      }),
    );
    (results ?? []).forEach((r) => {
      const e = byGuest.get(r.guest_id);
      if (!e) return;
      e.all += r.score;
      e.gamesPlayed += 1;
      e.totalElapsedMs += r.elapsed_ms;
      if (!e.firstResultAt || r.created_at < e.firstResultAt)
        e.firstResultAt = r.created_at;
      e.byGame[r.game_id] = { score: r.score, elapsedMs: r.elapsed_ms };
    });
    // A guest who played but scored 0 still belongs on the board — filter on
    // participation, not points.
    return [...byGuest.entries()]
      .filter(([, e]) => e.gamesPlayed > 0)
      .map(([id, e]) => ({ id, ...e, me: id === me?.id }));
  },
};
