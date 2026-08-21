"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { TextareaField } from "@/components/ui/field";

type Reponse = {
  fournisseurId: string;
  fournisseurNom: string;
  disponible: boolean | null;
  quantiteDisponible: number | null;
};

type Alerte = {
  id: string;
  message: string | null;
  createdAt: string;
  reponses: Reponse[];
};

export function AlerteDisponibilite({
  produitId,
  fournisseurs,
  historique = [],
}: {
  produitId: string;
  fournisseurs: { id: string; nom: string }[];
  historique?: Alerte[];
}) {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [selection, setSelection] = useState<Set<string>>(new Set(fournisseurs.map((f) => f.id)));
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggle(id: string) {
    setSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function envoyer() {
    if (!selection.size) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: alerte, error: insertError } = await supabase
      .from("alertes_disponibilite")
      .insert({ produit_id: produitId, message: message || null })
      .select("id")
      .single();

    if (insertError || !alerte) {
      setError("Impossible d'envoyer l'alerte.");
      setLoading(false);
      return;
    }

    const { error: reponsesError } = await supabase.from("alerte_reponses").insert(
      [...selection].map((fournisseurId) => ({ alerte_id: alerte.id, fournisseur_id: fournisseurId })),
    );

    setLoading(false);

    if (reponsesError) {
      setError("Alerte créée mais impossible de la transmettre à tous les fournisseurs.");
      return;
    }

    setOuvert(false);
    setMessage("");
    router.refresh();
  }

  if (!fournisseurs.length) return null;

  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-surface p-5">
      <p className="text-sm font-medium text-encre">Disponibilité chez les fournisseurs</p>

      {historique.length > 0 && (
        <div className="flex flex-col gap-2">
          {historique.map((alerte) => (
            <div key={alerte.id} className="flex flex-col gap-1 rounded-xl bg-creme p-3">
              <p className="text-xs text-encre/65">
                {new Date(alerte.createdAt).toLocaleDateString("fr-FR")}
                {alerte.message ? ` — ${alerte.message}` : ""}
              </p>
              {alerte.reponses.map((r) => (
                <div key={r.fournisseurId} className="flex items-center justify-between text-sm">
                  <span className="text-encre">{r.fournisseurNom}</span>
                  <span
                    className={
                      r.disponible === true
                        ? "text-vert"
                        : r.disponible === false
                          ? "text-litige"
                          : "text-encre/65"
                    }
                  >
                    {r.disponible === true
                      ? `Disponible${r.quantiteDisponible ? ` (${r.quantiteDisponible})` : ""}`
                      : r.disponible === false
                        ? "Indisponible"
                        : "En attente"}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {!ouvert ? (
        <Button type="button" variant="ghost" size="sm" onClick={() => setOuvert(true)} className="self-start">
          Demander la disponibilité
        </Button>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            {fournisseurs.map((f) => {
              const coche = selection.has(f.id);
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => toggle(f.id)}
                  className="flex items-center gap-2 text-left text-sm text-encre"
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-none border ${
                      coche ? "border-braise bg-braise text-accent-fg" : "border-encre/25 bg-creme"
                    }`}
                  >
                    {coche && "✓"}
                  </span>
                  {f.nom}
                </button>
              );
            })}
          </div>

          <TextareaField
            label="Message (optionnel)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
          />

          {error && <p role="alert" className="text-xs text-litige">{error}</p>}

          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" className="flex-1" onClick={() => setOuvert(false)}>
              Annuler
            </Button>
            <Button
              type="button"
              size="sm"
              className="flex-1"
              disabled={loading || !selection.size}
              onClick={envoyer}
            >
              {loading ? "Envoi..." : `Envoyer (${selection.size})`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
