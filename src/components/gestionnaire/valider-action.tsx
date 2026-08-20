"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { MoyenPaiement } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";

const MOYEN_LABELS: Record<MoyenPaiement, string> = {
  cash: "Cash",
  om: "Orange Money",
  momo: "MoMo",
};

export function ValiderAction({
  commandeId,
  acompteSuggere,
}: {
  commandeId: string;
  acompteSuggere: number;
}) {
  const router = useRouter();
  const [montant, setMontant] = useState(String(acompteSuggere));
  const [moyen, setMoyen] = useState<MoyenPaiement>("cash");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("fn_valider_commande", {
      p_commande_id: commandeId,
      p_acompte_montant: Number(montant) || 0,
      p_moyen: moyen,
    });

    setLoading(false);

    if (rpcError) {
      setError("Impossible de valider cette commande.");
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-2xl bg-surface p-4">
      <p className="text-sm font-medium text-encre">Encaisser l&apos;acompte</p>

      <TextField
        label="Montant reçu"
        hint="FCFA"
        type="number"
        min={0}
        required
        value={montant}
        onChange={(e) => setMontant(e.target.value)}
      />

      <div className="flex gap-2">
        {(Object.keys(MOYEN_LABELS) as MoyenPaiement[]).map((m) => (
          <Button
            key={m}
            type="button"
            size="sm"
            variant={moyen === m ? "primary" : "ghost"}
            onClick={() => setMoyen(m)}
            className="flex-1"
          >
            {MOYEN_LABELS[m]}
          </Button>
        ))}
      </div>

      {error && <p role="alert" className="text-sm text-litige">{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Validation..." : "Valider la commande"}
      </Button>
    </form>
  );
}
