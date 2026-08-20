"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PhotoInput } from "@/components/ui/photo-input";
import { Button } from "@/components/ui/button";

const inputClass =
  "rounded-xl border border-encre/15 bg-creme px-4 py-3 text-base text-encre outline-none focus:border-braise";

type ProduitExistant = {
  id: string;
  nom: string;
  photo_url: string | null;
  contenance_litres: number | null;
  diametre_cm: number | null;
  hauteur_cm: number | null;
  poids_kg: number | null;
  nb_anses: number;
  couvercle_inclus: boolean;
  caracteristiques: string | null;
  cout_matiere: number | null;
  marge_pct: number | null;
  prix_manuel: number | null;
};

export function ProduitForm({ produit }: { produit?: ProduitExistant }) {
  const router = useRouter();
  const [photoUrl, setPhotoUrl] = useState<string | null>(produit?.photo_url ?? null);
  const [nom, setNom] = useState(produit?.nom ?? "");
  const [contenance, setContenance] = useState(String(produit?.contenance_litres ?? ""));
  const [diametre, setDiametre] = useState(String(produit?.diametre_cm ?? ""));
  const [hauteur, setHauteur] = useState(String(produit?.hauteur_cm ?? ""));
  const [poids, setPoids] = useState(String(produit?.poids_kg ?? ""));
  const [nbAnses, setNbAnses] = useState(String(produit?.nb_anses ?? 2));
  const [couvercleInclus, setCouvercleInclus] = useState(produit?.couvercle_inclus ?? true);
  const [precisions, setPrecisions] = useState(produit?.caracteristiques ?? "");
  const [modePrix, setModePrix] = useState<"manuel" | "auto">(
    produit?.cout_matiere ? "auto" : "manuel",
  );
  const [coutMatiere, setCoutMatiere] = useState(String(produit?.cout_matiere ?? ""));
  const [margePct, setMargePct] = useState(String(produit?.marge_pct ?? ""));
  const [prixManuel, setPrixManuel] = useState(String(produit?.prix_manuel ?? ""));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      nom,
      photo_url: photoUrl,
      contenance_litres: contenance ? Number(contenance) : null,
      diametre_cm: diametre ? Number(diametre) : null,
      hauteur_cm: hauteur ? Number(hauteur) : null,
      poids_kg: poids ? Number(poids) : null,
      nb_anses: nbAnses ? Number(nbAnses) : 2,
      couvercle_inclus: couvercleInclus,
      caracteristiques: precisions || null,
      cout_matiere: modePrix === "auto" && coutMatiere ? Number(coutMatiere) : null,
      marge_pct: modePrix === "auto" && margePct ? Number(margePct) : null,
      prix_manuel: modePrix === "manuel" && prixManuel ? Number(prixManuel) : null,
    };

    const supabase = createClient();
    const { error: saveError } = produit
      ? await supabase.from("produits").update(payload).eq("id", produit.id)
      : await supabase.from("produits").insert(payload);

    setLoading(false);

    if (saveError) {
      setError("Impossible d'enregistrer ce produit.");
      return;
    }

    router.replace("/gestionnaire/produits");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-3xl bg-surface p-5">
      <label className="flex flex-col gap-1 text-sm text-encre">
        Nom
        <input required value={nom} onChange={(e) => setNom(e.target.value)} className={inputClass} />
      </label>

      <PhotoInput dossier="produits" onUploaded={setPhotoUrl} />

      <p className="text-sm text-encre">Mesures de la marmite</p>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm text-encre">
          Contenance (L)
          <input
            type="number"
            min={0}
            step={0.5}
            value={contenance}
            onChange={(e) => setContenance(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-encre">
          Diamètre (cm)
          <input
            type="number"
            min={0}
            step={0.5}
            value={diametre}
            onChange={(e) => setDiametre(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-encre">
          Hauteur (cm)
          <input
            type="number"
            min={0}
            step={0.5}
            value={hauteur}
            onChange={(e) => setHauteur(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-encre">
          Poids (kg)
          <input
            type="number"
            min={0}
            step={0.1}
            value={poids}
            onChange={(e) => setPoids(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-encre">
          Nombre d&apos;anses
          <input
            type="number"
            min={0}
            value={nbAnses}
            onChange={(e) => setNbAnses(e.target.value)}
            className={inputClass}
          />
        </label>

        <div className="flex flex-col gap-1 text-sm text-encre">
          Couvercle
          <div className="flex gap-2">
            <Button
              type="button"
              variant={couvercleInclus ? "primary" : "ghost"}
              onClick={() => setCouvercleInclus(true)}
              className="flex-1"
            >
              Inclus
            </Button>
            <Button
              type="button"
              variant={!couvercleInclus ? "primary" : "ghost"}
              onClick={() => setCouvercleInclus(false)}
              className="flex-1"
            >
              Sans
            </Button>
          </div>
        </div>
      </div>

      <label className="flex flex-col gap-1 text-sm text-encre">
        Précisions (optionnel)
        <textarea
          value={precisions}
          onChange={(e) => setPrecisions(e.target.value)}
          rows={2}
          placeholder="Gravure, coloris, finition..."
          className={inputClass}
        />
      </label>

      <div className="flex flex-col gap-2">
        <p className="text-sm text-encre">Prix</p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={modePrix === "manuel" ? "primary" : "ghost"}
            onClick={() => setModePrix("manuel")}
            className="flex-1"
          >
            Fixe
          </Button>
          <Button
            type="button"
            variant={modePrix === "auto" ? "primary" : "ghost"}
            onClick={() => setModePrix("auto")}
            className="flex-1"
          >
            Calculé
          </Button>
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

      <Button type="submit" disabled={loading}>
        {loading ? "Enregistrement..." : produit ? "Enregistrer" : "Créer le produit"}
      </Button>
    </form>
  );
}
