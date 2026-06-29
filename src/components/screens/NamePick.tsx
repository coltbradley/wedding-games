"use client";

import { useState } from "react";
import { useGame } from "../app/game";
import { useLang } from "../app/LangContext";
import { LangToggle } from "../app/chrome";
import { requiresEventCode } from "@/lib/data";
import { C } from "@/lib/design/tokens";

export function NamePick() {
  const g = useGame();
  const { t } = useLang();
  const [query, setQuery] = useState("");

  const selected = g.s.roster.find((r) => r.id === g.s.selectedGuestId) ?? null;
  const filtered = query
    ? g.s.roster.filter((r) =>
        r.name.toLowerCase().includes(query.toLowerCase()),
      )
    : g.s.roster;

  const errText =
    g.s.signInErr === "bad-code"
      ? t.badCode
      : g.s.signInErr === "taken"
        ? t.nameTaken
        : g.s.signInErr === "unknown"
          ? t.signInProblem
          : "";

  return (
    <div
      className="screen"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: "26px 24px 28px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <button
          onClick={g.goJoin}
          aria-label="Back"
          style={{
            width: 34,
            height: 34,
            border: 0,
            borderRadius: 999,
            background: "rgba(110,44,62,.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            font: "600 18px var(--font-sans)",
            color: C.wine,
          }}
        >
          ‹
        </button>
        <LangToggle pad="4px 9px" />
      </div>

      <div
        style={{
          font: "500 32px/1.05 var(--font-serif)",
          color: C.wine,
          marginTop: 18,
        }}
      >
        {t.pickName}
      </div>
      <div
        style={{
          font: "400 14px var(--font-sans)",
          color: "#8A8A84",
          marginTop: 6,
        }}
      >
        {t.pickNameSub}
      </div>

      {!selected ? (
        <>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search}
            style={{
              marginTop: 18,
              width: "100%",
              height: 48,
              border: "1.5px solid rgba(110,44,62,.18)",
              borderRadius: 14,
              padding: "0 16px",
              background: "#fff",
              font: "500 16px var(--font-sans)",
              color: C.ink,
              outline: "none",
            }}
          />
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              marginTop: 14,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {filtered.map((r) => (
              <button
                key={r.id}
                onClick={() => g.selectGuest(r.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 13,
                  textAlign: "left",
                  width: "100%",
                  background: "#fff",
                  border: "1px solid rgba(110,44,62,.10)",
                  borderRadius: 14,
                  padding: "11px 15px",
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    flex: "none",
                    borderRadius: "50%",
                    background: "#E7DAC9",
                    color: C.wine,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    font: "500 18px var(--font-serif)",
                  }}
                >
                  {r.name.charAt(0)}
                </div>
                <div
                  style={{ font: "600 15px var(--font-sans)", color: C.ink }}
                >
                  {r.name}
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  color: "#A8A49A",
                  font: "400 14px var(--font-sans)",
                  marginTop: 20,
                }}
              >
                {t.noNames}
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 13,
              marginTop: 22,
              background: "rgba(110,44,62,.06)",
              border: `1.5px solid ${C.wine}`,
              borderRadius: 14,
              padding: "12px 15px",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                flex: "none",
                borderRadius: "50%",
                background: C.wine,
                color: C.paper,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                font: "500 18px var(--font-serif)",
              }}
            >
              {selected.name.charAt(0)}
            </div>
            <div
              style={{
                flex: 1,
                font: "600 16px var(--font-sans)",
                color: C.wine,
              }}
            >
              {selected.name}
            </div>
            <button
              onClick={() => g.selectGuest("")}
              style={{
                background: "none",
                border: 0,
                color: C.taupe,
                font: "600 13px var(--font-sans)",
              }}
            >
              {t.change}
            </button>
          </div>

          {requiresEventCode && (
            <>
              <label
                style={{
                  font: "600 13px var(--font-sans)",
                  color: "#6E6E6A",
                  marginTop: 24,
                }}
              >
                {t.eventCode}
              </label>
              <input
                value={g.s.eventCode}
                onChange={(e) => g.onEventCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && g.submitName()}
                placeholder={t.eventCodePh}
                inputMode="numeric"
                style={{
                  marginTop: 8,
                  width: "100%",
                  height: 52,
                  border: `1.5px solid ${errText ? "#C0584A" : "rgba(110,44,62,.18)"}`,
                  borderRadius: 14,
                  padding: "0 16px",
                  background: "#fff",
                  font: "500 18px var(--font-sans)",
                  letterSpacing: ".1em",
                  color: C.ink,
                  outline: "none",
                }}
              />
            </>
          )}
          {errText && (
            <div
              style={{
                font: "400 13px var(--font-sans)",
                color: "#C0584A",
                marginTop: 8,
              }}
            >
              {errText}
            </div>
          )}

          <button
            onClick={g.submitName}
            style={{
              marginTop: "auto",
              width: "100%",
              height: 56,
              border: 0,
              borderRadius: 16,
              background: C.wine,
              color: C.paper,
              font: "600 16px var(--font-sans)",
            }}
          >
            {requiresEventCode ? t.signIn : t.thatsMe}
          </button>
        </div>
      )}
    </div>
  );
}
