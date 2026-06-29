"use client";

import { useGame } from "../app/game";
import { useLang } from "../app/LangContext";
import { LangToggle } from "../app/chrome";
import { C } from "@/lib/design/tokens";

export function Join() {
  const g = useGame();
  const { t } = useLang();

  return (
    <div
      className="screen"
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <div
        style={{
          position: "relative",
          height: 340,
          flex: "none",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(70% 60% at 40% 24%,rgba(243,158,101,.55),transparent 70%),radial-gradient(60% 70% at 80% 50%,rgba(138,154,123,.5),transparent 72%),#C9B79B",
          }}
        />
        <img
          src="/assets/chateau-hero.jpg"
          alt="Watercolour château in Burgundy"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 26%",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg,transparent 38%,rgba(251,247,240,.5) 66%,rgba(251,247,240,.92) 88%,#FBF7F0 100%)",
          }}
        />
        <div style={{ position: "absolute", top: 18, right: 18 }}>
          <LangToggle pad="5px 11px" />
        </div>
      </div>
      <div
        style={{
          padding: "2px 30px 36px",
          textAlign: "center",
          position: "relative",
          marginTop: -30,
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 50,
            left: "50%",
            transform: "translateX(-50%)",
            width: 230,
            height: 230,
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(243,158,101,.22),rgba(138,154,123,.12) 50%,transparent 72%)",
            filter: "blur(32px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            font: "600 12px var(--font-sans)",
            letterSpacing: ".22em",
            textTransform: "uppercase",
            color: C.sage,
          }}
        >
          {t.date}
        </div>
        <div
          style={{
            position: "relative",
            zIndex: 1,
            font: "500 60px/0.98 var(--font-serif)",
            color: C.wine,
            margin: "14px 0 2px",
          }}
        >
          Colt
          <br />
          <span
            style={{
              fontStyle: "italic",
              fontSize: 32,
              color: C.taupe,
              display: "inline-block",
              margin: "2px 0",
            }}
          >
            &amp;
          </span>
          <br />
          Valentine
        </div>
        <p
          style={{
            position: "relative",
            zIndex: 1,
            font: "400 17px/1.55 var(--font-sans)",
            color: "#4A4A46",
            margin: "18px auto 0",
            maxWidth: 290,
          }}
        >
          {t.tagline}{" "}
          <span
            style={{
              fontStyle: "italic",
              fontFamily: "var(--font-serif)",
              fontSize: 20,
              color: C.wine,
            }}
          >
            {t.ido}
          </span>
        </p>
        <div
          style={{
            position: "relative",
            zIndex: 1,
            marginTop: "auto",
            paddingTop: 28,
          }}
        >
          <button
            onClick={g.goNamePick}
            style={{
              width: "100%",
              height: 56,
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
            {t.findName}
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
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
          <p
            style={{
              font: "400 13px/1.5 var(--font-sans)",
              color: "#A8A49A",
              marginTop: 12,
              textAlign: "center",
            }}
          >
            {t.noPw}
          </p>
        </div>
      </div>
    </div>
  );
}
