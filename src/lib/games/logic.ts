import type { Lang } from "../strings";
import { STR } from "../strings";
import {
  GAME_META,
  triviaView,
  twoTruthsView,
  travelView,
  wordleView,
  tx,
} from "./view";
import { CONN_STYLE, SQ } from "../design/tokens";

export type CellState = "correct" | "present" | "absent" | "empty";

/** Wordle row evaluation — greens first, then yellows against remaining letters. */
export function evalRow(guess: string, ans: string): CellState[] {
  const res: CellState[] = Array(5).fill("absent");
  const a: (string | null)[] = ans.split("");
  for (let i = 0; i < 5; i++) {
    if (guess[i] === a[i]) {
      res[i] = "correct";
      a[i] = null;
    }
  }
  for (let i = 0; i < 5; i++) {
    if (res[i] === "correct") continue;
    const j = a.indexOf(guess[i]);
    if (j > -1) {
      res[i] = "present";
      a[j] = null;
    }
  }
  return res;
}

export function cellColors(st: CellState): [string, string] {
  return [SQ[st].bg, SQ[st].fg];
}

/** Game progress needed to build a share card. Mirrors the hook state. */
export interface ShareState {
  lastGame: keyof typeof GAME_META;
  guesses: string[];
  /** Language the wordle was played in — the grid must re-grade against it. */
  wordleLang?: Lang;
  trivia: number[];
  tt: number[];
  travel: ("france" | "srilanka")[];
  conn: { solved: { g: number; revealed?: boolean }[]; mistakes: number };
}

/** Spoiler-free emoji card that pastes into WhatsApp. Ported from the prototype. */
export function buildShareText(s: ShareState, lang: Lang): string {
  const head = "Colt & Valentine";
  const id = s.lastGame;
  const title = (g: keyof typeof GAME_META) => tx(GAME_META[g].title, lang);

  if (id === "wordle") {
    const ans = wordleView(s.wordleLang ?? lang).answer;
    const sym = { correct: "🟩", present: "🟨", absent: "⬜" } as const;
    const lines = s.guesses
      .map((g) =>
        evalRow(g, ans)
          .map((x) => sym[x as keyof typeof sym])
          .join(""),
      )
      .join("\n");
    const n = s.guesses.includes(ans) ? s.guesses.length : "X";
    return `${head} — ${title("wordle")} · ${n}/6\n${lines}`;
  }
  if (id === "trivia") {
    const qs = triviaView();
    const score = s.trivia.filter((p, i) => p === qs[i]?.answerIndex).length;
    const m = qs
      .map((q, i) => (s.trivia[i] === q.answerIndex ? "🟩" : "🟫"))
      .join("");
    return `${head} — ${title("trivia")} · ${score}/${qs.length}\n${m}`;
  }
  if (id === "two-truths") {
    const rs = twoTruthsView();
    const score = s.tt.filter((p, i) => p === rs[i]?.lieIndex).length;
    const m = rs.map((r, i) => (s.tt[i] === r.lieIndex ? "🟩" : "🟫")).join("");
    return `${head} — ${title("two-truths")} · ${score}/${rs.length}\n${m}`;
  }
  if (id === "travel") {
    const items = travelView();
    const score = s.travel.filter((p, i) => p === items[i]?.answer).length;
    const m = items
      .map((it, i) => (s.travel[i] === it.answer ? "🟩" : "🟫"))
      .join("");
    return `${head} — ${title("travel")} · ${score}/${items.length}\n${m}`;
  }
  if (id === "connections") {
    // Only groups the player actually found — a failed game shares honestly.
    const sq = ["🟨", "🟩", "🟦", "🟪"];
    const found = s.conn.solved.filter((sv) => !sv.revealed);
    const lines = found.map((sv) => sq[sv.g].repeat(4)).join("\n");
    const score = `${found.length}/4`;
    return `${head} — ${title("connections")} · ${score} · ${s.conn.mistakes} ${STR[lang].mistakesWord}${lines ? `\n${lines}` : ""}`;
  }
  return head;
}

export { CONN_STYLE };
