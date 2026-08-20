"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LitigeAction({ commandeId }: { commandeId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"renvoyer" | "annuler" | null>(null);

  async function renvoyerAuFournisseur() {
    setLoading("renvoyer");
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("commandes")
      .update({ etat: "en_creation" })
      .eq("id", commandeId);

    setLoading(null);

    if (updateError) {
      setError("Impossible de renvoyer cette commande au fournisseur.");
      return;
    }

    router.refresh();
  }

  async function annuler() {
    setLoading("annuler");
    setError(null);

    const supabase = createClient();
    const { data: commande } = await supabase
      .from("commandes")
      .select("motif_annulation")
      .eq("id", commandeId)
      .single();

    const { error: updateError } = await supabase
      .from("commandes")
      .update({ etat: "annulee", motif_annulation: commande?.motif_annulation ?? "Litige non résolu" })
      .eq("id", commandeId);

    setLoading(null);

    if (updateError) {
      setError("Impossible d'annuler cette commande.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-surface p-4">
      <p className="text-sm font-medium text-encre">Résoudre le litige</p>
      <div className="flex gap-2">
        <button
          onClick={renvoyerAuFournisseur}
          disabled={loading !== null}
          className="flex-1 rounded-xl bg-braise px-4 py-3 text-sm font-medium text-creme disabled:opacity-60"
        >
          {loading === "renvoyer" ? "..." : "Renvoyer au fournisseur"}
        </button>
        <button
          onClick={annuler}
          disabled={loading !== null}
          className="flex-1 rounded-xl bg-litige px-4 py-3 text-sm font-medium text-creme disabled:opacity-60"
        >
          {loading === "annuler" ? "..." : "Annuler la commande"}
        </button>
      </div>
      {error && <p className="text-xs text-litige">{error}</p>}
    </div>
  );
}
