"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function MarquerPayeAction({
  demandeId,
  livreurId,
  montant,
}: {
  demandeId: string;
  livreurId: string;
  montant: number;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { error: txError } = await supabase.from("transactions").insert({
      type: "retrait_livreur",
      user_id: livreurId,
      montant,
      sens: "sortie",
      moyen: "cash",
    });

    if (txError) {
      setLoading(false);
      setError("Impossible d'enregistrer le paiement.");
      return;
    }

    const { error: updateError } = await supabase
      .from("demandes_retrait")
      .update({ statut: "payee", traitee_le: new Date().toISOString() })
      .eq("id", demandeId);

    setLoading(false);

    if (updateError) {
      setError("Le paiement est enregistré mais la demande n'a pas pu être clôturée.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col gap-1">
      {error && <p className="text-xs text-litige">{error}</p>}
      <button
        onClick={handleClick}
        disabled={loading}
        className="rounded-full bg-vert px-4 py-2 text-sm font-medium text-creme disabled:opacity-60"
      >
        {loading ? "..." : "Marquer payé"}
      </button>
    </div>
  );
}
