"use client";

import type { ReactNode } from "react";
import { useGame } from "../app/game";
import { useLang } from "../app/LangContext";
import {
  GAME_META,
  GAME_ORDER,
  travelView,
  triviaView,
  twoTruthsView,
  tx,
  wordleView,
} from "@/lib/games/view";
import { evalRow, CONN_STYLE } from "@/lib/games/logic";
import { C, SQ } from "@/lib/design/tokens";
import { SCORING } from "@/lib/scoring/config";
import { fmt } from "@/lib/strings";

const COK = C.sage;
const CNO = "#CFC6B6";

function Row({ colors, dim }: { colors: string[]; dim?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 5,
        justifyContent: "center",
        opacity: dim ? 0.38 : 1,
      }}
    >
      {colors.map((c, i) => (
        <i
          key={i}
          style={{
            width: 22,
            height: 22,
            borderRadius: 5,
            background: c,
            display: "block",
          }}
        />
      ))}
    </div>
  );
}

/** Verdict line for score-out-of-total games, shared across trivia/truths/travel. */
function verdict(
  frac: number,
  t: { beautifullyDone: string; nicelyPlayed: string; nextTime: string },
  top?: string,
): string {
  if (frac >= 0.8) return top ?? t.beautifullyDone;
  if (frac >= 0.5) return t.nicelyPlayed;
  return t.nextTime;
}

export function Results() {
  const g = useGame();
  const { lang, t } = useLang();
  const s = g.s;
  const lg = s.lastGame;
  const meta = GAME_META[lg];
  const dayOf = GAME_ORDER.indexOf(lg) + 1;
  const score = g.scoreOf(lg);

  let eyebrow = `${t.dayWord} ${dayOf}`;
  let title = "";
  let headline = "";
  let grid: ReactNode = null;
  const caption =
    lg === "connections" || lg === "wordle"
      ? t.spoilerFree
      : lg === "travel"
        ? t.captionScoreOnly
        : t.captionScoreFriends;

  if (lg === "wordle") {
    const ans = wordleView(s.wordle.lang ?? lang).answer;
    const won = s.wordle.guesses.includes(ans);
    const tries = s.wordle.guesses.length;
    eyebrow = won
      ? `${t.solvedIn} ${tries} · ${t.dayWord} 1`
      : `${t.dayWord} 1`;
    title = won ? fmt(t.bravoName, { name: s.user }) : t.nextTime;
    headline = `${tx(meta.title, lang)} · ${won ? tries : "X"}/6`;
    grid = (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 5,
          alignItems: "center",
        }}
      >
        {s.wordle.guesses.map((guess, ri) => (
          <Row key={ri} colors={evalRow(guess, ans).map((x) => SQ[x].bg)} />
        ))}
      </div>
    );
  } else if (lg === "connections") {
    const found = s.conn.solved.filter((x) => !x.revealed);
    const failed = found.length < 4;
    title = failed
      ? t.nextTime
      : s.conn.mistakes === 0
        ? t.flawless
        : t.solvedBang;
    headline = `${tx(meta.title, lang)} · ${found.length}/4 · ${s.conn.mistakes} ${t.mistakesWord}`;
    grid = (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 5,
          alignItems: "center",
        }}
      >
        {s.conn.solved.map((sv, i) => (
          <Row
            key={i}
            colors={Array(4).fill(CONN_STYLE[sv.g].bg)}
            dim={sv.revealed}
          />
        ))}
      </div>
    );
  } else if (lg === "travel") {
    const items = travelView();
    let frRight = 0,
      frTot = 0,
      slRight = 0,
      slTot = 0;
    items.forEach((it, i) => {
      const ok = s.travel.picks[i] === it.answer;
      if (it.answer === "france") {
        frTot++;
        if (ok) frRight++;
      } else {
        slTot++;
        if (ok) slRight++;
      }
    });
    const tally = (label: string, r: number, tot: number) => (
      <div style={{ flex: 1, textAlign: "center" }}>
        <div
          style={{
            font: "600 11px var(--font-sans)",
            letterSpacing: ".14em",
            textTransform: "uppercase",
            color: C.taupe,
          }}
        >
          {label}
        </div>
        <div
          style={{
            font: "500 34px var(--font-serif)",
            color: C.wine,
            marginTop: 3,
            lineHeight: 1,
          }}
        >
          {r}/{tot}
        </div>
        <div
          style={{
            font: "500 11px var(--font-sans)",
            color: C.stone,
            marginTop: 3,
          }}
        >
          {t.placedRight}
        </div>
      </div>
    );
    const tot = items.length;
    title = verdict((score as number) / tot, t, t.wellTravelled);
    headline = `${tx(meta.title, lang)} · ${score}/${tot} ${t.rightWord}`;
    grid = (
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          width: "100%",
        }}
      >
        {tally(t.france, frRight, frTot)}
        <div
          style={{
            width: 1,
            alignSelf: "stretch",
            background: "rgba(110,44,62,.14)",
          }}
        />
        {tally(t.srilanka, slRight, slTot)}
      </div>
    );
  } else {
    const tot = lg === "trivia" ? triviaView().length : twoTruthsView().length;
    const oks =
      lg === "trivia"
        ? triviaView().map((q, i) => s.trivia.picks[i] === q.answerIndex)
        : twoTruthsView().map((r, i) => s.tt.picks[i] === r.lieIndex);
    title = verdict((score as number) / tot, t);
    headline = `${tx(meta.title, lang)} · ${score}/${tot} ${t.rightWord}`;
    grid = (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 5,
          alignItems: "center",
        }}
      >
        <Row colors={oks.map((ok) => (ok ? COK : CNO))} />
      </div>
    );
  }

  // Persistence status for THIS card only — a result card must be honest
  // about whether the score actually landed (see docs/LESSONS.md).
  const save = s.save?.id === lg ? s.save.st : null;

  return (
    <div
      className="screen"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "36px 26px",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 48,
          left: "50%",
          transform: "translateX(-50%)",
          width: 300,
          height: 300,
          filter: "blur(8px)",
          background:
            "radial-gradient(circle at 50% 45%,rgba(243,158,101,.5),transparent 60%),radial-gradient(circle at 38% 60%,rgba(110,44,62,.32),transparent 62%),radial-gradient(circle at 64% 58%,rgba(138,154,123,.4),transparent 60%)",
          animation: "bloom 1.2s cubic-bezier(.22,1,.36,1) both",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <div
          style={{
            font: "500 13px var(--font-sans)",
            letterSpacing: ".2em",
            textTransform: "uppercase",
            color: C.sage,
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            font: "500 38px/1 var(--font-serif)",
            color: C.wine,
            marginTop: 8,
          }}
        >
          {title}
        </div>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          marginTop: 26,
          width: "100%",
          background: "#fff",
          borderRadius: 22,
          boxShadow: "0 14px 36px rgba(90,35,51,.16)",
          border: "1px solid rgba(110,44,62,.08)",
          padding: "24px 22px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            font: "500 30px var(--font-serif)",
            color: C.wine,
            whiteSpace: "nowrap",
            lineHeight: 1,
          }}
        >
          V <span style={{ fontStyle: "italic", color: C.taupe }}>&amp;</span> C
        </div>
        <div
          style={{
            font: "600 11px var(--font-sans)",
            letterSpacing: ".16em",
            textTransform: "uppercase",
            color: C.taupe,
            marginTop: 12,
          }}
        >
          {headline}
        </div>
        <div
          style={{
            margin: "14px 0 4px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 5,
          }}
        >
          {grid}
        </div>
        <div
          style={{
            font: "italic 500 18px var(--font-serif)",
            color: C.ink,
            marginTop: 12,
          }}
        >
          Colt &amp; Valentine · 05.08
        </div>
        {s.dayBonus[lg] && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginTop: 12,
              padding: "5px 13px",
              borderRadius: 999,
              background: "rgba(138,154,123,.14)",
              border: "1px solid rgba(138,154,123,.4)",
              font: "600 12px var(--font-sans)",
              color: "#5C6B4E",
            }}
          >
            ✿ {fmt(t.dayOfBonus, { pts: SCORING.DAY_OF_BONUS })}
          </div>
        )}
      </div>

      {save && (
        <div
          style={{
            position: "relative",
            zIndex: 1,
            marginTop: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            font: "500 13px var(--font-sans)",
            color: save === "error" ? C.error : C.sage,
          }}
        >
          {save === "saving" && t.scoreSaving}
          {save === "saved" && `✓ ${t.scoreSaved}`}
          {save === "error" && (
            <>
              {t.scoreSaveFailed}
              <button
                onClick={g.retrySave}
                style={{
                  background: "none",
                  border: 0,
                  padding: 0,
                  color: C.wine,
                  font: "600 13px var(--font-sans)",
                  textDecoration: "underline",
                }}
              >
                {t.retry}
              </button>
            </>
          )}
        </div>
      )}

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          gap: 10,
          width: "100%",
          marginTop: save ? 14 : 22,
        }}
      >
        <button
          onClick={g.copyShare}
          style={{
            flex: 1,
            height: 54,
            borderRadius: 16,
            border: 0,
            background: C.wine,
            color: C.paper,
            font: "600 15px var(--font-sans)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={C.paper}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="9" y="9" width="11" height="11" rx="2" />
            <path d="M5 15V5a2 2 0 0 1 2-2h10" />
          </svg>
          {s.copied ? t.copied : t.copy}
        </button>
        <button
          onClick={g.goHub}
          style={{
            flex: 1,
            height: 54,
            borderRadius: 16,
            border: "1.5px solid rgba(110,44,62,.25)",
            background: "transparent",
            color: C.wine,
            font: "600 15px var(--font-sans)",
          }}
        >
          {t.backToGames}
        </button>
      </div>

      {s.shareFallback && (
        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            marginTop: 12,
            textAlign: "left",
          }}
        >
          <div
            style={{
              font: "500 12px var(--font-sans)",
              color: C.slate,
              marginBottom: 6,
            }}
          >
            {t.shareManual}
          </div>
          <pre
            style={{
              margin: 0,
              padding: "12px 14px",
              background: "#fff",
              border: "1px solid rgba(110,44,62,.12)",
              borderRadius: 12,
              font: "500 13px/1.5 var(--font-sans)",
              whiteSpace: "pre-wrap",
              userSelect: "all",
              WebkitUserSelect: "all",
            }}
          >
            {s.shareFallback}
          </pre>
        </div>
      )}

      <div
        style={{
          position: "relative",
          zIndex: 1,
          font: "400 13px var(--font-sans)",
          color: C.stone,
          marginTop: 14,
          textAlign: "center",
        }}
      >
        {caption}
      </div>

      <button
        onClick={g.goBoard}
        style={{
          position: "relative",
          zIndex: 1,
          marginTop: 18,
          background: "none",
          border: 0,
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          font: "600 14px var(--font-sans)",
          color: C.blue,
        }}
      >
        {t.viewBoard}
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke={C.blue}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </button>
    </div>
  );
}
