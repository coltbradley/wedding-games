"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLang } from "./LangContext";
import {
  GAME_ORDER,
  connectionsView,
  travelView,
  triviaView,
  twoTruthsView,
  wordleView,
} from "@/lib/games/view";
import { buildRawResult } from "@/lib/games/result";
import { buildShareText } from "@/lib/games/logic";
import {
  SCHEDULE,
  unlockDateLabel,
  unlockedThroughDay,
} from "@/lib/games/registry";
import {
  data,
  type LeaderRow,
  type MyResult,
  type RosterEntry,
} from "@/lib/data";
import type { GameId, RawResult } from "@/lib/games/types";
import { fmt, type Lang } from "@/lib/strings";

export type Screen =
  "join" | "namepick" | "hub" | GameId | "results" | "leaderboard";
export type Board = "all" | GameId;
type Done = Partial<Record<GameId, number | "X">>;

interface ConnTile {
  gi: number;
  mi: number;
}
interface ConnState {
  order: ConnTile[];
  selected: number[];
  // `revealed` marks groups shown by the end-of-game reveal, not found by the
  // player — they render dimmed and never count toward the score.
  solved: { g: number; revealed?: boolean }[];
  wrong: number[];
  mistakes: number;
  msg: "" | "oneAway";
  /** Language the grid was dealt in — tiles stay stable if the toggle flips. */
  lang: Lang | null;
}

type SaveState = { id: GameId; st: "saving" | "saved" | "error" } | null;

interface State {
  screen: Screen;
  booting: boolean;
  user: string;
  toast: string;
  loading: boolean;
  copied: boolean;
  shareFallback: string;
  lastGame: GameId;
  board: Board;
  done: Done;
  /** Which finished games earned the day-of bonus (for the result card). */
  dayBonus: Partial<Record<GameId, boolean>>;
  startedAt: number | null;
  unlockedDay: number;
  save: SaveState;
  // sign-in (name-pick)
  roster: RosterEntry[];
  rosterLoading: boolean;
  rosterErr: boolean;
  signingIn: boolean;
  selectedGuestId: string | null;
  eventCode: string;
  signInErr: "" | "bad-code" | "taken" | "unknown";
  // leaderboard
  leaders: LeaderRow[];
  boardLoading: boolean;
  boardErr: boolean;
  // games
  wordle: {
    current: string;
    guesses: string[];
    flipRow: number | null;
    /** Language the word was served in — the answer must not change mid-game. */
    lang: Lang | null;
  };
  trivia: { i: number; picks: number[] };
  tt: { i: number; picks: number[] };
  travel: { i: number; picks: ("france" | "srilanka")[] };
  conn: ConnState;
}

function initialState(): State {
  return {
    screen: "join",
    booting: true,
    user: "",
    toast: "",
    loading: false,
    copied: false,
    shareFallback: "",
    lastGame: "wordle",
    board: "all",
    done: {},
    dayBonus: {},
    startedAt: null,
    unlockedDay: unlockedThroughDay(),
    save: null,
    roster: [],
    rosterLoading: false,
    rosterErr: false,
    signingIn: false,
    selectedGuestId: null,
    eventCode: "",
    signInErr: "",
    leaders: [],
    boardLoading: false,
    boardErr: false,
    wordle: { current: "", guesses: [], flipRow: null, lang: null },
    trivia: { i: 0, picks: [] },
    tt: { i: 0, picks: [] },
    travel: { i: 0, picks: [] },
    conn: {
      order: [],
      selected: [],
      solved: [],
      wrong: [],
      mistakes: 0,
      msg: "",
      lang: null,
    },
  };
}

/**
 * Rebuild finished-game state from saved results so a reload (or a new day's
 * visit) still shows result cards, played checkmarks, and share grids. The
 * detail blobs are validated defensively — old rows may predate some fields.
 */
function rehydrated(results: MyResult[]): Partial<State> {
  const patch: Partial<State> = {};
  const done: Done = {};
  const dayBonus: Partial<Record<GameId, boolean>> = {};
  const asLang = (v: unknown): Lang | null =>
    v === "fr" || v === "en" ? v : null;
  for (const r of results) {
    const d = r.detail;
    dayBonus[r.gameId] = d.onDay === true;
    if (r.gameId === "wordle") {
      const guesses = Array.isArray(d.guesses)
        ? (d.guesses as string[]).filter((x) => typeof x === "string")
        : [];
      const tries =
        typeof d.tries === "number" ? d.tries : Math.max(guesses.length, 1);
      done.wordle = d.solved === true ? tries : "X";
      patch.wordle = {
        current: "",
        guesses,
        flipRow: null,
        lang: asLang(d.lang),
      };
    } else if (r.gameId === "trivia") {
      const picks = Array.isArray(d.picks) ? (d.picks as number[]) : [];
      done.trivia = typeof d.right === "number" ? d.right : 0;
      patch.trivia = { i: Math.max(0, picks.length - 1), picks };
    } else if (r.gameId === "two-truths") {
      const picks = Array.isArray(d.picks) ? (d.picks as number[]) : [];
      done["two-truths"] = typeof d.right === "number" ? d.right : 0;
      patch.tt = { i: Math.max(0, picks.length - 1), picks };
    } else if (r.gameId === "travel") {
      const picks = Array.isArray(d.picks)
        ? (d.picks as ("france" | "srilanka")[])
        : [];
      done.travel = typeof d.right === "number" ? d.right : 0;
      patch.travel = { i: Math.max(0, picks.length - 1), picks };
    } else if (r.gameId === "connections") {
      const groups = Array.isArray(d.groups) ? (d.groups as number[]) : [];
      done.connections =
        typeof d.solved === "number" ? d.solved : groups.length;
      patch.conn = {
        order: [],
        selected: [],
        solved: groups.map((g) => ({ g })),
        wrong: [],
        mistakes: typeof d.mistakes === "number" ? d.mistakes : 0,
        msg: "",
        lang: asLang(d.lang),
      };
    }
  }
  patch.done = done;
  patch.dayBonus = dayBonus;
  return patch;
}

export interface Game {
  s: State;
  lang: ReturnType<typeof useLang>;
  // sign-in
  goNamePick: () => void;
  goJoin: () => void;
  selectGuest: (id: string) => void;
  onEventCode: (v: string) => void;
  submitName: () => void;
  // navigation
  openGame: (id: GameId) => void;
  goHub: () => void;
  goBoard: () => void;
  goGames: () => void;
  openResults: () => void;
  setBoard: (b: Board) => void;
  // wordle
  wordleAnswer: () => string;
  onKey: (k: string) => void;
  // quizzes
  pickTrivia: (ci: number) => void;
  nextTrivia: () => void;
  pickTT: (si: number) => void;
  nextTT: () => void;
  pickTravel: (a: "france" | "srilanka") => void;
  nextTravel: () => void;
  // connections
  tapConn: (oi: number) => void;
  shuffleConn: () => void;
  submitConn: () => void;
  // sharing / scoring / persistence
  copyShare: () => void;
  retrySave: () => void;
  scoreOf: (id: GameId) => number | "X";
}

const Ctx = createContext<Game | null>(null);

/** Clipboard write with a legacy fallback; resolves to whether it worked. */
async function copyText(txt: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(txt);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = txt;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const lang = useLang();
  const [s, setS] = useState<State>(initialState);
  const loadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRaw = useRef<RawResult | null>(null);
  const merge = (p: Partial<State>) => setS((prev) => ({ ...prev, ...p }));

  // Bootstrap: if a session already exists (returning guest), skip sign-in and
  // pull their saved results so played games stay played across reloads.
  useEffect(() => {
    let alive = true;
    (async () => {
      const profile = await data.getProfile().catch(() => null);
      if (!alive) return;
      if (!profile) {
        merge({ booting: false });
        return;
      }
      const results = await data.getMyResults().catch(() => [] as MyResult[]);
      if (!alive) return;
      merge({
        ...(results.length ? rehydrated(results) : {}),
        user: profile.firstName || profile.displayName,
        screen: "hub",
        booting: false,
      });
    })();
    return () => {
      alive = false;
    };
  }, []);

  // The unlock day flips at midnight Paris; refresh on a timer and whenever
  // the app returns to the foreground (a PWA left open overnight).
  useEffect(() => {
    const tick = () =>
      setS((prev) => {
        const day = unlockedThroughDay();
        return day === prev.unlockedDay ? prev : { ...prev, unlockedDay: day };
      });
    const iv = setInterval(tick, 60_000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(iv);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);

  const toast = (msg: string) => {
    merge({ toast: msg });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => merge({ toast: "" }), 2800);
  };

  /** Persist a raw result, tracking save state so the result card can be honest. */
  const persist = (raw: RawResult) => {
    lastRaw.current = raw;
    merge({ save: { id: raw.gameId, st: "saving" } });
    data.submitResult(raw).then(
      (r) => merge({ save: { id: raw.gameId, st: r.ok ? "saved" : "error" } }),
      () => merge({ save: { id: raw.gameId, st: "error" } }),
    );
  };

  // Wordle's answer is fixed to the language the game started in, so the
  // instant FR/EN toggle can never re-grade an in-progress board.
  const wordleAnswer = () => wordleView(s.wordle.lang ?? lang.lang).answer;

  const scoreOf = (id: GameId): number | "X" => scoreOfWith(s, id);
  const scoreOfWith = (st: State, id: GameId): number | "X" => {
    if (id === "wordle") {
      const ans = wordleView(st.wordle.lang ?? lang.lang).answer;
      return st.wordle.guesses.includes(ans) ? st.wordle.guesses.length : "X";
    }
    if (id === "trivia")
      return st.trivia.picks.filter(
        (p, i) => p === triviaView()[i]?.answerIndex,
      ).length;
    if (id === "two-truths")
      return st.tt.picks.filter((p, i) => p === twoTruthsView()[i]?.lieIndex)
        .length;
    if (id === "travel")
      return st.travel.picks.filter((p, i) => p === travelView()[i]?.answer)
        .length;
    if (id === "connections")
      return st.conn.solved.filter((x) => !x.revealed).length;
    return 0;
  };

  // Persist the finished game, then show the result card. Reads state via
  // setS(prev) because connections finishes from a setTimeout whose closure
  // may be a render behind. A game that is already done never re-submits —
  // that closes both the double-tap and the replay-overwrite paths.
  const finishGame = (id: GameId) => {
    setS((prev) => {
      if (prev.done[id] != null)
        return { ...prev, lastGame: id, screen: "results" };
      const elapsedMs = prev.startedAt ? Date.now() - prev.startedAt : 0;
      const gameLang =
        (id === "wordle" ? prev.wordle.lang : null) ??
        (id === "connections" ? prev.conn.lang : null) ??
        lang.lang;
      const raw = buildRawResult(id, prev, gameLang, elapsedMs);
      queueMicrotask(() => persist(raw));
      return {
        ...prev,
        done: { ...prev.done, [id]: scoreOfWith(prev, id) },
        dayBonus: { ...prev.dayBonus, [id]: raw.onDay },
        lastGame: id,
        screen: "results",
      };
    });
  };

  const game: Game = {
    s,
    lang,

    goNamePick: () => {
      merge({
        screen: "namepick",
        signInErr: "",
        rosterLoading: true,
        rosterErr: false,
      });
      data.listGuests().then(
        (roster) => merge({ roster, rosterLoading: false }),
        () => merge({ rosterLoading: false, rosterErr: true }),
      );
    },
    goJoin: () =>
      merge({
        screen: "join",
        selectedGuestId: null,
        eventCode: "",
        signInErr: "",
      }),
    selectGuest: (id) => merge({ selectedGuestId: id, signInErr: "" }),
    onEventCode: (v) => merge({ eventCode: v, signInErr: "" }),
    submitName: () => {
      if (!s.selectedGuestId || s.signingIn) return;
      merge({ signingIn: true, signInErr: "" });
      (async () => {
        const res = await data.signInWithName(s.selectedGuestId!, s.eventCode);
        if (!res.ok) {
          merge({ signingIn: false, signInErr: res.reason });
          return;
        }
        const [profile, results] = await Promise.all([
          data.getProfile().catch(() => null),
          data.getMyResults().catch(() => [] as MyResult[]),
        ]);
        merge({
          ...(results.length ? rehydrated(results) : {}),
          user: profile ? profile.firstName || profile.displayName : "",
          screen: "hub",
          eventCode: "",
          signingIn: false,
        });
      })().catch(() => merge({ signingIn: false, signInErr: "unknown" }));
    },

    openGame: (id) => {
      // A finished game re-opens its result card — replaying would overwrite
      // the saved score.
      if (s.done[id] != null) {
        merge({ lastGame: id, screen: "results" });
        return;
      }
      const meta = SCHEDULE.find((g) => g.id === id);
      if (meta && meta.day > s.unlockedDay) {
        toast(
          fmt(lang.t.locked, { date: unlockDateLabel(meta.day, lang.lang) }),
        );
        return;
      }
      const patch: Partial<State> = {
        loading: true,
        lastGame: id,
        screen: id,
        toast: "",
        startedAt: Date.now(),
      };
      if (id === "wordle" && s.wordle.guesses.length === 0) {
        patch.wordle = { ...s.wordle, lang: lang.lang };
      }
      if (id === "connections" && s.conn.order.length === 0) {
        const groups = connectionsView(lang.lang);
        const all: ConnTile[] = [];
        groups.forEach((g, gi) =>
          g.members.forEach((_, mi) => all.push({ gi, mi })),
        );
        all.sort(() => Math.random() - 0.5);
        patch.conn = {
          order: all,
          selected: [],
          solved: [],
          wrong: [],
          mistakes: 0,
          msg: "",
          lang: lang.lang,
        };
      }
      merge(patch);
      if (loadTimer.current) clearTimeout(loadTimer.current);
      loadTimer.current = setTimeout(() => merge({ loading: false }), 600);
    },
    goHub: () => merge({ screen: "hub", toast: "" }),
    goBoard: () => {
      merge({ screen: "leaderboard", boardLoading: true, boardErr: false });
      data.getLeaderboard().then(
        (leaders) => merge({ leaders, boardLoading: false }),
        () => merge({ boardLoading: false, boardErr: true }),
      );
    },
    goGames: () => merge({ screen: "hub", toast: "" }),
    openResults: () => merge({ screen: "results" }),
    setBoard: (b) => merge({ board: b }),

    wordleAnswer,
    onKey: (k) => {
      const ans = wordleAnswer();
      const w = s.wordle;
      if (w.guesses.includes(ans) || w.guesses.length >= 6) return;
      if (k === "ENT") {
        if (w.current.length !== 5) return;
        const guesses = [...w.guesses, w.current];
        const flipRow = guesses.length - 1;
        const done = { ...s.done };
        const finished = w.current === ans || guesses.length >= 6;
        if (w.current === ans) done.wordle = guesses.length;
        else if (guesses.length >= 6) done.wordle = "X";
        merge({ wordle: { ...w, current: "", guesses, flipRow }, done });
        // Wordle finishes on the same keypress that adds the last guess, so it
        // submits here (the other games submit via finishGame on their Next tap).
        // The "See your card" button only navigates — it must not be the writer.
        if (finished && s.done.wordle == null) {
          const elapsedMs = s.startedAt ? Date.now() - s.startedAt : 0;
          const raw = buildRawResult(
            "wordle",
            { ...s, wordle: { ...s.wordle, guesses } },
            w.lang ?? lang.lang,
            elapsedMs,
          );
          persist(raw);
          merge({ dayBonus: { ...s.dayBonus, wordle: raw.onDay } });
        }
        setTimeout(
          () =>
            setS((prev) =>
              prev.wordle.flipRow === flipRow
                ? { ...prev, wordle: { ...prev.wordle, flipRow: null } }
                : prev,
            ),
          950,
        );
        return;
      }
      if (k === "DEL")
        return setS((prev) => ({
          ...prev,
          wordle: { ...prev.wordle, current: prev.wordle.current.slice(0, -1) },
        }));
      if (/^[A-Z]$/.test(k) && w.current.length < 5)
        setS((prev) => ({
          ...prev,
          wordle: { ...prev.wordle, current: prev.wordle.current + k },
        }));
    },

    pickTrivia: (ci) => {
      const tr = s.trivia;
      if (tr.picks[tr.i] != null) return;
      const picks = [...tr.picks];
      picks[tr.i] = ci;
      merge({ trivia: { ...tr, picks } });
    },
    nextTrivia: () => {
      const tr = s.trivia;
      if (tr.i >= triviaView().length - 1) finishGame("trivia");
      else merge({ trivia: { ...tr, i: tr.i + 1 } });
    },
    pickTT: (si) => {
      const tt = s.tt;
      if (tt.picks[tt.i] != null) return;
      const picks = [...tt.picks];
      picks[tt.i] = si;
      merge({ tt: { ...tt, picks } });
    },
    nextTT: () => {
      const tt = s.tt;
      if (tt.i >= twoTruthsView().length - 1) finishGame("two-truths");
      else merge({ tt: { ...tt, i: tt.i + 1 } });
    },
    pickTravel: (a) => {
      const tv = s.travel;
      if (tv.picks[tv.i] != null) return;
      const picks = [...tv.picks];
      picks[tv.i] = a;
      merge({ travel: { ...tv, picks } });
    },
    nextTravel: () => {
      const tv = s.travel;
      if (tv.i >= travelView().length - 1) finishGame("travel");
      else merge({ travel: { ...tv, i: tv.i + 1 } });
    },

    tapConn: (oi) => {
      const c = s.conn;
      const solvedG = c.solved.map((x) => x.g);
      if (solvedG.includes(c.order[oi].gi)) return;
      const sel = [...c.selected];
      const at = sel.indexOf(oi);
      if (at > -1) sel.splice(at, 1);
      else if (sel.length < 4) sel.push(oi);
      merge({ conn: { ...c, selected: sel, wrong: [], msg: "" } });
    },
    shuffleConn: () => {
      const c = s.conn;
      const solvedG = c.solved.map((x) => x.g);
      const locked = c.order.filter((o) => solvedG.includes(o.gi));
      const loose = c.order
        .filter((o) => !solvedG.includes(o.gi))
        .sort(() => Math.random() - 0.5);
      merge({ conn: { ...c, order: [...locked, ...loose], selected: [] } });
    },
    submitConn: () => {
      const c = s.conn;
      if (c.selected.length !== 4) return;
      const gs = c.selected.map((i) => c.order[i].gi);
      const same = gs.every((g) => g === gs[0]);
      if (same) {
        const solved = [...c.solved, { g: gs[0] }];
        merge({ conn: { ...c, solved, selected: [], msg: "" } });
        if (solved.length === 4)
          setTimeout(() => finishGame("connections"), 650);
      } else {
        const counts: Record<number, number> = {};
        gs.forEach((g) => (counts[g] = (counts[g] || 0) + 1));
        const near = Math.max(...Object.values(counts)) === 3;
        const mistakes = c.mistakes + 1;
        merge({
          conn: {
            ...c,
            wrong: [...c.selected],
            mistakes,
            msg: near ? "oneAway" : "",
          },
        });
        setTimeout(() => {
          if (mistakes >= 4) {
            // Out of guesses: reveal the remaining groups (marked `revealed`
            // so they never score or share as solved), then finish.
            setS((prev) => {
              const found = prev.conn.solved.map((x) => x.g);
              const rest = [0, 1, 2, 3]
                .filter((g) => !found.includes(g))
                .map((g) => ({ g, revealed: true }));
              return {
                ...prev,
                conn: {
                  ...prev.conn,
                  solved: [...prev.conn.solved, ...rest],
                  wrong: [],
                  selected: [],
                  msg: "",
                },
              };
            });
            setTimeout(() => finishGame("connections"), 750);
          } else {
            setS((prev) => ({
              ...prev,
              conn: { ...prev.conn, wrong: [], selected: [], msg: "" },
            }));
          }
        }, 1100);
      }
    },

    copyShare: () => {
      const txt = buildShareText(
        {
          lastGame: s.lastGame,
          guesses: s.wordle.guesses,
          wordleLang: s.wordle.lang ?? lang.lang,
          trivia: s.trivia.picks,
          tt: s.tt.picks,
          travel: s.travel.picks,
          conn: s.conn,
        },
        lang.lang,
      );
      copyText(txt).then((ok) => {
        if (ok) {
          merge({ copied: true, shareFallback: "" });
          setTimeout(() => merge({ copied: false }), 1800);
        } else {
          // Show the text so the guest can press-and-hold copy it themselves.
          merge({ shareFallback: txt });
        }
      });
    },

    retrySave: () => {
      if (lastRaw.current) persist(lastRaw.current);
    },

    scoreOf,
  };

  return <Ctx.Provider value={game}>{children}</Ctx.Provider>;
}

export function useGame(): Game {
  const v = useContext(Ctx);
  if (!v) throw new Error("useGame must be used within GameProvider");
  return v;
}

export { GAME_ORDER };
