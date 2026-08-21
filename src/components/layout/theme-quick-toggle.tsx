"use client";

import { useSyncExternalStore } from "react";
import {
  definirTheme,
  getResolvedIsDarkServerSnapshot,
  getResolvedIsDarkSnapshot,
  subscribeTheme,
} from "@/lib/theme-store";

// Bouton unique clair/sombre dans l'en-tête, pour un accès direct sans
// passer par /profil. Bascule vers l'opposé du thème actuellement affiché
// (en tenant compte de la préférence système si aucun choix explicite
// n'a été fait) — /profil garde le contrôle à 3 choix pour qui veut
// explicitement revenir à "système".
export function ThemeQuickToggle() {
  const estSombre = useSyncExternalStore(
    subscribeTheme,
    getResolvedIsDarkSnapshot,
    getResolvedIsDarkServerSnapshot,
  );

  return (
    <button
      type="button"
      onClick={() => definirTheme(estSombre ? "light" : "dark")}
      aria-label={estSombre ? "Passer en mode clair" : "Passer en mode sombre"}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none bg-surface text-base"
    >
      {estSombre ? "☀️" : "🌙"}
    </button>
  );
}
