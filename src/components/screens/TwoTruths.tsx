"use client";

import { useGame } from "../app/game";
import { useLang } from "../app/LangContext";
import { GameHero } from "../app/chrome";
import { GAME_META, twoTruthsView, tx } from "@/lib/games/view";
import { C } from "@/lib/design/tokens";

export function TwoTruths() {
  const g = useGame();
  const { lang, t } = useLang();
  const rounds = twoTruthsView();
  const i = g.s.tt.i;
  const round = rounds[i];
  const picked = g.s.tt.picks[i];
  const answered = picked != null;
  const last = i >= rounds.length - 1;
  if (!round) return null;

  return (
    <div
      className="screen"
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <GameHero
        hero={GAME_META["two-truths"].hero}
        day={3}
        title={tx(GAME_META["two-truths"].title, lang)}
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
          {i + 1} / {rounds.length}
        </div>
        <div
          style={{
            font: "500 24px var(--font-serif)",
            color: C.ink,
            textAlign: "center",
            margin: "10px 0 22px",
          }}
        >
          {t.whichLie}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {round.statements.map((stm, si) => {
            const isLie = si === round.lieIndex;
            const isPick = si === picked;
            let bg: string = "#fff";
            let bd: string = "1px solid rgba(110,44,62,.12)";
            let fg: string = C.ink;
            let tag = "";
            if (answered) {
              if (isLie) {
                bg = "rgba(110,44,62,.07)";
                bd = "1.5px solid #6E2C3E";
                fg = C.wine;
                tag = isPick ? t.gotIt : t.theLie;
              } else if (isPick) {
                bg = "rgba(176,106,74,.10)";
                bd = "1.5px solid #B06A4A";
                fg = "#9A4F2E";
                tag = t.yourGuess;
              } else {
                bg = "rgba(138,154,123,.14)";
                bd = "1px solid rgba(138,154,123,.45)";
                fg = "#5C6B4E";
                tag = t.correctMark;
              }
            }
            return (
              <button
                key={si}
                onClick={() => g.pickTT(si)}
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
                  padding: "17px 18px",
                  minHeight: 62,
                  font: "500 16px/1.35 var(--font-sans)",
                  color: fg,
                }}
              >
                <span style={{ flex: 1 }}>{tx(stm, lang)}</span>
                <span
                  style={{
                    font: "700 9px var(--font-sans)",
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  {tag}
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
            onClick={g.nextTT}
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
