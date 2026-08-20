"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatFcfa } from "@/lib/etats";

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

    const { error: updateError } = await supabase
      .from("commandes")
      .update({ etat: "livree_validee", commission_montant: commissionMontant })
      .eq("id", commandeId);

    if (updateError) {
      setLoading(false);
      setError("Impossible de valider cette livraison.");
      return;
    }

    const { error: txError } = await supabase.from("transactions").insert([
      {
        type: "solde_client",
        commande_id: commandeId,
        user_id: livreurId,
        montant: soldeMontant,
        sens: "entree",
        moyen: "cash",
      },
      {
        type: "commission_livreur",
        commande_id: commandeId,
        user_id: livreurId,
        montant: commissionMontant,
        sens: "sortie",
        moyen: "cash",
      },
    ]);

    setLoading(false);

    if (txError) {
      setError("La livraison est validée mais les transactions n'ont pas pu être enregistrées.");
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

      <button
        onClick={handleClick}
        disabled={loading}
        className="rounded-xl bg-vert px-4 py-3 text-base font-medium text-creme disabled:opacity-60"
      >
        {loading ? "Validation..." : "Valider et créditer la commission"}
      </button>
    </div>
  );
}
