"use client";

import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "lfstaff-theme";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "system";
}

function getServerSnapshot(): Theme {
  return "system";
}

function definirTheme(theme: Theme) {
  if (theme === "system") {
    localStorage.removeItem(STORAGE_KEY);
    document.documentElement.removeAttribute("data-theme");
  } else {
    localStorage.setItem(STORAGE_KEY, theme);
    document.documentElement.setAttribute("data-theme", theme);
  }
  listeners.forEach((listener) => listener());
}

const OPTIONS: { value: Theme; label: string }[] = [
  { value: "light", label: "Clair" },
  { value: "dark", label: "Sombre" },
  { value: "system", label: "Système" },
];

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

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
