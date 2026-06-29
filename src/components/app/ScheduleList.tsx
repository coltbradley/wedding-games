"use client";

import { useGame, GAME_ORDER, TODAY_DAY } from "./game";
import { useLang } from "./LangContext";
import { GAME_META, tx } from "@/lib/games/view";
import { C } from "@/lib/design/tokens";

const TOTAL: Record<string, number> = {
  wordle: 6,
  trivia: 6,
  "two-truths": 5,
  travel: 10,
  connections: 4,
};

/** The five-day schedule, shown in the hub (full) and the desktop rail (compact). */
export function ScheduleList({ compact = false }: { compact?: boolean }) {
  const g = useGame();
  const { lang, t } = useLang();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: compact ? 9 : 10,
      }}
    >
      {GAME_ORDER.map((id) => {
        const meta = GAME_META[id];
        const title = tx(meta.title, lang);
        const done = g.s.done[id];

        let bg: string = "#fff";
        let border: string = "1px solid rgba(110,44,62,.10)";
        let shadow: string = "0 3px 12px rgba(90,35,51,.05)";
        let iconBg: string = C.bg;
        let iconFg: string = C.taupe;
        let icon = String(meta.day);
        let titleColor: string = C.ink;
        let sub = t.playable;
        let subColor: string = C.taupe;
        let chev: string = "#C8A86E";
        let arrow: string = "→";

        if (done != null) {
          bg = "#fff";
          border = "1px solid rgba(110,44,62,.08)";
          shadow = "none";
          iconBg = "#E7ECDF";
          iconFg = "#5C6B4E";
          icon = "✓";
          titleColor = C.ink;
          subColor = C.sage;
          chev = "#A8A49A";
          arrow = "↺";
          if (id === "wordle")
            sub =
              done === "X"
                ? lang === "fr"
                  ? "Terminé"
                  : "Played"
                : `${t.solvedIn} ${done}`;
          else if (id === "connections")
            sub = `${done}/4 · ${t.dayWord} ${meta.day}`;
          else sub = `${done}/${TOTAL[id]} ${t.rightWord}`;
        } else if (meta.day === TODAY_DAY) {
          bg = C.wine;
          border = `1.5px solid ${C.wine}`;
          shadow = "0 6px 18px rgba(110,44,62,.16)";
          iconBg = C.paper;
          iconFg = C.wine;
          titleColor = C.paper;
          sub = t.playable;
          subColor = "#FEC59A";
          chev = C.paper;
        }

        const padding = compact ? "10px 13px" : "12px 16px";
        const iconSize = compact ? 34 : 40;

        return (
          <button
            key={id}
            onClick={() => g.openGame(id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: compact ? 12 : 14,
              textAlign: "left",
              width: "100%",
              background: bg,
              border,
              borderRadius: compact ? 14 : 16,
              padding,
              boxShadow: shadow,
            }}
          >
            <div
              style={{
                width: iconSize,
                height: iconSize,
                flex: "none",
                borderRadius: compact ? 10 : 12,
                background: iconBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: iconFg,
                font: `600 ${compact ? 14 : 16}px var(--font-serif)`,
              }}
            >
              {icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  font: `600 ${compact ? 13 : 15}px var(--font-sans)`,
                  color: titleColor,
                  whiteSpace: compact ? "nowrap" : "normal",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {compact ? title : `${t.dayWord} ${meta.day} · ${title}`}
              </div>
              <div
                style={{
                  font: `500 ${compact ? 11 : 12}px var(--font-sans)`,
                  color: subColor,
                }}
              >
                {compact ? `${t.dayWord} ${meta.day} · ${sub}` : sub}
              </div>
            </div>
            <span
              style={{
                font: `600 ${compact ? 15 : 17}px var(--font-sans)`,
                color: chev,
              }}
            >
              {arrow}
            </span>
          </button>
        );
      })}
    </div>
  );
}
