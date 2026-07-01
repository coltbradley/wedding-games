"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { STR, type Lang, type Strings } from "@/lib/strings";

interface LangCtx {
  lang: Lang;
  t: Strings;
  toggle: () => void;
  setLang: (l: Lang) => void;
}

const Ctx = createContext<LangCtx | null>(null);

const KEY = "wg-lang";

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  // Restore the guest's choice (or their browser language) after mount —
  // reading storage in the initializer would mismatch the server render.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored === "en" || stored === "fr") setLang(stored);
      else if (navigator.language?.toLowerCase().startsWith("fr"))
        setLang("fr");
    } catch {
      /* storage unavailable — default stands */
    }
  }, []);

  // Keep <html lang> honest for screen readers and translation prompts.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const pick = (l: Lang) => {
    setLang(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {
      /* best-effort */
    }
  };

  const value: LangCtx = {
    lang,
    t: STR[lang],
    toggle: () => pick(lang === "en" ? "fr" : "en"),
    setLang: pick,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLang(): LangCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useLang must be used within LangProvider");
  return v;
}
