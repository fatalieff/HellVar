"use client";

import * as React from "react";
import { Globe2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/lib/i18n/i18n-context";
import { localeLabels, type Locale } from "@/lib/i18n/dictionaries";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const current = localeLabels[locale];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 px-3"
          aria-label="Select language"
        >
          <Globe2 className="size-4" data-icon="inline-start" />
          <span className="text-xs font-semibold tracking-wide uppercase">
            {current.short}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[13rem]">
        <DropdownMenuLabel>Dil / Language / Dil</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(v) => setLocale(v as Locale)}
        >
          {(Object.keys(localeLabels) as Locale[]).map((key) => {
            const item = localeLabels[key];
            const selected = key === locale;
            return (
              <DropdownMenuRadioItem key={key} value={key} className="gap-3">
                <span
                  className={cn(
                    "grid size-7 place-items-center rounded-md border text-[11px] font-bold uppercase tracking-wider transition-all",
                    selected
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-muted/40 text-muted-foreground"
                  )}
                >
                  {item.short}
                </span>
                <span className="flex-1 text-sm font-medium">
                  {item.native}
                </span>
                {selected && <Check className="size-3.5 text-primary" />}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
