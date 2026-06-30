"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "./LangContext";
import { C } from "@/lib/design/tokens";

/**
 * Scroll-driven collapse. Returns a ref to attach to the collapsing element and
 * a progress value p (0 = fully expanded at the top, 1 = fully collapsed after
 * scrolling `distance`px). Works on both layouts: mobile scrolls the window,
 * tablet/desktop scrolls the nearest `.paper` ancestor (overflow:auto).
 */
export function useCollapse(distance = 130) {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let scroller: HTMLElement | Window = window;
    let n: HTMLElement | null = el.parentElement;
    while (n) {
      const oy = getComputedStyle(n).overflowY;
      if (oy === "auto" || oy === "scroll") {
        scroller = n;
        break;
      }
      n = n.parentElement;
    }
    const read = () =>
      scroller === window
        ? window.scrollY
        : (scroller as HTMLElement).scrollTop;
    const onScroll = () => setP(Math.min(1, Math.max(0, read() / distance)));
    onScroll();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [distance]);
  return { ref, p };
}

/** Linear interpolate between a (p=0) and b (p=1). */
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/**
 * Rubber-band overscroll. Attach the returned ref to the scroll surface; when
 * the user drags or flicks past the top or bottom edge, the surface follows
 * with diminishing give and then springs back. Works whether the surface
 * itself scrolls (the tablet/desktop `.paper`, an overflow:auto box) or the
 * window does (mobile, where `.paper` is overflow:visible). Normal scrolling is
 * never intercepted — the gesture is only caught once you are already at an
 * edge and still pushing past it. Honours prefers-reduced-motion.
 */
export function useRubberBand<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const LIMIT = 92; // furthest the surface can be pulled, in px
    let offset = 0;
    let rawPull = 0;
    let touchY = 0;
    let pulling = false;
    let wheelTimer: ReturnType<typeof setTimeout> | null = null;

    // The element that actually scrolls depends on the breakpoint, so resolve it
    // per gesture rather than caching it.
    const scroller = (): HTMLElement | Window => {
      const oy = getComputedStyle(el).overflowY;
      return oy === "auto" || oy === "scroll" ? el : window;
    };
    const edges = () => {
      const sc = scroller();
      if (sc === window) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        return {
          atTop: window.scrollY <= 0,
          atBottom: window.scrollY >= max - 1,
        };
      }
      const e = sc as HTMLElement;
      const max = e.scrollHeight - e.clientHeight;
      return { atTop: e.scrollTop <= 0, atBottom: e.scrollTop >= max - 1 };
    };
    // Diminishing give: asymptotically approaches LIMIT however hard you pull.
    const damp = (raw: number) => {
      const dir = Math.sign(raw);
      const x = Math.abs(raw);
      return dir * LIMIT * (1 - 1 / (x / LIMIT + 1));
    };
    const set = (v: number) => {
      offset = v;
      el.style.transform = v ? `translate3d(0,${v.toFixed(2)}px,0)` : "";
    };
    const release = () => {
      pulling = false;
      rawPull = 0;
      if (wheelTimer) {
        clearTimeout(wheelTimer);
        wheelTimer = null;
      }
      if (offset === 0) {
        el.style.willChange = "";
        return;
      }
      el.style.transition = "transform .55s cubic-bezier(.22,1.3,.4,1)";
      set(0);
      const done = () => {
        el.style.transition = "";
        el.style.willChange = "";
        el.removeEventListener("transitionend", done);
      };
      el.addEventListener("transitionend", done);
    };

    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
      rawPull = 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const dy = e.touches[0].clientY - touchY;
      const { atTop, atBottom } = edges();
      if ((atTop && dy > 0) || (atBottom && dy < 0)) {
        if (!pulling) {
          pulling = true;
          el.style.transition = "";
          el.style.willChange = "transform";
        }
        rawPull = dy;
        e.preventDefault(); // take over from native scroll/bounce at the edge
        set(damp(rawPull));
      } else if (pulling) {
        release();
      }
    };
    const onWheel = (e: WheelEvent) => {
      const { atTop, atBottom } = edges();
      const dy = e.deltaY;
      if ((atTop && dy < 0) || (atBottom && dy > 0)) {
        el.style.transition = "";
        el.style.willChange = "transform";
        rawPull += -dy; // pushing up at the top reads as a positive pull
        e.preventDefault();
        set(damp(rawPull));
        if (wheelTimer) clearTimeout(wheelTimer);
        wheelTimer = setTimeout(release, 90); // spring back when the flick stops
      } else if (offset !== 0 && !wheelTimer) {
        set(0);
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", release, { passive: true });
    el.addEventListener("touchcancel", release, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", release);
      el.removeEventListener("touchcancel", release);
      el.removeEventListener("wheel", onWheel);
      if (wheelTimer) clearTimeout(wheelTimer);
    };
  }, []);
  return ref;
}

/** EN / FR pill toggle. */
export function LangToggle({ pad = "5px 12px" }: { pad?: string }) {
  const { lang, toggle } = useLang();
  const en = lang === "en";
  return (
    <button
      onClick={toggle}
      style={{
        display: "inline-flex",
        background: "rgba(110,44,62,.07)",
        border: 0,
        borderRadius: 999,
        padding: 3,
        font: "600 11px var(--font-sans)",
      }}
    >
      <span
        style={{
          padding: pad,
          borderRadius: 999,
          background: en ? C.wine : "transparent",
          color: en ? C.paper : C.wine,
        }}
      >
        EN
      </span>
      <span
        style={{
          padding: pad,
          borderRadius: 999,
          background: en ? "transparent" : C.wine,
          color: en ? C.wine : C.paper,
        }}
      >
        FR
      </span>
    </button>
  );
}

/** Watercolour hero band at the top of each game screen, with back + language. */
export function GameHero({
  hero,
  day,
  title,
  onBack,
}: {
  hero: string;
  day: number;
  title: string;
  onBack: () => void;
}) {
  const { t } = useLang();
  // Tall watercolour at the top; collapses to a slim sticky band as the game
  // content scrolls under it. Stays put on screens that don't overflow.
  const { ref, p } = useCollapse(150);
  const height = lerp(188, 92, p);
  return (
    <div
      ref={ref}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 6,
        height,
        flex: "none",
        overflow: "hidden",
      }}
    >
      {/* watercolour gradient shows through if the photo is absent */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(60% 80% at 30% 20%,rgba(243,158,101,.5),transparent 70%),radial-gradient(60% 80% at 80% 60%,rgba(138,154,123,.5),transparent 70%),#C9B79B",
        }}
      />
      <img
        src={hero}
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: `center ${lerp(38, 50, p)}%`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg,rgba(42,30,20,.22) 0%,transparent 34%,rgba(110,44,62,.5) 100%)",
        }}
      />
      <button
        onClick={onBack}
        aria-label="Back"
        style={{
          position: "absolute",
          left: 16,
          top: 14,
          width: 32,
          height: 32,
          border: 0,
          borderRadius: 999,
          background: "rgba(255,255,255,.85)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          font: "600 17px var(--font-sans)",
          color: C.wine,
        }}
      >
        ‹
      </button>
      <div style={{ position: "absolute", right: 14, top: 14 }}>
        <LangToggle pad="4px 8px" />
      </div>
      <div
        style={{
          position: "absolute",
          left: 20,
          bottom: 11,
          transform: `scale(${lerp(1, 0.82, p)})`,
          transformOrigin: "left bottom",
        }}
      >
        <div
          style={{
            font: "600 10px var(--font-sans)",
            letterSpacing: ".18em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,.92)",
          }}
        >
          {t.dayWord} {day}
        </div>
        <div
          style={{
            font: "500 26px var(--font-serif)",
            color: "#fff",
            textShadow: "0 1px 6px rgba(60,20,30,.45)",
            lineHeight: 1.04,
          }}
        >
          {title}
        </div>
      </div>
    </div>
  );
}

/** Sticky bottom navigation (mobile/tablet only; hidden on desktop via CSS). */
export function TabBar({
  active,
  onGames,
  onBoard,
}: {
  active: "games" | "board";
  onGames: () => void;
  onBoard: () => void;
}) {
  const { t } = useLang();
  const col = (on: boolean) => (on ? C.wine : "#B4ABA0");
  return (
    <div
      className="tabbar"
      style={{
        position: "sticky",
        bottom: 0,
        zIndex: 5,
        display: "flex",
        background: "rgba(251,247,240,.92)",
        backdropFilter: "blur(10px)",
        borderTop: "1px solid rgba(110,44,62,.1)",
        padding: "10px 28px 16px",
      }}
    >
      <button
        onClick={onGames}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          background: "none",
          border: 0,
          color: col(active === "games"),
          font: "600 11px var(--font-sans)",
          letterSpacing: ".03em",
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 11l9-8 9 8" />
          <path d="M5 10v10h14V10" />
        </svg>
        {t.gamesTab}
      </button>
      <button
        onClick={onBoard}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          background: "none",
          border: 0,
          color: col(active === "board"),
          font: "600 11px var(--font-sans)",
          letterSpacing: ".03em",
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7 4h10v3a5 5 0 0 1-10 0V4z" />
          <path d="M17 5h2.5a1 1 0 0 1 1 1.2A4 4 0 0 1 16 10M7 5H4.5a1 1 0 0 0-1 1.2A4 4 0 0 0 8 10" />
          <path d="M9 21h6M12 14v7" />
        </svg>
        {t.boardTab}
      </button>
    </div>
  );
}

/** Bloom loader shown briefly on game open. */
export function Loader() {
  const { t } = useLang();
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 30,
        background: C.paper,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 22,
      }}
    >
      <div
        style={{
          width: 130,
          height: 130,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 50% 44%,rgba(243,158,101,.6),transparent 60%),radial-gradient(circle at 38% 62%,rgba(110,44,62,.42),transparent 62%),radial-gradient(circle at 64% 60%,rgba(138,154,123,.55),transparent 60%)",
          filter: "blur(7px)",
          animation: "bloomPulse 1.25s ease-in-out infinite",
        }}
      />
      <div style={{ font: "italic 500 20px var(--font-serif)", color: C.wine }}>
        {t.loadingWord}
      </div>
    </div>
  );
}
