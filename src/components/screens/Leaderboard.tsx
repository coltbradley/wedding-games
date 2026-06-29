"use client";

import { useGame } from "../app/game";
import { useLang } from "../app/LangContext";
import { TabBar } from "../app/chrome";
import { MOCK_LEADERBOARD } from "@/lib/mock-leaderboard";
import { C } from "@/lib/design/tokens";

export function Leaderboard() {
  const g = useGame();
  const { t } = useLang();
  const metric = g.s.board === "today" ? "today" : "all";

  const leaders = [...MOCK_LEADERBOARD]
    .map((p) => ({ name: p.name, val: p[metric] }))
    .sort((a, b) => b.val - a.val)
    .map((p, i) => ({ ...p, rank: i + 1, me: p.name === g.s.user }));

  const pill = (on: boolean) => ({
    bg: on ? C.wine : "transparent",
    fg: on ? C.paper : C.wine,
  });
  const today = pill(g.s.board === "today");
  const all = pill(g.s.board === "all");

  return (
    <div
      className="screen"
      style={{
        minHeight: "100vh",
        paddingBottom: 88,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "26px 24px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div style={{ font: "500 32px/1 var(--font-serif)", color: C.wine }}>
            {t.boardTitle}
          </div>
          <div
            style={{
              font: "italic 500 15px var(--font-serif)",
              color: C.taupe,
              marginTop: 4,
            }}
          >
            Colt &amp; Valentine · 05.08
          </div>
        </div>
      </div>

      <div
        style={{
          margin: "18px 24px 10px",
          display: "flex",
          background: "rgba(110,44,62,.07)",
          borderRadius: 999,
          padding: 4,
        }}
      >
        <button
          onClick={() => g.setBoard("today")}
          style={{
            flex: 1,
            height: 40,
            border: 0,
            borderRadius: 999,
            background: today.bg,
            color: today.fg,
            font: "600 14px var(--font-sans)",
          }}
        >
          {t.today}
        </button>
        <button
          onClick={() => g.setBoard("all")}
          style={{
            flex: 1,
            height: 40,
            border: 0,
            borderRadius: 999,
            background: all.bg,
            color: all.fg,
            font: "600 14px var(--font-sans)",
          }}
        >
          {t.allTime}
        </button>
      </div>

      <div
        style={{
          flex: 1,
          padding: "6px 24px 0",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {leaders.map((p, i) => (
          <div
            key={p.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 13,
              background: p.me ? "rgba(110,44,62,.07)" : "#fff",
              border: p.me
                ? "1.5px solid #6E2C3E"
                : "1px solid rgba(110,44,62,.08)",
              borderRadius: 14,
              padding: "11px 15px",
            }}
          >
            <div
              style={{
                width: 22,
                textAlign: "center",
                font: "600 15px var(--font-sans)",
                color: p.me ? C.wine : "#A8A49A",
              }}
            >
              {p.rank}
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                flex: "none",
                borderRadius: "50%",
                background: p.me ? C.wine : i < 3 ? C.sage : "#E7DAC9",
                color: p.me || i < 3 ? C.paper : C.wine,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                font: "500 18px var(--font-serif)",
              }}
            >
              {p.name.charAt(0)}
            </div>
            <div
              style={{
                flex: 1,
                minWidth: 0,
                font: "600 15px var(--font-sans)",
                color: p.me ? C.wine : C.ink,
              }}
            >
              {p.name}{" "}
              {p.me && (
                <span
                  style={{
                    font: "600 11px var(--font-sans)",
                    letterSpacing: ".05em",
                    textTransform: "uppercase",
                    color: C.sage,
                  }}
                >
                  {t.you}
                </span>
              )}
            </div>
            <div
              style={{
                font: "600 15px var(--font-sans)",
                color: p.me ? C.wine : "#6E6E6A",
              }}
            >
              {p.val} {t.pts}
            </div>
          </div>
        ))}
      </div>

      <TabBar active="board" onGames={g.goGames} onBoard={g.goBoard} />
    </div>
  );
}
