"use client";

import * as React from "react";
import {
  dictionaries,
  defaultLocale,
  type Dictionary,
  type Locale,
  locales,
} from "./dictionaries";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
};

const I18nContext = React.createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "ustatap.locale";

function detectStoredLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && (locales as readonly string[]).includes(stored)) {
      return stored;
    }
    const nav = window.navigator.language?.toLowerCase() ?? "";
    if (nav.startsWith("az")) return "az";
    if (nav.startsWith("tr")) return "tr";
    if (nav.startsWith("en")) return "en";
  } catch {
    /* ignore storage errors */
  }
  return defaultLocale;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>(defaultLocale);
  const hydrated = React.useRef(false);

  React.useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      const detected = detectStoredLocale();
      if (detected !== defaultLocale) {
        setLocaleState(detected);
      }
    }
  }, []);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
      if (typeof document !== "undefined" && document.documentElement) {
        document.documentElement.setAttribute("lang", locale);
      }
    } catch {
      /* ignore */
    }
  }, [locale]);

  const value = React.useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale: (next: Locale) => setLocaleState(next),
      t: dictionaries[locale] ?? dictionaries[defaultLocale],
    }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = React.useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return ctx;
}
