"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const CLE_MASQUEE = "lfstaff-install-masque";

function souscrireJamais() {
  return () => {};
}

// estIOS/estDejaInstallee/localStorage dépendent d'API absentes côté
// serveur. useSyncExternalStore avec un store qui ne change jamais donne
// un booléen "monté côté client" fiable pour le SSR (false au premier
// rendu serveur ET au premier rendu client, true juste après), sans avoir
// à faire de setState dans un effet juste pour éviter un mismatch d'hydratation.
function useMonte() {
  return useSyncExternalStore(souscrireJamais, () => true, () => false);
}

function estIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function estDejaInstallee() {
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

export function InstallBanner() {
  const monte = useMonte();
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [masqueeManuel, setMasqueeManuel] = useState(false);

  useEffect(() => {
    function handler(e: Event) {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (
    !monte ||
    estDejaInstallee() ||
    masqueeManuel ||
    localStorage.getItem(CLE_MASQUEE) === "1"
  ) {
    return null;
  }

  function fermer() {
    setMasqueeManuel(true);
    localStorage.setItem(CLE_MASQUEE, "1");
  }

  async function installer() {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === "accepted") {
      setMasqueeManuel(true);
    } else {
      fermer();
    }
  }

  if (estIOS()) {
    return (
      <div className="flex items-center justify-between gap-3 bg-laiton px-4 py-3 text-sm text-encre">
        <p>Installe LFstaff : bouton Partager puis &laquo; Sur l&apos;écran d&apos;accueil &raquo;.</p>
        <button onClick={fermer} className="shrink-0 text-lg leading-none text-encre/65">
          ×
        </button>
      </div>
    );
  }

  if (!promptEvent) return null;

  return (
    <div className="flex items-center justify-between gap-3 bg-laiton px-4 py-3 text-sm text-encre">
      <p className="font-medium">Installer LFstaff sur cet appareil ?</p>
      <div className="flex shrink-0 items-center gap-3">
        <button
          onClick={installer}
          className="rounded-none bg-braise px-3 py-1.5 text-xs font-medium text-accent-fg"
        >
          Installer
        </button>
        <button onClick={fermer} className="text-lg leading-none text-encre/65">
          ×
        </button>
      </div>
    </div>
  );
}
