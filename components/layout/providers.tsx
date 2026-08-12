"use client";

import * as React from "react";
import { I18nProvider } from "@/lib/i18n/i18n-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

export function Providers({
  children,
  initialLocale,
  initialDictionary,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
  initialDictionary: Dictionary;
}) {
  return (
    <I18nProvider
      initialLocale={initialLocale}
      initialDictionary={initialDictionary}
    >
      <TooltipProvider delayDuration={150} skipDelayDuration={100}>
        {children}
      </TooltipProvider>
    </I18nProvider>
  );
}
