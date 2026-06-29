"use client";

import { useEffect } from "react";
import { useGame } from "../app/game";
import { useLang } from "../app/LangContext";
import { GameHero } from "../app/chrome";
import { GAME_META, tx, wordleView } from "@/lib/games/view";
import { evalRow, cellColors, type CellState } from "@/lib/games/logic";
import { C } from "@/lib/design/tokens";

const KEY_ROWS = [
  "QWERTYUIOP".split(""),
  "ASDFGHJKL".split(""),
  ["ENT", ..."ZXCVBNM".split(""), "DEL"],
];

export function Wordle() {
  const g = useGame();
  const { lang, t } = useLang();
  const s = g.s.wordle;
  const ans = g.wordleAnswer();
  const solved = s.guesses.includes(ans);
  const full = solved || s.guesses.length >= 6;
  const hint = wordleView(lang).hint;

  // Physical keyboard support.
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      const k = e.key;
      if (k === "Enter") g.onKey("ENT");
      else if (k === "Backspace") g.onKey("DEL");
      else if (/^[a-zA-Z]$/.test(k)) g.onKey(k.toUpperCase());
    };
    window.addEventListener("keydown", onDown);
    return () => window.removeEventListener("keydown", onDown);
  });

  // Build the 6×5 grid.
  const rows = [];
  for (let r = 0; r < 6; r++) {
    let letters: string[];
    let states: CellState[];
    if (r < s.guesses.length) {
      letters = s.guesses[r].split("");
      states = evalRow(s.guesses[r], ans);
    } else if (r === s.guesses.length && !full) {
      letters = (s.current + "     ").slice(0, 5).split("");
      states = Array(5).fill("empty");
    } else {
      letters = ["", "", "", "", ""];
      states = Array(5).fill("empty");
    }
    const isFlip = r === s.flipRow;
    const cells = states.map((st, c) => {
      const [bg, fg] = cellColors(st);
      const filled = st !== "empty";
      return (
        <div
          key={c}
          style={{
            background: bg,
            color: fg,
            borderRadius: 9,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            font: "600 24px var(--font-sans)",
            border: filled ? "0" : "1.5px solid rgba(110,44,62,.16)",
            textTransform: "uppercase",
            ...(isFlip
              ? { animation: `flip .55s ease ${c * 0.13}s both` }
              : {}),
          }}
        >
          {letters[c]?.trim() || ""}
        </div>
      );
    });
    rows.push(
      <div
        key={r}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5,1fr)",
          gap: 7,
        }}
      >
        {cells}
      </div>,
    );
  }

  // Keyboard colouring from past guesses.
  const ks: Record<string, CellState> = {};
  const rank = { correct: 3, present: 2, absent: 1, empty: 0 } as const;
  s.guesses.forEach((guess) => {
    const st = evalRow(guess, ans);
    guess.split("").forEach((ch, i) => {
      if (!ks[ch] || rank[st[i]] > rank[ks[ch]]) ks[ch] = st[i];
    });
  });

  let msg = "";
  if (solved) msg = t.won[Math.min(s.guesses.length - 1, t.won.length - 1)];
  else if (full) msg = `${t.lost} ${ans}`;

  return (
    <div
      className="screen"
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <GameHero
        hero={GAME_META.wordle.hero}
        day={1}
        title={tx(GAME_META.wordle.title, lang)}
        onBack={g.goHub}
      />

      {hint && (
        <div style={{ textAlign: "center", margin: "12px 0 4px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              background: "#F6EBD3",
              border: "1px solid rgba(216,184,113,.5)",
              borderRadius: 999,
              padding: "6px 14px",
              font: "500 13px var(--font-sans)",
              color: "#8A6A2A",
            }}
          >
            ✿ {t.hintLabel} · {tx(hint, lang)}
          </span>
        </div>
      )}

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "6px 0",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateRows: "repeat(6,52px)",
            gap: 7,
            width: 278,
            margin: "0 auto",
          }}
        >
          {rows}
        </div>
      </div>

      {msg && (
        <div
          style={{
            textAlign: "center",
            margin: "0 0 8px",
            font: "500 16px var(--font-serif)",
            color: C.wine,
            animation: "pop .3s ease",
          }}
        >
          {msg}
        </div>
      )}

      {full ? (
        <div style={{ padding: "4px 24px 18px" }}>
          <button
            onClick={g.openResults}
            style={{
              width: "100%",
              height: 54,
              border: 0,
              borderRadius: 16,
              background: C.wine,
              color: C.paper,
              font: "600 16px var(--font-sans)",
            }}
          >
            {t.seeCard}
          </button>
        </div>
      ) : (
        <div style={{ padding: "0 8px 14px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {KEY_ROWS.map((keys, ri) => (
              <div
                key={ri}
                style={{ display: "flex", gap: 5, justifyContent: "center" }}
              >
                {keys.map((k) => {
                  const wide = k.length > 1;
                  const label = k === "ENT" ? "↵" : k === "DEL" ? "⌫" : k;
                  const st = ks[k];
                  const base = wide
                    ? {
                        padding: "0 12px",
                        background: "#E7DAC9",
                        color: C.wine,
                        font: "600 14px var(--font-sans)",
                      }
                    : st
                      ? {
                          flex: 1,
                          maxWidth: 33,
                          font: "600 14px var(--font-sans)",
                          background: cellColors(st)[0],
                          color: cellColors(st)[1],
                        }
                      : {
                          flex: 1,
                          maxWidth: 33,
                          font: "600 14px var(--font-sans)",
                          background: "#fff",
                          color: C.ink,
                          boxShadow: "0 1px 2px rgba(90,35,51,.1)",
                        };
                  return (
                    <button
                      key={k}
                      onClick={() => g.onKey(k)}
                      style={{
                        height: 48,
                        border: 0,
                        borderRadius: 7,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        ...base,
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
