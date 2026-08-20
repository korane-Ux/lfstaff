"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { MoyenPaiement } from "@/lib/supabase/types";

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

    const montantNum = Number(montant) || 0;
    const supabase = createClient();

    const { error: updateError } = await supabase
      .from("commandes")
      .update({
        fournisseur_id: fournisseurId,
        avance_montant: montantNum,
        avance_payee: true,
        etat: "en_creation",
      })
      .eq("id", commandeId);

    if (updateError) {
      setLoading(false);
      setError("Impossible d'envoyer l'avance.");
      return;
    }

    const { error: txError } = await supabase.from("transactions").insert({
      type: "avance_fournisseur",
      commande_id: commandeId,
      user_id: fournisseurId,
      montant: montantNum,
      sens: "sortie",
      moyen,
    });

    setLoading(false);

    if (txError) {
      setError("L'avance est envoyée mais la transaction n'a pas pu être enregistrée.");
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
          <button
            key={m}
            type="button"
            onClick={() => setMoyen(m)}
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium ${
              moyen === m ? "bg-braise text-creme" : "bg-creme text-encre/70"
            }`}
          >
            {MOYEN_LABELS[m]}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-litige">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-braise px-4 py-3 text-base font-medium text-creme disabled:opacity-60"
      >
        {loading ? "Envoi..." : "Envoyer l'avance"}
      </button>
    </form>
  );
}
