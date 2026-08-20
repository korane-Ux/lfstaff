"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NouveauProduitPage() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [caracteristiques, setCaracteristiques] = useState("");
  const [modePrix, setModePrix] = useState<"manuel" | "auto">("manuel");
  const [coutMatiere, setCoutMatiere] = useState("");
  const [margePct, setMargePct] = useState("");
  const [prixManuel, setPrixManuel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("produits").insert({
      nom,
      caracteristiques: caracteristiques || null,
      cout_matiere: modePrix === "auto" && coutMatiere ? Number(coutMatiere) : null,
      marge_pct: modePrix === "auto" && margePct ? Number(margePct) : null,
      prix_manuel: modePrix === "manuel" && prixManuel ? Number(prixManuel) : null,
    });

    setLoading(false);

    if (insertError) {
      setError("Impossible d'enregistrer ce produit.");
      return;
    }

    router.replace("/gestionnaire/produits");
    router.refresh();
  }

  const inputClass =
    "rounded-xl border border-encre/15 bg-creme px-4 py-3 text-base text-encre outline-none focus:border-braise";

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-4">
      <h1 className="font-display text-2xl text-encre">Nouveau produit</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-3xl bg-surface p-5">
        <label className="flex flex-col gap-1 text-sm text-encre">
          Nom
          <input required value={nom} onChange={(e) => setNom(e.target.value)} className={inputClass} />
        </label>

        <label className="flex flex-col gap-1 text-sm text-encre">
          Caractéristiques
          <textarea
            value={caracteristiques}
            onChange={(e) => setCaracteristiques(e.target.value)}
            rows={3}
            className={inputClass}
          />
        </label>

        <div className="flex flex-col gap-2">
          <p className="text-sm text-encre">Prix</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setModePrix("manuel")}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium ${
                modePrix === "manuel" ? "bg-braise text-creme" : "bg-creme text-encre/70"
              }`}
            >
              Fixe
            </button>
            <button
              type="button"
              onClick={() => setModePrix("auto")}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium ${
                modePrix === "auto" ? "bg-braise text-creme" : "bg-creme text-encre/70"
              }`}
            >
              Calculé
            </button>
          </div>
        </div>

        {modePrix === "manuel" ? (
          <label className="flex flex-col gap-1 text-sm text-encre">
            Prix (FCFA)
            <input
              required
              type="number"
              min={0}
              value={prixManuel}
              onChange={(e) => setPrixManuel(e.target.value)}
              className={inputClass}
            />
          </label>
        ) : (
          <>
            <label className="flex flex-col gap-1 text-sm text-encre">
              Coût matière (FCFA)
              <input
                required
                type="number"
                min={0}
                value={coutMatiere}
                onChange={(e) => setCoutMatiere(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-encre">
              Marge (%)
              <input
                required
                type="number"
                min={0}
                value={margePct}
                onChange={(e) => setMargePct(e.target.value)}
                className={inputClass}
              />
            </label>
          </>
        )}

        {error && <p className="text-sm text-litige">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-braise px-4 py-3 text-base font-medium text-creme disabled:opacity-60"
        >
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>
    </main>
  );
}
