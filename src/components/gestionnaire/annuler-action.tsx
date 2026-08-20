"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function AnnulerAction({ commandeId }: { commandeId: string }) {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [motif, setMotif] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!ouvert) {
    return (
      <button
        onClick={() => setOuvert(true)}
        className="self-start text-xs text-encre/40 underline underline-offset-2"
      >
        Annuler la commande
      </button>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("commandes")
      .update({ etat: "annulee", motif_annulation: motif })
      .eq("id", commandeId);

    setLoading(false);

    if (updateError) {
      setError("Impossible d'annuler cette commande.");
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 rounded-2xl bg-surface p-4">
      <p className="text-sm font-medium text-encre">Annuler la commande</p>
      <textarea
        required
        value={motif}
        onChange={(e) => setMotif(e.target.value)}
        rows={2}
        placeholder="Motif de l'annulation..."
        className="rounded-xl border border-encre/15 bg-creme px-4 py-3 text-base text-encre outline-none focus:border-braise"
      />
      {error && <p className="text-xs text-litige">{error}</p>}
      <div className="flex gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={() => setOuvert(false)} className="flex-1">
          Retour
        </Button>
        <Button type="submit" variant="danger" size="sm" disabled={loading} className="flex-1">
          {loading ? "..." : "Confirmer l'annulation"}
        </Button>
      </div>
    </form>
  );
}
