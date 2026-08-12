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

const STORAGE_KEY = "hellvar.locale";
const COOKIE_NAME = "hellvar.locale";

function normalizeLocale(value: string | null | undefined): Locale | null {
  if (!value) return null;
  return locales.includes(value as Locale) ? (value as Locale) : null;
}

function detectStoredLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;
  try {
    const fromStorage = normalizeLocale(window.localStorage.getItem(STORAGE_KEY));
    if (fromStorage) return fromStorage;

    const fromCookie = normalizeLocale(document.cookie.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${COOKIE_NAME}=`))?.split("=")[1]);
    if (fromCookie) return fromCookie;

    const nav = window.navigator.language?.toLowerCase() ?? "";
    if (nav.startsWith("az")) return "az";
    if (nav.startsWith("tr")) return "tr";
    if (nav.startsWith("ru")) return "ru";
    if (nav.startsWith("en")) return "en";
  } catch {
    /* ignore storage errors */
  }
  return defaultLocale;
}

function persistLocale(locale: Locale) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
    document.cookie = `${COOKIE_NAME}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    if (document.documentElement) {
      document.documentElement.setAttribute("lang", locale);
    }
  } catch {
    /* ignore storage errors */
  }
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
    persistLocale(locale);
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

