"use client";

import { useSyncExternalStore } from "react";
import { MoonStarsIcon, SunIcon } from "@phosphor-icons/react";
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
export function ThemeQuickToggle({ avecLibelle = false }: { avecLibelle?: boolean }) {
  const estSombre = useSyncExternalStore(
    subscribeTheme,
    getResolvedIsDarkSnapshot,
    getResolvedIsDarkServerSnapshot,
  );
  const libelle = estSombre ? "Mode clair" : "Mode sombre";
  const Icone = estSombre ? SunIcon : MoonStarsIcon;

  return (
    <button
      type="button"
      onClick={() => definirTheme(estSombre ? "light" : "dark")}
      aria-label={avecLibelle ? undefined : `Passer en ${libelle.toLowerCase()}`}
      className={`flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl text-encre/75 transition-colors hover:bg-creme hover:text-encre ${
        avecLibelle ? "px-3 text-base" : "w-11"
      }`}
    >
      <Icone size={24} weight="duotone" className="icone-duo" />
      {avecLibelle && <span>{libelle}</span>}
    </button>
  );
}
