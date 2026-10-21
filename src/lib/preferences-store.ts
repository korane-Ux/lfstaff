// Préférences de confort, propres à chaque appareil (localStorage) : un
// livreur qui grossit le texte sur son téléphone n'impose rien aux autres.
// Même principe que theme-store.ts : appliquées sur <html> en attributs
// data-*, avant l'hydratation (voir PREFERENCES_INIT_SCRIPT dans layout.tsx),
// pour que le CSS s'adapte sans flash au chargement.

export type TailleTexte = "normal" | "grand" | "tres-grand";
export type Animations = "auto" | "reduites";

export type Preferences = {
  texte: TailleTexte;
  son: boolean;
  animations: Animations;
};

const CLES = {
  texte: "lfstaff-texte",
  son: "lfstaff-son",
  animations: "lfstaff-animations",
} as const;

const DEFAUT: Preferences = { texte: "normal", son: true, animations: "auto" };

const listeners = new Set<() => void>();
let cache: Preferences | null = null;

function lire(): Preferences {
  if (typeof window === "undefined") return DEFAUT;
  try {
    const texte = localStorage.getItem(CLES.texte);
    const animations = localStorage.getItem(CLES.animations);
    return {
      texte: texte === "grand" || texte === "tres-grand" ? texte : "normal",
      son: localStorage.getItem(CLES.son) !== "off",
      animations: animations === "reduites" ? "reduites" : "auto",
    };
  } catch {
    return DEFAUT;
  }
}

function appliquer(prefs: Preferences) {
  const html = document.documentElement;
  html.setAttribute("data-texte", prefs.texte);
  html.setAttribute("data-animations", prefs.animations);
}

export function definirPreference<K extends keyof Preferences>(cle: K, valeur: Preferences[K]) {
  const suivantes = { ...lire(), [cle]: valeur };
  try {
    localStorage.setItem(CLES.texte, suivantes.texte);
    localStorage.setItem(CLES.son, suivantes.son ? "on" : "off");
    localStorage.setItem(CLES.animations, suivantes.animations);
  } catch {
    // Navigation privée ou stockage bloqué : la préférence vaut pour la
    // page en cours seulement, ce qui reste mieux que rien.
  }
  cache = suivantes;
  appliquer(suivantes);
  listeners.forEach((listener) => listener());
}

export function subscribePreferences(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// useSyncExternalStore exige un instantané stable : on ne recrée l'objet
// que lorsqu'une préférence change réellement.
export function getPreferencesSnapshot(): Preferences {
  if (!cache) cache = lire();
  return cache;
}

export function getPreferencesServerSnapshot(): Preferences {
  return DEFAUT;
}

// Les animations sont coupées si l'utilisateur l'a choisi dans l'app OU
// si son système le demande (réglage d'accessibilité du téléphone).
export function animationsReduites(): boolean {
  if (typeof window === "undefined") return false;
  return (
    getPreferencesSnapshot().animations === "reduites" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Script inline posé dans <head> : mêmes clés, appliquées avant le premier
// rendu visible pour éviter un saut de taille de texte au chargement.
export const PREFERENCES_INIT_SCRIPT = `
(function () {
  try {
    var t = localStorage.getItem("${CLES.texte}");
    var a = localStorage.getItem("${CLES.animations}");
    document.documentElement.setAttribute("data-texte", t === "grand" || t === "tres-grand" ? t : "normal");
    document.documentElement.setAttribute("data-animations", a === "reduites" ? "reduites" : "auto");
  } catch (e) {}
})();
`;
