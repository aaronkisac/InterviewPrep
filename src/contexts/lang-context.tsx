"use client";

import { createContext, useContext, useState } from "react";

import type { Language } from "@/lib/supabase/types";

interface LangContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
}

const LangContext = createContext<LangContextValue>({
  lang: "en",
  setLang: () => {},
});

export function LangProvider({
  initial,
  children,
}: {
  initial: Language;
  children: React.ReactNode;
}) {
  const [lang, setLang] = useState<Language>(initial);
  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
