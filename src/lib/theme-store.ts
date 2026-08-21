export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "lfstaff-theme";
const listeners = new Set<() => void>();

export function lireThemeExplicite(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "system";
}

export function definirTheme(theme: Theme) {
  if (theme === "system") {
    localStorage.removeItem(STORAGE_KEY);
    document.documentElement.removeAttribute("data-theme");
  } else {
    localStorage.setItem(STORAGE_KEY, theme);
    document.documentElement.setAttribute("data-theme", theme);
  }
  listeners.forEach((listener) => listener());
}

// Un seul store partagé par ThemeToggle (3 choix, /profil) et
// ThemeQuickToggle (bouton unique clair/sombre, dans l'en-tête) : les deux
// doivent rester synchronisés quel que soit celui qu'on manipule.
export function subscribeTheme(listener: () => void) {
  listeners.add(listener);
  let media: MediaQueryList | undefined;
  if (typeof window !== "undefined") {
    media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", listener);
  }
  return () => {
    listeners.delete(listener);
    media?.removeEventListener("change", listener);
  };
}

export function getThemeSnapshot(): Theme {
  return lireThemeExplicite();
}

export function getThemeServerSnapshot(): Theme {
  return "system";
}

export function getResolvedIsDarkSnapshot(): boolean {
  const explicite = lireThemeExplicite();
  if (explicite === "dark") return true;
  if (explicite === "light") return false;
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function getResolvedIsDarkServerSnapshot(): boolean {
  return false;
}
