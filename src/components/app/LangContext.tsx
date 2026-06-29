"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { STR, type Lang, type Strings } from "@/lib/strings";

interface LangCtx {
  lang: Lang;
  t: Strings;
  toggle: () => void;
  setLang: (l: Lang) => void;
}

const Ctx = createContext<LangCtx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const value: LangCtx = {
    lang,
    t: STR[lang],
    toggle: () => setLang((l) => (l === "en" ? "fr" : "en")),
    setLang,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLang(): LangCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useLang must be used within LangProvider");
  return v;
}
