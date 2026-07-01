"use client";

import { useGame } from "../app/game";
import { useLang } from "../app/LangContext";
import { LangToggle, TabBar, useCollapse, lerp } from "../app/chrome";
import { ScheduleList } from "../app/ScheduleList";
import { GAME_META, tx } from "@/lib/games/view";
import { SCHEDULE, unlockDateLabel } from "@/lib/games/registry";
import { C } from "@/lib/design/tokens";
import { fmt } from "@/lib/strings";

export function Hub() {
  const g = useGame();
  const { lang, t } = useLang();
  // Today's game follows the unlock schedule; before launch there is no game
  // yet and the hero becomes a countdown card.
  const day = g.s.unlockedDay;
  const featured = SCHEDULE.find((x) => x.day === day) ?? null;
  const meta = featured ? GAME_META[featured.id] : null;
  const featuredDone = featured ? g.s.done[featured.id] != null : false;
  // Bigger today's-game image that eases down a touch as the hub scrolls.
  const { ref: imgRef, p } = useCollapse(220);

  return (
    <div className="screen" style={{ paddingBottom: 88 }}>
      <div
        className="hubhead"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 24px 8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              font: "500 26px var(--font-serif)",
              color: C.wine,
              whiteSpace: "nowrap",
              lineHeight: 1,
            }}
          >
            V <span style={{ fontStyle: "italic", color: C.taupe }}>&amp;</span>{" "}
            C
          </div>
          <div style={{ font: "500 19px var(--font-serif)", color: C.ink }}>
            {t.hello}, {g.s.user}
          </div>
        </div>
        <LangToggle pad="4px 9px" />
      </div>

      <div style={{ padding: "6px 24px 0" }}>
        <div
          style={{
            font: "600 12px var(--font-sans)",
            letterSpacing: ".2em",
            textTransform: "uppercase",
            color: C.sage,
            margin: "8px 0 10px",
          }}
        >
          {meta ? `${t.todays} · ${t.dayWord} ${meta.day}` : t.comingSoonTitle}
        </div>

        <div
          style={{
            position: "relative",
            borderRadius: 24,
            overflow: "hidden",
            background: "#fff",
            boxShadow: "0 10px 30px rgba(90,35,51,.12)",
            border: "1px solid rgba(110,44,62,.08)",
          }}
        >
          <div
            ref={imgRef}
            style={{
              position: "relative",
              height: lerp(208, 150, p),
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(70% 80% at 30% 30%,rgba(243,158,101,.5),transparent 70%),#B7A07F",
              }}
            />
            <img
              src={meta ? meta.hero : "/assets/chateau.jpg"}
              alt=""
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center 42%",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg,rgba(1,28,47,.04) 0%,transparent 35%,rgba(42,30,20,.45) 100%)",
              }}
            />
            {meta && (
              <div
                style={{
                  position: "absolute",
                  right: 18,
                  top: 16,
                  background: "rgba(255,255,255,.85)",
                  borderRadius: 999,
                  padding: "5px 12px",
                  font: "600 11px var(--font-sans)",
                  color: C.wine,
                  letterSpacing: ".08em",
                }}
              >
                {t.dayWord} {meta.day}
              </div>
            )}
          </div>
          <div style={{ padding: "18px 20px 20px" }}>
            <div
              style={{ font: "500 30px/1.05 var(--font-serif)", color: C.ink }}
            >
              {meta
                ? tx(meta.title, lang)
                : fmt(t.comingSoonSub, { date: unlockDateLabel(1, lang) })}
            </div>
            {meta && (
              <button
                onClick={() => g.openGame(meta.id)}
                style={{
                  marginTop: 16,
                  width: "100%",
                  height: 54,
                  border: 0,
                  borderRadius: 16,
                  background: C.wine,
                  color: C.paper,
                  font: "600 16px var(--font-sans)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                {featuredDone ? t.resume : t.play}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={C.paper}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="9" opacity=".4" />
                  <line x1="8" y1="12" x2="15" y2="12" />
                  <polyline points="12 9 15 12 12 15" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div
          className="hub-days"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            margin: "22px 2px 12px",
          }}
        >
          <div
            style={{
              font: "600 12px var(--font-sans)",
              letterSpacing: ".18em",
              textTransform: "uppercase",
              color: C.taupe,
            }}
          >
            {t.theDays}
          </div>
        </div>
        <div className="hub-days">
          <ScheduleList />
        </div>

        {g.s.toast && (
          <div
            style={{
              marginTop: 16,
              textAlign: "center",
              font: "500 13px var(--font-sans)",
              color: "#8A6A2A",
              background: "#F6EBD3",
              border: "1px solid rgba(216,184,113,.5)",
              borderRadius: 12,
              padding: "10px 14px",
              animation: "fadeUp .25s ease",
            }}
          >
            {g.s.toast}
          </div>
        )}
      </div>

      <TabBar active="games" onGames={g.goGames} onBoard={g.goBoard} />
    </div>
  );
}
