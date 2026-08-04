"use client";

import * as React from "react";
import { I18nProvider } from "@/lib/i18n/i18n-context";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <TooltipProvider delayDuration={150} skipDelayDuration={100}>
        {children}
      </TooltipProvider>
    </I18nProvider>
  );
}
