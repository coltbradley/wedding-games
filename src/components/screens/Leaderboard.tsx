"use client";

import { useGame, type Board } from "../app/game";
import { useLang } from "../app/LangContext";
import { TabBar } from "../app/chrome";
import { GAME_ORDER } from "@/lib/games/view";
import { C } from "@/lib/design/tokens";

export function Leaderboard() {
  const g = useGame();
  const { t } = useLang();
  const board = g.s.board;

  // Per-game boards are head-to-head on a single game (same scoring ceiling);
  // all-time is the cumulative total across every game played.
  const scoreFor = (p: (typeof g.s.leaders)[number]) =>
    board === "all" ? p.all : (p.byGame[board] ?? 0);

  const leaders = g.s.leaders
    .filter((p) => scoreFor(p) > 0)
    .map((p) => ({ name: p.name, val: scoreFor(p), me: p.me }))
    .sort((a, b) => b.val - a.val)
    .map((p, i) => ({ ...p, rank: i + 1 }));

  const boards: Board[] = ["all", ...GAME_ORDER];
  const boardLabel = (b: Board) => (b === "all" ? t.allTime : t.boardGames[b]);

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
        className="board-chips"
        style={{
          margin: "18px 0 10px",
          padding: "0 24px",
          display: "flex",
          gap: 8,
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {boards.map((b) => {
          const on = board === b;
          return (
            <button
              key={b}
              onClick={() => g.setBoard(b)}
              style={{
                flex: "none",
                height: 38,
                padding: "0 17px",
                border: 0,
                borderRadius: 999,
                background: on ? C.wine : "rgba(110,44,62,.07)",
                color: on ? C.paper : C.wine,
                font: "600 13px var(--font-sans)",
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              {boardLabel(b)}
            </button>
          );
        })}
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
        {!g.s.boardLoading && leaders.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: "#A8A49A",
              font: "400 14px var(--font-sans)",
              marginTop: 28,
            }}
          >
            {t.noScoreYet}
          </div>
        )}
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
