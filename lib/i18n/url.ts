import { defaultLocale, type Locale } from "./dictionaries";

// Default dildən başqa dillər URL-də prefiks alır: /tr, /ru, /en
const PREFIXED_LOCALES: Locale[] = ["en", "tr", "ru"];

// "/tr/abc" kimi yollardan dili çıxarır, qalan hissəni qaytarır
export function getLocaleFromPath(pathname: string): Locale | null {
  const first = pathname.split("/").filter(Boolean)[0];
  if (first && PREFIXED_LOCALES.includes(first as Locale)) {
    return first as Locale;
  }
  if (first === "az") return "az";
  return null;
}

// Prefiksi yoldan silir: "/tr/about" -> "/about", "/tr" -> "/"
export function stripLocalePrefix(pathname: string): string {
  const locale = getLocaleFromPath(pathname);
  if (!locale) return pathname;
  const prefix = `/${locale}`;
  if (pathname === prefix) return "/";
  if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length);
  return pathname;
}

// Yola dil prefiksini əlavə edir (default dil üçün prefiks yoxdur)
export function localizedPath(path: string, locale: Locale): string {
  const stripped = stripLocalePrefix(path);
  if (locale === defaultLocale) return stripped;
  const prefix = `/${locale}`;
  if (stripped === "/") return prefix;
  return `${prefix}${stripped}`;
}

// Verilən dili yoxlayır, default-a çevirir
export function normalizeLocale(value: string | null | undefined): Locale {
  return value && ["az", "en", "tr", "ru"].includes(value) ? (value as Locale) : defaultLocale;
}
