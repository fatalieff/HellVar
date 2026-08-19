"use client";

import * as React from "react";
import { I18nProvider } from "@/lib/i18n/i18n-context";
import { ThemeProvider, type Theme } from "@/lib/theme/theme-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

export function Providers({
  children,
  initialLocale,
  initialDictionary,
  initialTheme,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
  initialDictionary: Dictionary;
  initialTheme?: Theme;
}) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <I18nProvider
        initialLocale={initialLocale}
        initialDictionary={initialDictionary}
      >
        <TooltipProvider delayDuration={150} skipDelayDuration={100}>
          {children}
        </TooltipProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
