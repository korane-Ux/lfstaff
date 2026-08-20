"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const inputClass =
  "rounded-xl border border-encre/15 bg-creme px-4 py-3 text-base text-encre outline-none focus:border-braise";

export function ReglagesForm({
  tauxCommissionLivreur,
  pctAvanceFournisseur,
  pctAcompteClient,
  villesActives,
}: {
  tauxCommissionLivreur: number;
  pctAvanceFournisseur: number;
  pctAcompteClient: number;
  villesActives: string[];
}) {
  const router = useRouter();
  const [taux, setTaux] = useState(String(tauxCommissionLivreur));
  const [pctAvance, setPctAvance] = useState(String(pctAvanceFournisseur));
  const [pctAcompte, setPctAcompte] = useState(String(pctAcompteClient));
  const [villes, setVilles] = useState(villesActives);
  const [nouvelleVille, setNouvelleVille] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [succes, setSucces] = useState(false);
  const [loading, setLoading] = useState(false);

  function ajouterVille() {
    const nom = nouvelleVille.trim();
    if (!nom || villes.includes(nom)) return;
    setVilles([...villes, nom]);
    setNouvelleVille("");
  }

  function retirerVille(nom: string) {
    setVilles(villes.filter((v) => v !== nom));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSucces(false);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("reglages")
      .update({
        taux_commission_livreur: Number(taux) || 0,
        pct_avance_fournisseur: Number(pctAvance) || 0,
        pct_acompte_client: Number(pctAcompte) || 0,
        villes_actives: villes,
      })
      .eq("id", true);

    setLoading(false);

    if (updateError) {
      setError("Impossible d'enregistrer les réglages.");
      return;
    }

    setSucces(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-3xl bg-surface p-5">
      <label className="flex flex-col gap-1 text-sm text-encre">
        Commission du livreur (%)
        <input
          type="number"
          min={0}
          max={100}
          step={0.5}
          value={taux}
          onChange={(e) => setTaux(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-encre">
        Avance fournisseur suggérée (%)
        <input
          type="number"
          min={0}
          max={100}
          step={0.5}
          value={pctAvance}
          onChange={(e) => setPctAvance(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-encre">
        Acompte client suggéré (%)
        <input
          type="number"
          min={0}
          max={100}
          step={0.5}
          value={pctAcompte}
          onChange={(e) => setPctAcompte(e.target.value)}
          className={inputClass}
        />
      </label>

      <div className="flex flex-col gap-2">
        <p className="text-sm text-encre">Villes actives</p>
        <div className="flex flex-wrap gap-2">
          {villes.map((v) => (
            <Button
              key={v}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => retirerVille(v)}
              className="flex items-center gap-1.5"
            >
              {v} <span className="text-encre/50">×</span>
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={nouvelleVille}
            onChange={(e) => setNouvelleVille(e.target.value)}
            placeholder="Ajouter une ville"
            className={`flex-1 ${inputClass}`}
          />
          <Button type="button" variant="ghost" onClick={ajouterVille}>
            Ajouter
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-litige">{error}</p>}
      {succes && <p className="text-sm text-vert">Réglages enregistrés.</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}
