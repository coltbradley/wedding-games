import { createClient } from "@/lib/supabase/client";
import { scoreResult } from "@/lib/scoring/score";
import type { DataClient, GuestProfile } from "./types";

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
    // Reuse an existing session if there is one, so re-tapping your name keeps
    // the same auth user instead of minting a new anonymous one each time.
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      const { error: anonErr } = await supabase.auth.signInAnonymously();
      if (anonErr) return { ok: false, reason: "unknown" };
    }
    const { error } = await supabase.rpc("link_me", { p_guest_id: guestId });
    if (error)
      return {
        ok: false,
        reason: error.message.includes("claimed") ? "taken" : "unknown",
      };
    return { ok: true };
  },

  async signOut() {
    await sb().auth.signOut();
  },

  async submitResult(r) {
    const me = await currentGuest();
    if (!me) return;
    const score = scoreResult(r);
    await sb().from("game_results").upsert(
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
  },

  async getLeaderboard() {
    const supabase = sb();
    const me = await currentGuest();
    const [{ data: guests }, { data: results }] = await Promise.all([
      supabase.from("guests").select("id, display_name"),
      supabase.from("game_results").select("guest_id, game_id, score"),
    ]);
    const byGuest = new Map<
      string,
      { name: string; all: number; byGame: Record<string, number> }
    >();
    (guests ?? []).forEach((g) =>
      byGuest.set(g.id, { name: g.display_name, all: 0, byGame: {} }),
    );
    (results ?? []).forEach((r) => {
      const e = byGuest.get(r.guest_id);
      if (!e) return;
      e.all += r.score;
      e.byGame[r.game_id] = (e.byGame[r.game_id] ?? 0) + r.score;
    });
    return [...byGuest.entries()]
      .filter(([, e]) => e.all > 0)
      .map(([id, e]) => ({
        name: e.name,
        all: e.all,
        byGame: e.byGame,
        me: id === me?.id,
      }));
  },
};
