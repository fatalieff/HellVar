"use client";

import * as React from "react";

export type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "hellvar.theme";
const COOKIE_NAME = "hellvar.theme";

export function applyThemeClass(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function detectStoredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const fromStorage = window.localStorage.getItem(STORAGE_KEY);
    if (fromStorage === "dark" || fromStorage === "light") return fromStorage;

    const fromCookie = document.cookie
      .split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith(`${COOKIE_NAME}=`))
      ?.split("=")[1];
    if (fromCookie === "dark" || fromCookie === "light") return fromCookie;

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

export function persistTheme(theme: Theme) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
    document.cookie = `${COOKIE_NAME}=${theme}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    applyThemeClass(theme);
  } catch {
    /* ignore storage errors */
  }
}

export function ThemeProvider({
  children,
  initialTheme,
}: {
  children: React.ReactNode;
  initialTheme?: Theme;
}) {
  const [theme, setThemeState] = React.useState<Theme>(
    initialTheme ?? "light"
  );
  const hydrated = React.useRef(false);

  React.useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      const detected = detectStoredTheme();
      setThemeState(detected);
      applyThemeClass(detected);
    }
  }, []);

  React.useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);

  React.useEffect(() => {
    if (!hydrated.current) return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setThemeState(mql.matches ? "dark" : "light");
      }
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme: (next: Theme) => {
        setThemeState(next);
        persistTheme(next);
      },
      toggleTheme: () => {
        setThemeState((prev) => {
          const next: Theme = prev === "dark" ? "light" : "dark";
          persistTheme(next);
          return next;
        });
      },
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}