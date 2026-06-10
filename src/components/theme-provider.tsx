"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import {
  COLOR_THEMES,
  COLOR_THEME_STORAGE_KEY,
  DEFAULT_COLOR_THEME,
  type ColorThemeId,
} from "@/lib/themes";

/* ---------- Color theme context ---------- */

interface ColorThemeContextType {
  colorTheme: ColorThemeId;
  setColorTheme: (id: ColorThemeId) => void;
}

const ColorThemeContext = createContext<ColorThemeContextType>({
  colorTheme: DEFAULT_COLOR_THEME,
  setColorTheme: () => {},
});

export function useColorTheme() {
  return useContext(ColorThemeContext);
}

/* ---------- Inner provider (runs client-side) ---------- */

function ColorThemeManager({ children }: { children: ReactNode }) {
  const [colorTheme, setColorThemeState] =
    useState<ColorThemeId>(DEFAULT_COLOR_THEME);

  // One-time sync from localStorage after hydration. SSR must render the
  // default (no localStorage on the server), so this cannot be a lazy
  // initializer; the inline <head> script already applied data-theme
  // pre-paint, this only aligns React state with it.
  useEffect(() => {
    const saved = localStorage.getItem(COLOR_THEME_STORAGE_KEY) as ColorThemeId | null;
    const ids = COLOR_THEMES.map((t) => t.id);
    const resolved = saved && ids.includes(saved) ? saved : DEFAULT_COLOR_THEME;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-shot post-hydration sync
    setColorThemeState(resolved);
    document.documentElement.setAttribute("data-theme", resolved);
  }, []);

  function setColorTheme(id: ColorThemeId) {
    setColorThemeState(id);
    document.documentElement.setAttribute("data-theme", id);
    localStorage.setItem(COLOR_THEME_STORAGE_KEY, id);
  }

  return (
    <ColorThemeContext.Provider value={{ colorTheme, setColorTheme }}>
      {children}
    </ColorThemeContext.Provider>
  );
}

/* ---------- Root provider (exported) ---------- */

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <ColorThemeManager>{children}</ColorThemeManager>
    </NextThemesProvider>
  );
}
