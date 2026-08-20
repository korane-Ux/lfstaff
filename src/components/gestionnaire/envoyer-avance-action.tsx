"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { MoyenPaiement } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";

type Fournisseur = { id: string; nom: string };

const inputClass =
  "rounded-xl border border-encre/15 bg-creme px-4 py-3 text-base text-encre outline-none focus:border-braise";

const MOYEN_LABELS: Record<MoyenPaiement, string> = {
  cash: "Cash",
  om: "Orange Money",
  momo: "MoMo",
};

export function EnvoyerAvanceAction({
  commandeId,
  prixTotal,
  pctAvance,
  fournisseurs,
}: {
  commandeId: string;
  prixTotal: number;
  pctAvance: number;
  fournisseurs: Fournisseur[];
}) {
  const router = useRouter();
  const suggestion = useMemo(() => Math.round((prixTotal * pctAvance) / 100), [prixTotal, pctAvance]);
  const [fournisseurId, setFournisseurId] = useState(fournisseurs[0]?.id ?? "");
  const [montant, setMontant] = useState(String(suggestion));
  const [moyen, setMoyen] = useState<MoyenPaiement>("cash");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!fournisseurs.length) {
    return (
      <p className="rounded-2xl bg-surface p-4 text-sm text-encre/60">
        Aucun fournisseur enregistré — demande au super-admin d&apos;en créer un.
      </p>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("fn_envoyer_avance", {
      p_commande_id: commandeId,
      p_fournisseur_id: fournisseurId,
      p_montant: Number(montant) || 0,
      p_moyen: moyen,
    });

    setLoading(false);

    if (rpcError) {
      setError("Impossible d'envoyer l'avance.");
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-2xl bg-surface p-4">
      <p className="text-sm font-medium text-encre">Envoyer l&apos;avance au fournisseur</p>

      <label className="flex flex-col gap-1 text-sm text-encre">
        Fournisseur
        <select
          value={fournisseurId}
          onChange={(e) => setFournisseurId(e.target.value)}
          className={inputClass}
        >
          {fournisseurs.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nom}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm text-encre">
        Montant de l&apos;avance (FCFA) — suggéré {suggestion.toLocaleString("fr-FR")}
        <input
          type="number"
          min={0}
          required
          value={montant}
          onChange={(e) => setMontant(e.target.value)}
          className={inputClass}
        />
      </label>

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

      {error && <p className="text-sm text-litige">{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Envoi..." : "Envoyer l'avance"}
      </Button>
    </form>
  );
}
