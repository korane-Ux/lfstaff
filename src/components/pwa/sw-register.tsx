"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    // En dev, les fichiers /_next/static/ gardent le même nom d'une
    // compilation à l'autre : le cache du service worker servirait du CSS
    // périmé. On le désinstalle et on vide ses caches.
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
      caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
      return;
    }
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Échec de l'enregistrement du service worker", error);
    });
  }, []);

  return null;
}
