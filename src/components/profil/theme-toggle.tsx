"use client";

import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import {
  definirTheme,
  getThemeServerSnapshot,
  getThemeSnapshot,
  subscribeTheme,
  type Theme,
} from "@/lib/theme-store";

const OPTIONS: { value: Theme; label: string }[] = [
  { value: "light", label: "Clair" },
  { value: "dark", label: "Sombre" },
  { value: "system", label: "Système" },
];

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot);

  return (
    <div className="flex flex-col gap-2 rounded-3xl bg-surface p-5">
      <p className="text-sm font-medium text-encre">Apparence</p>
      <div className="flex gap-2">
        {OPTIONS.map((option) => (
          <Button
            key={option.value}
            type="button"
            size="sm"
            variant={theme === option.value ? "primary" : "ghost"}
            onClick={() => definirTheme(option.value)}
            className="flex-1"
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
