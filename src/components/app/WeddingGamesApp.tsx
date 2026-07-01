"use client";

import { LangProvider, useLang } from "./LangContext";
import { GameProvider, useGame } from "./game";
import { LangToggle, Loader, useRubberBand } from "./chrome";
import { ScheduleList } from "./ScheduleList";
import { Join } from "../screens/Join";
import { NamePick } from "../screens/NamePick";
import { Hub } from "../screens/Hub";
import { Wordle } from "../screens/Wordle";
import { Trivia } from "../screens/Trivia";
import { TwoTruths } from "../screens/TwoTruths";
import { Travel } from "../screens/Travel";
import { Connections } from "../screens/Connections";
import { Results } from "../screens/Results";
import { Leaderboard } from "../screens/Leaderboard";
import { C } from "@/lib/design/tokens";

function CurrentScreen() {
  const { s } = useGame();
  switch (s.screen) {
    case "join":
      return <Join />;
    case "namepick":
      return <NamePick />;
    case "hub":
      return <Hub />;
    case "wordle":
      return <Wordle />;
    case "trivia":
      return <Trivia />;
    case "two-truths":
      return <TwoTruths />;
    case "travel":
      return <Travel />;
    case "connections":
      return <Connections />;
    case "results":
      return <Results />;
    case "leaderboard":
      return <Leaderboard />;
    default:
      return <Hub />;
  }
}

/** Games / Board switch for the desktop band (the mobile TabBar is hidden ≥1024px). */
function DeskNav() {
  const g = useGame();
  const { t } = useLang();
  const onBoard = g.s.screen === "leaderboard";
  const item = (label: string, active: boolean, onClick: () => void) => (
    <button
      onClick={onClick}
      style={{
        padding: "7px 18px",
        borderRadius: 999,
        border: 0,
        cursor: "pointer",
        background: active ? C.wine : "transparent",
        color: active ? C.paper : C.wine,
        font: "600 12px var(--font-sans)",
        letterSpacing: ".02em",
      }}
    >
      {label}
    </button>
  );
  return (
    <nav
      style={{
        display: "inline-flex",
        background: "rgba(110,44,62,.07)",
        borderRadius: 999,
        padding: 3,
      }}
    >
      {item(t.gamesTab, !onBoard, g.goGames)}
      {item(t.boardTab, onBoard, g.goBoard)}
    </nav>
  );
}

/** Desktop identity band (hidden below 1024px via CSS). */
function DeskHead() {
  const g = useGame();
  const { t } = useLang();
  return (
    <header className="deskhead">
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            font: "500 30px var(--font-serif)",
            color: C.wine,
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          V <span style={{ fontStyle: "italic", color: C.taupe }}>&amp;</span> C
        </div>
        <div
          style={{ width: 1, height: 28, background: "rgba(110,44,62,.18)" }}
        />
        <div>
          <div
            style={{
              font: "500 18px var(--font-serif)",
              color: C.ink,
              lineHeight: 1.1,
            }}
          >
            {t.hello}, {g.s.user}
          </div>
          <div
            style={{
              font: "600 10px var(--font-sans)",
              letterSpacing: ".2em",
              textTransform: "uppercase",
              color: C.sage,
              marginTop: 3,
            }}
          >
            {t.date}
          </div>
        </div>
      </div>
      <DeskNav />
      <LangToggle />
    </header>
  );
}

/** Desktop companion rail (hidden below 1024px via CSS). */
function Rail() {
  const { t } = useLang();
  return (
    <aside className="rail">
      <div
        style={{
          background: "#fff",
          borderRadius: 22,
          padding: "20px 20px 12px",
          boxShadow: "0 12px 34px rgba(90,35,51,.10)",
          border: "1px solid rgba(110,44,62,.06)",
        }}
      >
        <div
          style={{
            font: "600 12px var(--font-sans)",
            letterSpacing: ".18em",
            textTransform: "uppercase",
            color: C.taupe,
            marginBottom: 14,
          }}
        >
          {t.theDays}
        </div>
        <ScheduleList compact />
      </div>
    </aside>
  );
}

function Shell() {
  const { s } = useGame();
  const preAuth = s.screen === "join" || s.screen === "namepick";
  const showChrome = !preAuth;
  const paperRef = useRubberBand<HTMLDivElement>();

  return (
    <div className="stage">
      {showChrome && <DeskHead />}
      <div className="deskbody">
        <div
          ref={paperRef}
          className="paper"
          style={{
            maxWidth: 430,
            width: "100%",
            margin: "0 auto",
            position: "relative",
            color: C.ink,
            // Mobile scrolls the window, so the paper must NOT be a scroll
            // container or the sticky hero/tab bar would pin to it (which never
            // scrolls) instead of the viewport. Tablet/desktop override this to
            // overflow:auto via media query and become the scroller themselves.
            overflow: "visible",
            boxShadow: "0 0 60px rgba(90,35,51,.10)",
          }}
        >
          {(s.loading || s.booting) && <Loader />}
          <CurrentScreen />
        </div>
        {showChrome && <Rail />}
      </div>
    </div>
  );
}

export function WeddingGamesApp() {
  return (
    <LangProvider>
      <GameProvider>
        <Shell />
      </GameProvider>
    </LangProvider>
  );
}
