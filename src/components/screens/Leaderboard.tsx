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
  // all-time is the cumulative total across every game played. Ordering is
  // deterministic (docs/SCORING.md): points, then games played, then total
  // time, then earliest first result, then name — no coin-flip ties at the
  // reception reveal.
  const leaders = g.s.leaders
    .filter((p) => (board === "all" ? p.gamesPlayed > 0 : p.byGame[board]))
    .map((p) => ({
      name: p.name,
      val: board === "all" ? p.all : (p.byGame[board]?.score ?? 0),
      elapsed:
        board === "all" ? p.totalElapsedMs : (p.byGame[board]?.elapsedMs ?? 0),
      games: p.gamesPlayed,
      first: p.firstResultAt,
      me: p.me,
      id: p.id,
    }))
    .sort(
      (a, b) =>
        b.val - a.val ||
        b.games - a.games ||
        a.elapsed - b.elapsed ||
        a.first.localeCompare(b.first) ||
        a.name.localeCompare(b.name),
    )
    .map((p, i) => ({ ...p, rank: i + 1 }));

  const boards: Board[] = ["all", ...GAME_ORDER];
  const boardLabel = (b: Board) => (b === "all" ? t.allTime : t.boardGames[b]);

  return (
    <div
      className="screen"
      style={{
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
        {g.s.boardLoading &&
          [0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              aria-hidden
              style={{
                display: "flex",
                alignItems: "center",
                gap: 13,
                background: "#fff",
                border: "1px solid rgba(110,44,62,.06)",
                borderRadius: 14,
                padding: "11px 15px",
                animation: "boardPulse 1.3s ease-in-out infinite",
                animationDelay: `${i * 0.12}s`,
              }}
            >
              <div style={{ width: 22 }} />
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: C.bg,
                }}
              />
              <div
                style={{
                  flex: 1,
                  height: 12,
                  borderRadius: 6,
                  background: C.bg,
                  maxWidth: 140,
                }}
              />
              <div
                style={{
                  width: 48,
                  height: 12,
                  borderRadius: 6,
                  background: C.bg,
                }}
              />
            </div>
          ))}

        {!g.s.boardLoading && g.s.boardErr && (
          <div style={{ textAlign: "center", marginTop: 28 }}>
            <div
              style={{
                color: C.stone,
                font: "400 14px var(--font-sans)",
                marginBottom: 12,
              }}
            >
              {t.boardFailed}
            </div>
            <button
              onClick={g.goBoard}
              style={{
                height: 40,
                padding: "0 22px",
                border: "1.5px solid rgba(110,44,62,.25)",
                borderRadius: 999,
                background: "transparent",
                color: C.wine,
                font: "600 13px var(--font-sans)",
              }}
            >
              {t.retry}
            </button>
          </div>
        )}

        {!g.s.boardLoading && !g.s.boardErr && leaders.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: C.stone,
              font: "400 14px var(--font-sans)",
              marginTop: 28,
            }}
          >
            {t.noScoreYet}
          </div>
        )}

        {!g.s.boardLoading &&
          leaders.map((p, i) => (
            <div
              key={p.id}
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
                  color: p.me ? C.wine : C.stone,
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
                  background: p.me ? C.wine : i < 3 ? C.sage : C.sand,
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
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
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
                  color: p.me ? C.wine : C.slate,
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
