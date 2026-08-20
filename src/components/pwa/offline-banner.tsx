"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

function getServerSnapshot() {
  return true;
}

export function OfflineBanner() {
  const enLigne = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (enLigne) return null;

  return (
    <div className="sticky top-0 z-50 bg-litige px-4 py-2 text-center text-sm font-medium text-accent-fg">
      Pas de connexion — tes actions ne s&apos;enregistreront pas tant qu&apos;elle n&apos;est pas revenue.
    </div>
  );
}
