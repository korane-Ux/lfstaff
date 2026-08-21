"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatFcfa } from "@/lib/etats";
import type { MoyenPaiement } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/field";
import { notifierClientCommande } from "@/lib/notify-client";

type Ligne = {
  id: string;
  prixTotal: number;
  clientNom: string;
  produitNom: string;
  produitPhoto: string | null;
  produitCategorie: string | null;
};

const MOYEN_LABELS: Record<MoyenPaiement, string> = {
  cash: "Cash",
  om: "Orange Money",
  momo: "MoMo",
};

export function GrouperFournisseurForm({
  lignes,
  fournisseurs,
  pctAvance,
}: {
  lignes: Ligne[];
  fournisseurs: { id: string; nom: string }[];
  pctAvance: number;
}) {
  const router = useRouter();
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [montants, setMontants] = useState<Record<string, string>>(() =>
    Object.fromEntries(lignes.map((l) => [l.id, String(Math.round((l.prixTotal * pctAvance) / 100))])),
  );
  const [fournisseurId, setFournisseurId] = useState(fournisseurs[0]?.id ?? "");
  const [moyen, setMoyen] = useState<MoyenPaiement>("cash");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const categories = useMemo(
    () => [...new Set(lignes.map((l) => l.produitCategorie).filter((c): c is string => !!c))],
    [lignes],
  );
  const [filtreCategorie, setFiltreCategorie] = useState<string | null>(null);

  const lignesAffichees = filtreCategorie
    ? lignes.filter((l) => l.produitCategorie === filtreCategorie)
    : lignes;

  const total = [...selection].reduce((sum, id) => sum + (Number(montants[id]) || 0), 0);

  function toggle(id: string) {
    setSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit() {
    if (!fournisseurId || selection.size === 0) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("fn_envoyer_avance_groupee", {
      p_fournisseur_id: fournisseurId,
      p_moyen: moyen,
      p_lignes: [...selection].map((id) => ({ commande_id: id, montant: Number(montants[id]) || 0 })),
    });

    setLoading(false);

    if (rpcError) {
      setError("Impossible d'envoyer cette grande commande.");
      return;
    }

    selection.forEach(notifierClientCommande);
    router.replace("/gestionnaire/commandes");
    router.refresh();
  }

  if (!fournisseurs.length) {
    return (
      <p className="rounded-2xl bg-surface p-4 text-sm text-encre/65">
        Aucun fournisseur enregistré — demande au super-admin d&apos;en créer un.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={filtreCategorie === null ? "primary" : "ghost"}
            onClick={() => setFiltreCategorie(null)}
          >
            Tout
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              type="button"
              size="sm"
              variant={filtreCategorie === cat ? "primary" : "ghost"}
              onClick={() => setFiltreCategorie(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {lignesAffichees.map((ligne) => {
          const coche = selection.has(ligne.id);
          return (
            <div key={ligne.id} className="flex items-center gap-3 rounded-2xl bg-surface p-3">
              <button
                type="button"
                onClick={() => toggle(ligne.id)}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-none border ${
                  coche ? "border-braise bg-braise text-accent-fg" : "border-encre/25 bg-creme"
                }`}
                aria-label={coche ? "Retirer de la sélection" : "Ajouter à la sélection"}
              >
                {coche && "✓"}
              </button>
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-creme">
                {ligne.produitPhoto && (
                  <Image src={ligne.produitPhoto} alt="" fill sizes="48px" className="object-cover" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-encre">{ligne.produitNom}</p>
                <p className="text-xs text-encre/65">{ligne.clientNom}</p>
              </div>
              {coche ? (
                <input
                  type="number"
                  min={0}
                  value={montants[ligne.id]}
                  onChange={(e) => setMontants((prev) => ({ ...prev, [ligne.id]: e.target.value }))}
                  className="w-24 rounded-xl border border-encre/15 bg-creme px-2 py-1.5 text-right text-sm text-encre outline-none focus:border-braise"
                />
              ) : (
                <p className="text-xs text-encre/65">{formatFcfa(ligne.prixTotal)}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 rounded-3xl bg-surface p-5">
        <SelectField label="Fournisseur" value={fournisseurId} onChange={(e) => setFournisseurId(e.target.value)}>
          {fournisseurs.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nom}
            </option>
          ))}
        </SelectField>

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

        <p className="text-sm text-encre">
          {selection.size} commande{selection.size > 1 ? "s" : ""} sélectionnée{selection.size > 1 ? "s" : ""} ·
          Total avance : {formatFcfa(total)}
        </p>

        {error && <p role="alert" className="text-sm text-litige">{error}</p>}

        <Button onClick={handleSubmit} disabled={loading || selection.size === 0}>
          {loading ? "Envoi..." : "Envoyer la grande commande"}
        </Button>
      </div>
    </div>
  );
}
