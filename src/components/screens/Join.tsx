"use client";

import { useGame } from "../app/game";
import { useLang } from "../app/LangContext";
import { LangToggle } from "../app/chrome";
import { C } from "@/lib/design/tokens";

export function Join() {
  const g = useGame();
  const { t } = useLang();
  const s = g.s;

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
            textAlign: "left",
          }}
        >
          <label
            style={{ font: "600 13px var(--font-sans)", color: "#6E6E6A" }}
          >
            {t.email}
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 8,
              background: "#fff",
              border: `1.5px solid ${s.emailErr ? "#C0584A" : "rgba(110,44,62,.18)"}`,
              borderRadius: 16,
              padding: "4px 4px 4px 16px",
              boxShadow: "0 2px 8px rgba(90,35,51,.05)",
            }}
          >
            <input
              value={s.email}
              onChange={(e) => g.onEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && g.enter()}
              placeholder={t.emailPh}
              inputMode="email"
              style={{
                flex: 1,
                border: 0,
                background: "transparent",
                font: "500 16px var(--font-sans)",
                color: C.ink,
                outline: "none",
                minWidth: 0,
              }}
            />
            <button
              onClick={g.enter}
              aria-label="Enter"
              style={{
                width: 48,
                height: 48,
                border: 0,
                borderRadius: 13,
                background: C.wine,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="22"
                height="22"
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
          </div>
          <p
            style={{
              font: "400 13px/1.5 var(--font-sans)",
              color: s.emailErr ? "#C0584A" : "#A8A49A",
              marginTop: 12,
              textAlign: "center",
            }}
          >
            {s.emailErr ? t.emailBad : t.noPw}
          </p>
        </div>
      </div>
    </div>
  );
}
