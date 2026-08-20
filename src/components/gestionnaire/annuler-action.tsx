"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ConfirmDangerDialog } from "@/components/ui/confirm-danger-dialog";

export function AnnulerAction({ commandeId }: { commandeId: string }) {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [motif, setMotif] = useState("");

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

  async function handleAnnuler() {
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("commandes")
      .update({ etat: "annulee", motif_annulation: motif })
      .eq("id", commandeId);

    if (updateError) throw updateError;
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-surface p-4">
      <p className="text-sm font-medium text-encre">Annuler la commande</p>
      <textarea
        required
        value={motif}
        onChange={(e) => setMotif(e.target.value)}
        rows={2}
        placeholder="Motif de l'annulation..."
        className="rounded-xl border border-encre/15 bg-creme px-4 py-3 text-base text-encre outline-none focus:border-braise"
      />
      <div className="flex gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={() => setOuvert(false)} className="flex-1">
          Retour
        </Button>
        <ConfirmDangerDialog
          title="Annuler cette commande ?"
          description="Cette action est irréversible et clôture définitivement la commande."
          confirmLabel="Confirmer l'annulation"
          onConfirm={handleAnnuler}
          trigger={(open) => (
            <Button
              type="button"
              variant="danger"
              size="sm"
              className="flex-1"
              disabled={!motif.trim()}
              onClick={open}
            >
              Confirmer l&apos;annulation
            </Button>
          )}
        />
      </div>
    </div>
  );
}
