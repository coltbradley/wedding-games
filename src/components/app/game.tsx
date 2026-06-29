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
import { data, type LeaderRow, type RosterEntry } from "@/lib/data";
import type { GameId } from "@/lib/games/types";

export type Screen =
  "join" | "namepick" | "hub" | GameId | "results" | "leaderboard";
export type Board = "today" | "all";
type Done = Partial<Record<GameId, number | "X">>;

interface ConnTile {
  gi: number;
  mi: number;
}
interface ConnState {
  order: ConnTile[];
  selected: number[];
  solved: { g: number }[];
  wrong: number[];
  mistakes: number;
  msg: "" | "oneAway";
}

interface State {
  screen: Screen;
  booting: boolean;
  user: string;
  toast: string;
  loading: boolean;
  copied: boolean;
  lastGame: GameId;
  board: Board;
  done: Done;
  startedAt: number | null;
  // sign-in (name-pick)
  roster: RosterEntry[];
  selectedGuestId: string | null;
  eventCode: string;
  signInErr: "" | "bad-code" | "taken" | "unknown";
  // leaderboard
  leaders: LeaderRow[];
  boardLoading: boolean;
  // games
  wordle: { current: string; guesses: string[]; flipRow: number | null };
  trivia: { i: number; picks: number[] };
  tt: { i: number; picks: number[] };
  travel: { i: number; picks: ("france" | "srilanka")[] };
  conn: ConnState;
}

const TODAY_DAY = 1; // every game is openable in this build; day 1 is featured

function initialState(): State {
  return {
    screen: "join",
    booting: true,
    user: "",
    toast: "",
    loading: false,
    copied: false,
    lastGame: "wordle",
    board: "today",
    done: {},
    startedAt: null,
    roster: [],
    selectedGuestId: null,
    eventCode: "",
    signInErr: "",
    leaders: [],
    boardLoading: false,
    wordle: { current: "", guesses: [], flipRow: null },
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
    },
  };
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
  // sharing / scoring
  copyShare: () => void;
  scoreOf: (id: GameId) => number | "X";
}

const Ctx = createContext<Game | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const lang = useLang();
  const [s, setS] = useState<State>(initialState);
  const loadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const merge = (p: Partial<State>) => setS((prev) => ({ ...prev, ...p }));

  // Bootstrap: if a session already exists (returning guest), skip sign-in.
  useEffect(() => {
    let alive = true;
    data.getProfile().then((profile) => {
      if (!alive) return;
      if (profile)
        merge({
          user: profile.firstName || profile.displayName,
          screen: "hub",
          booting: false,
        });
      else merge({ booting: false });
    });
    return () => {
      alive = false;
    };
  }, []);

  const wordleAnswer = () => wordleView(lang.lang).answer;

  const scoreOf = (id: GameId): number | "X" => scoreOfWith(s, id);
  const scoreOfWith = (st: State, id: GameId): number | "X" => {
    if (id === "wordle") {
      const ans = wordleAnswer();
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
    if (id === "connections") return st.conn.solved.length;
    return 0;
  };

  // Persist the finished game, then show the result card.
  const finishGame = (id: GameId) => {
    setS((prev) => {
      const elapsedMs = prev.startedAt ? Date.now() - prev.startedAt : 0;
      const raw = buildRawResult(id, prev, lang.lang, elapsedMs);
      data.submitResult(raw).catch(() => {
        /* best-effort; a wedding game shouldn't block on a write */
      });
      return {
        ...prev,
        done: { ...prev.done, [id]: scoreOfWith(prev, id) },
        lastGame: id,
        screen: "results",
      };
    });
  };

  const game: Game = {
    s,
    lang,

    goNamePick: () => {
      merge({ screen: "namepick", signInErr: "" });
      data.listGuests().then((roster) => merge({ roster }));
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
      if (!s.selectedGuestId) return;
      data.signInWithName(s.selectedGuestId, s.eventCode).then((res) => {
        if (!res.ok) return merge({ signInErr: res.reason });
        data.getProfile().then((profile) => {
          merge({
            user: profile ? profile.firstName || profile.displayName : "",
            screen: "hub",
            eventCode: "",
          });
        });
      });
    },

    openGame: (id) => {
      const patch: Partial<State> = {
        loading: true,
        lastGame: id,
        screen: id,
        toast: "",
        startedAt: Date.now(),
      };
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
        };
      }
      merge(patch);
      if (loadTimer.current) clearTimeout(loadTimer.current);
      loadTimer.current = setTimeout(() => merge({ loading: false }), 600);
    },
    goHub: () => merge({ screen: "hub", toast: "" }),
    goBoard: () => {
      merge({ screen: "leaderboard", boardLoading: true });
      data
        .getLeaderboard()
        .then((leaders) => merge({ leaders, boardLoading: false }));
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
        if (w.current === ans) done.wordle = guesses.length;
        else if (guesses.length >= 6) done.wordle = "X";
        merge({ wordle: { current: "", guesses, flipRow }, done });
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
            setS((prev) => ({
              ...prev,
              conn: {
                ...prev.conn,
                solved: [{ g: 0 }, { g: 1 }, { g: 2 }, { g: 3 }],
                wrong: [],
                selected: [],
                msg: "",
              },
            }));
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
          trivia: s.trivia.picks,
          tt: s.tt.picks,
          travel: s.travel.picks,
          conn: s.conn,
        },
        lang.lang,
      );
      const done = () => {
        merge({ copied: true });
        setTimeout(() => merge({ copied: false }), 1800);
      };
      if (navigator.clipboard?.writeText)
        navigator.clipboard.writeText(txt).then(done, done);
      else done();
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

export { GAME_ORDER, TODAY_DAY };
