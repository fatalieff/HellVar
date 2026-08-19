"use client";

import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme/theme-context";
import { useI18n } from "@/lib/i18n/i18n-context";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();
  const isDark = theme === "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label={isDark ? t.theme.toggleToLight : t.theme.toggleToDark}
      title={isDark ? t.theme.toggleToLight : t.theme.toggleToDark}
      className="shrink-0 rounded-xl"
    >
      {isDark ? (
        <Sun className="size-4" data-icon="inline" />
      ) : (
        <Moon className="size-4" data-icon="inline" />
      )}
    </Button>
  );
}