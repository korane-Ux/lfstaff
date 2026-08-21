"use client";

import { useState } from "react";

// Petit bouton d'aide discret : replié par défaut pour ne pas encombrer
// l'écran, mais toujours au même endroit pour qu'un livreur peu à l'aise
// avec les téléphones sache où le retrouver en cas de blocage.
export function AideLivreur({ titre, texte }: { titre: string; texte: string }) {
  const [ouvert, setOuvert] = useState(false);

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={() => setOuvert((o) => !o)}
        aria-label={ouvert ? "Fermer l'aide" : "Besoin d'aide ?"}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-encre/10 text-base font-medium text-encre/60"
      >
        ?
      </button>
      {ouvert && (
        <div className="w-full rounded-2xl bg-laiton/20 p-4">
          <p className="mb-1 text-sm font-medium text-encre">{titre}</p>
          <p className="whitespace-pre-line text-sm text-encre/80">{texte}</p>
        </div>
      )}
    </div>
  );
}
