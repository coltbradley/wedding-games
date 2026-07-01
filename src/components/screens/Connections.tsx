"use client";

import { useGame } from "../app/game";
import { useLang } from "../app/LangContext";
import { GameHero } from "../app/chrome";
import { GAME_META, connectionsView, tx } from "@/lib/games/view";
import { CONN_STYLE, C } from "@/lib/design/tokens";

export function Connections() {
  const g = useGame();
  const { lang, t } = useLang();
  const c = g.s.conn;
  // The grid stays in the language it was dealt in — a mid-game FR/EN toggle
  // must not swap the words under an in-progress selection.
  const groups = connectionsView(c.lang ?? lang);
  const solvedG = c.solved.map((x) => x.g);
  const canSubmit = c.selected.length === 4;

  // Solved bands first, then the loose tile grid. Groups shown by the
  // end-of-game reveal (not found by the player) render dimmed.
  const solvedBands = c.solved.map((sv) => {
    const stl = CONN_STYLE[sv.g];
    const grp = groups[sv.g];
    return (
      <div
        key={`s${sv.g}`}
        style={{
          background: stl.bg,
          color: stl.fg,
          borderRadius: 12,
          padding: "10px 8px",
          textAlign: "center",
          animation: "pop .4s ease",
          opacity: sv.revealed ? 0.55 : 1,
        }}
      >
        <div
          style={{
            font: "700 11px var(--font-sans)",
            letterSpacing: ".05em",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
          }}
        >
          <span style={{ fontSize: 11 }}>{stl.shape}</span>
          {grp.name}
        </div>
        <div
          style={{
            font: "600 13px var(--font-sans)",
            marginTop: 3,
            opacity: 0.95,
          }}
        >
          {grp.members.join("   ·   ")}
        </div>
      </div>
    );
  });

  const looseTiles = c.order
    .map((o, oi) => ({ o, oi }))
    .filter((x) => !solvedG.includes(x.o.gi))
    .map(({ o, oi }) => {
      const selected = c.selected.includes(oi);
      const wrong = c.wrong.includes(oi);
      const word = groups[o.gi]?.members[o.mi] ?? "";
      return (
        <button
          key={oi}
          onClick={() => g.tapConn(oi)}
          style={{
            height: 60,
            borderRadius: 11,
            border: selected || wrong ? "0" : "1px solid rgba(110,44,62,.12)",
            background: wrong ? "#D9A24A" : selected ? C.ink : "#fff",
            color: selected || wrong ? C.paper : C.ink,
            font: "700 13px var(--font-sans)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: 2,
            transition: "background .14s,color .14s",
          }}
        >
          {word}
        </button>
      );
    });

  return (
    <div
      className="screen"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <GameHero
        hero={GAME_META.connections.hero}
        day={5}
        title={tx(GAME_META.connections.title, lang)}
        onBack={g.goHub}
      />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "14px 16px 0",
        }}
      >
        <div
          style={{
            font: "500 14px var(--font-sans)",
            color: C.slate,
            textAlign: "center",
            marginBottom: 14,
          }}
        >
          {t.connHint}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {solvedBands}
          {looseTiles.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 7,
              }}
            >
              {looseTiles}
            </div>
          )}
        </div>

        {c.msg === "oneAway" && (
          <div
            style={{
              textAlign: "center",
              marginTop: 12,
              animation: "pop .25s ease",
            }}
          >
            <span
              style={{
                display: "inline-block",
                background: C.ink,
                color: C.paper,
                borderRadius: 999,
                padding: "7px 16px",
                font: "600 13px var(--font-sans)",
              }}
            >
              {t.oneAway}
            </span>
          </div>
        )}

        <div
          style={{
            textAlign: "center",
            marginTop: 14,
            font: "500 12px var(--font-sans)",
            letterSpacing: ".04em",
            color: C.stone,
          }}
        >
          {t.mistakesWord} · {c.mistakes}
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            padding: "16px 2px 24px",
            marginTop: "auto",
          }}
        >
          <button
            onClick={g.shuffleConn}
            style={{
              flex: 1,
              height: 52,
              borderRadius: 16,
              background: "transparent",
              border: "1.5px solid rgba(110,44,62,.25)",
              color: C.wine,
              font: "600 15px var(--font-sans)",
            }}
          >
            {t.shuffle}
          </button>
          <button
            onClick={g.submitConn}
            style={{
              flex: 1,
              height: 52,
              borderRadius: 16,
              background: canSubmit ? C.wine : "rgba(110,44,62,.10)",
              color: canSubmit ? C.paper : C.stone,
              border: 0,
              font: "600 15px var(--font-sans)",
            }}
          >
            {t.submit}
          </button>
        </div>
      </div>
    </div>
  );
}
