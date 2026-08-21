"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function RepondreDisponibiliteAction({ reponseId }: { reponseId: string }) {
  const router = useRouter();
  const [saisieQuantite, setSaisieQuantite] = useState(false);
  const [quantite, setQuantite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function repondre(disponible: boolean, quantiteDisponible: number | null) {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("alerte_reponses")
      .update({ disponible, quantite_disponible: quantiteDisponible, repondu_le: new Date().toISOString() })
      .eq("id", reponseId);

    setLoading(false);

    if (updateError) {
      setError("Impossible d'enregistrer ta réponse.");
      return;
    }

    router.refresh();
  }

  if (saisieQuantite) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          value={quantite}
          onChange={(e) => setQuantite(e.target.value)}
          placeholder="Quantité"
          className="w-20 rounded-xl border border-encre/15 bg-creme px-2 py-1.5 text-sm text-encre outline-none focus:border-braise"
          autoFocus
        />
        <Button
          type="button"
          size="sm"
          variant="success"
          disabled={loading}
          onClick={() => repondre(true, quantite ? Number(quantite) : null)}
        >
          Confirmer
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2">
        <Button type="button" size="sm" variant="success" disabled={loading} onClick={() => setSaisieQuantite(true)}>
          Disponible
        </Button>
        <Button type="button" size="sm" variant="danger" disabled={loading} onClick={() => repondre(false, null)}>
          Indisponible
        </Button>
      </div>
      {error && <p role="alert" className="text-xs text-litige">{error}</p>}
    </div>
  );
}
