"use client";

import { useGame } from "../app/game";
import { useLang } from "../app/LangContext";
import { GameHero } from "../app/chrome";
import { GAME_META, triviaView, tx } from "@/lib/games/view";
import { C } from "@/lib/design/tokens";

export function Trivia() {
  const g = useGame();
  const { lang, t } = useLang();
  const qs = triviaView();
  const i = g.s.trivia.i;
  const q = qs[i];
  const picked = g.s.trivia.picks[i];
  const answered = picked != null;
  const last = i >= qs.length - 1;
  if (!q) return null;

  return (
    <div
      className="screen"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <GameHero
        hero={GAME_META.trivia.hero}
        day={2}
        title={tx(GAME_META.trivia.title, lang)}
        onBack={g.goHub}
      />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "18px 22px 0",
        }}
      >
        <div
          style={{
            font: "600 12px var(--font-sans)",
            letterSpacing: ".16em",
            textTransform: "uppercase",
            color: C.taupe,
            textAlign: "center",
          }}
        >
          {t.questionOf[0]} {i + 1} {t.questionOf[1]} {qs.length}
        </div>
        <div
          style={{
            font: "500 25px/1.28 var(--font-serif)",
            color: C.ink,
            textAlign: "center",
            margin: "12px 0 22px",
            textWrap: "pretty",
          }}
        >
          {tx(q.prompt, lang)}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {q.choices.map((c, ci) => {
            const isAns = ci === q.answerIndex;
            const isPick = ci === picked;
            let bg: string = "#fff";
            let bd: string = "1px solid rgba(110,44,62,.12)";
            let fg: string = C.ink;
            let mark = "";
            if (answered) {
              if (isAns) {
                bg = "rgba(138,154,123,.18)";
                bd = "1.5px solid #8A9A7B";
                fg = "#3E4A33";
                mark = "✓";
              } else if (isPick) {
                bg = "rgba(110,44,62,.07)";
                bd = "1.5px solid #B5556A";
                fg = C.wine;
                mark = "✕";
              } else {
                fg = "#A39E95";
              }
            }
            return (
              <button
                key={ci}
                onClick={() => g.pickTrivia(ci)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  textAlign: "left",
                  width: "100%",
                  background: bg,
                  border: bd,
                  borderRadius: 15,
                  padding: "15px 18px",
                  minHeight: 58,
                  font: "500 16px var(--font-sans)",
                  color: fg,
                }}
              >
                <span style={{ flex: 1 }}>{tx(c, lang)}</span>
                <span style={{ font: "600 16px var(--font-sans)" }}>
                  {mark}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {answered && (
        <div
          style={{ padding: "16px 22px 22px", animation: "fadeUp .25s ease" }}
        >
          <button
            onClick={g.nextTrivia}
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
            {last ? t.finish : t.next}
          </button>
        </div>
      )}
    </div>
  );
}
