"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatFcfa } from "@/lib/etats";
import { Button } from "@/components/ui/button";

export function ValiderLivraisonAction({
  commandeId,
  livreurId,
  soldeMontant,
  commissionMontant,
}: {
  commandeId: string;
  livreurId: string;
  soldeMontant: number;
  commissionMontant: number;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("fn_valider_livraison", {
      p_commande_id: commandeId,
      p_livreur_id: livreurId,
      p_solde_montant: soldeMontant,
      p_commission_montant: commissionMontant,
    });

    setLoading(false);

    if (rpcError) {
      setError("Impossible de valider cette livraison.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-surface p-4">
      <p className="text-sm font-medium text-encre">Livraison confirmée par le client</p>
      <p className="text-xs text-encre/60">
        Solde encaissé : {formatFcfa(soldeMontant)} · Commission livreur : {formatFcfa(commissionMontant)}
      </p>

      {error && <p className="text-sm text-litige">{error}</p>}

      <Button variant="success" onClick={handleClick} disabled={loading}>
        {loading ? "Validation..." : "Valider et créditer la commission"}
      </Button>
    </div>
  );
}
