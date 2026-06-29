"use client";

import { useGame } from "../app/game";
import { useLang } from "../app/LangContext";
import { GameHero } from "../app/chrome";
import { GAME_META, travelView, tx } from "@/lib/games/view";
import { C } from "@/lib/design/tokens";

export function Travel() {
  const g = useGame();
  const { lang, t } = useLang();
  const items = travelView();
  const i = g.s.travel.i;
  const item = items[i];
  const picked = g.s.travel.picks[i];
  const answered = picked != null;
  const last = i >= items.length - 1;
  if (!item) return null;

  const btn = (side: "france" | "srilanka") => {
    if (!answered)
      return { bg: "#fff", fg: C.ink, bd: "1.5px solid rgba(110,44,62,.2)" };
    if (item.answer === side) return { bg: C.sage, fg: C.paper, bd: "0" };
    if (picked === side)
      return {
        bg: "rgba(110,44,62,.08)",
        fg: C.wine,
        bd: "1.5px solid #6E2C3E",
      };
    return { bg: "#fff", fg: "#BDB7AD", bd: "1px solid rgba(110,44,62,.08)" };
  };
  const fr = btn("france");
  const sl = btn("srilanka");

  let reveal = "";
  if (answered) {
    const right = picked === item.answer;
    const country = item.answer === "france" ? t.france : t.srilanka;
    reveal = right
      ? lang === "fr"
        ? `Oui — ${country} !`
        : `Yes — ${country}!`
      : lang === "fr"
        ? `C’est ${country}.`
        : `It’s ${country}.`;
  }

  return (
    <div
      className="screen"
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <GameHero
        hero={GAME_META.travel.hero}
        day={4}
        title={tx(GAME_META.travel.title, lang)}
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
          {i + 1} / {items.length}
        </div>
        <div
          style={{
            font: "500 16px var(--font-sans)",
            color: "#6E6E6A",
            textAlign: "center",
            margin: "8px 0 0",
          }}
        >
          {t.travelAsk}
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "18px 0",
          }}
        >
          <div
            style={{
              width: "100%",
              borderRadius: 24,
              background:
                "linear-gradient(140deg,#F5E4D2 0%,#EBE6DC 45%,#DCE7E1 100%)",
              boxShadow: "0 14px 34px rgba(90,35,51,.12)",
              border: "1px solid rgba(110,44,62,.07)",
              padding: "56px 26px",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -30,
                right: -20,
                width: 150,
                height: 150,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle,rgba(243,158,101,.35),transparent 68%)",
                filter: "blur(14px)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -30,
                left: -20,
                width: 150,
                height: 150,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle,rgba(138,154,123,.32),transparent 68%)",
                filter: "blur(14px)",
              }}
            />
            <div
              style={{
                position: "relative",
                font: "500 32px/1.18 var(--font-serif)",
                color: C.ink,
                textWrap: "balance",
              }}
            >
              {tx(item.label, lang)}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, padding: "6px 0 12px" }}>
          <button
            onClick={() => g.pickTravel("france")}
            style={{
              flex: 1,
              height: 62,
              borderRadius: 17,
              background: fr.bg,
              color: fr.fg,
              border: fr.bd,
              font: "600 17px var(--font-sans)",
            }}
          >
            {t.france}
          </button>
          <button
            onClick={() => g.pickTravel("srilanka")}
            style={{
              flex: 1,
              height: 62,
              borderRadius: 17,
              background: sl.bg,
              color: sl.fg,
              border: sl.bd,
              font: "600 17px var(--font-sans)",
            }}
          >
            {t.srilanka}
          </button>
        </div>
        {answered && (
          <div style={{ padding: "0 0 24px", animation: "fadeUp .25s ease" }}>
            <div
              style={{
                textAlign: "center",
                font: "500 17px var(--font-serif)",
                color: C.wine,
                marginBottom: 12,
              }}
            >
              {reveal}
            </div>
            <button
              onClick={g.nextTravel}
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
    </div>
  );
}
