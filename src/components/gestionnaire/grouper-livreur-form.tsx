"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatFcfa } from "@/lib/etats";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/field";

type Ligne = {
  id: string;
  soldeMontant: number;
  villeLivraison: string | null;
  clientNom: string;
  produitNom: string;
  produitPhoto: string | null;
};

export function GrouperLivreurForm({
  lignes,
  livreurs,
}: {
  lignes: Ligne[];
  livreurs: { id: string; nom: string }[];
}) {
  const router = useRouter();
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [livreurId, setLivreurId] = useState(livreurs[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const total = lignes
    .filter((l) => selection.has(l.id))
    .reduce((sum, l) => sum + l.soldeMontant, 0);

  function toggle(id: string) {
    setSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit() {
    if (!livreurId || selection.size === 0) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("fn_assigner_livreur_groupe", {
      p_livreur_id: livreurId,
      p_commande_ids: [...selection],
    });

    setLoading(false);

    if (rpcError) {
      setError("Impossible d'assigner cette grande commande.");
      return;
    }

    router.replace("/gestionnaire");
    router.refresh();
  }

  if (!livreurs.length) {
    return (
      <p className="rounded-2xl bg-surface p-4 text-sm text-encre/65">
        Aucun livreur enregistré — demande au super-admin d&apos;en créer un.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {lignes.map((ligne) => {
          const coche = selection.has(ligne.id);
          return (
            <button
              key={ligne.id}
              type="button"
              onClick={() => toggle(ligne.id)}
              className="flex items-center gap-3 rounded-2xl bg-surface p-3 text-left"
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-none border ${
                  coche ? "border-braise bg-braise text-accent-fg" : "border-encre/25 bg-creme"
                }`}
              >
                {coche && "✓"}
              </span>
              <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-creme">
                {ligne.produitPhoto && (
                  <Image src={ligne.produitPhoto} alt="" fill sizes="48px" className="object-cover" />
                )}
              </span>
              <span className="flex-1">
                <span className="block text-sm font-medium text-encre">{ligne.produitNom}</span>
                <span className="block text-xs text-encre/65">
                  {ligne.clientNom}
                  {ligne.villeLivraison ? ` · ${ligne.villeLivraison}` : ""}
                </span>
              </span>
              <span className="text-xs text-encre/65">{formatFcfa(ligne.soldeMontant)}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 rounded-3xl bg-surface p-5">
        <SelectField label="Livreur" value={livreurId} onChange={(e) => setLivreurId(e.target.value)}>
          {livreurs.map((l) => (
            <option key={l.id} value={l.id}>
              {l.nom}
            </option>
          ))}
        </SelectField>

        <p className="text-sm text-encre">
          {selection.size} commande{selection.size > 1 ? "s" : ""} sélectionnée{selection.size > 1 ? "s" : ""} ·
          Solde total à encaisser : {formatFcfa(total)}
        </p>

        {error && <p role="alert" className="text-sm text-litige">{error}</p>}

        <Button onClick={handleSubmit} disabled={loading || selection.size === 0}>
          {loading ? "Envoi..." : "Assigner et passer en livraison"}
        </Button>
      </div>
    </div>
  );
}
