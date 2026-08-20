"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PhotoInput } from "@/components/ui/photo-input";
import { Button } from "@/components/ui/button";
import { ConfirmDangerDialog } from "@/components/ui/confirm-danger-dialog";
import { ProduitGalerie } from "@/components/gestionnaire/produit-galerie";
import { supprimerPhoto } from "@/lib/supabase/storage";
import { TextField, TextareaField } from "@/components/ui/field";

type ProduitExistant = {
  id: string;
  nom: string;
  photo_url: string | null;
  categorie: string | null;
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

export function ProduitForm({
  produit,
  images = [],
}: {
  produit?: ProduitExistant;
  images?: { id: string; url: string; position: number }[];
}) {
  const router = useRouter();
  const [photoUrl, setPhotoUrl] = useState<string | null>(produit?.photo_url ?? null);
  const [nom, setNom] = useState(produit?.nom ?? "");
  const [categorie, setCategorie] = useState(produit?.categorie ?? "");
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
      categorie: categorie || null,
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

  async function handleSupprimer() {
    const supabase = createClient();
    if (!produit) return;

    const { error: deleteImagesError } = await supabase
      .from("produit_images")
      .delete()
      .eq("produit_id", produit.id);
    if (deleteImagesError) throw deleteImagesError;

    for (const image of images) {
      await supprimerPhoto(image.url);
    }
    if (produit.photo_url) await supprimerPhoto(produit.photo_url);

    const { error: deleteError } = await supabase.from("produits").delete().eq("id", produit.id);
    if (deleteError) {
      throw new Error(
        deleteError.code === "23503"
          ? "Ce produit est utilisé par des commandes existantes, impossible de le supprimer."
          : deleteError.message,
      );
    }

    router.replace("/gestionnaire/produits");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-3xl bg-surface p-5">
      <TextField label="Nom" required value={nom} onChange={(e) => setNom(e.target.value)} />

      <TextField
        label="Catégorie"
        hint="optionnel"
        value={categorie}
        onChange={(e) => setCategorie(e.target.value)}
        placeholder="Marmites, couvercles, accessoires..."
      />

      <PhotoInput dossier="produits" onUploaded={setPhotoUrl} />

      {produit && <ProduitGalerie produitId={produit.id} images={images} />}

      <p className="text-sm font-medium text-encre/80">Mesures de la marmite</p>

      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Contenance"
          hint="L"
          type="number"
          min={0}
          step={0.5}
          value={contenance}
          onChange={(e) => setContenance(e.target.value)}
        />
        <TextField
          label="Diamètre"
          hint="cm"
          type="number"
          min={0}
          step={0.5}
          value={diametre}
          onChange={(e) => setDiametre(e.target.value)}
        />
        <TextField
          label="Hauteur"
          hint="cm"
          type="number"
          min={0}
          step={0.5}
          value={hauteur}
          onChange={(e) => setHauteur(e.target.value)}
        />
        <TextField
          label="Poids"
          hint="kg"
          type="number"
          min={0}
          step={0.1}
          value={poids}
          onChange={(e) => setPoids(e.target.value)}
        />
        <TextField
          label="Nombre d'anses"
          type="number"
          min={0}
          value={nbAnses}
          onChange={(e) => setNbAnses(e.target.value)}
        />

        <div className="flex flex-col gap-1.5 text-sm text-encre">
          <span className="font-medium text-encre/80">Couvercle</span>
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

      <TextareaField
        label="Précisions (optionnel)"
        value={precisions}
        onChange={(e) => setPrecisions(e.target.value)}
        rows={2}
        placeholder="Gravure, coloris, finition..."
      />

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-encre/80">Prix</p>
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
        <TextField
          label="Prix"
          hint="FCFA"
          required
          type="number"
          min={0}
          value={prixManuel}
          onChange={(e) => setPrixManuel(e.target.value)}
        />
      ) : (
        <>
          <TextField
            label="Coût matière"
            hint="FCFA"
            required
            type="number"
            min={0}
            value={coutMatiere}
            onChange={(e) => setCoutMatiere(e.target.value)}
          />
          <TextField
            label="Marge"
            hint="%"
            required
            type="number"
            min={0}
            value={margePct}
            onChange={(e) => setMargePct(e.target.value)}
          />
        </>
      )}

      {error && <p role="alert" className="text-sm text-litige">{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Enregistrement..." : produit ? "Enregistrer" : "Créer le produit"}
      </Button>

      {produit && (
        <div className="mt-2 flex flex-col gap-2 rounded-2xl border border-litige/20 p-4">
          <p className="text-sm font-medium text-encre">Zone sensible</p>
          <p className="text-xs text-encre/65">
            La suppression est définitive et retire aussi toutes les photos de ce produit.
          </p>
          <ConfirmDangerDialog
            title="Supprimer ce produit ?"
            description={`"${produit.nom}" sera supprimé définitivement, avec toutes ses photos.`}
            confirmLabel="Supprimer"
            onConfirm={handleSupprimer}
            trigger={(open) => (
              <Button type="button" variant="danger" size="sm" onClick={open} className="self-start">
                Supprimer ce produit
              </Button>
            )}
          />
        </div>
      )}
    </form>
  );
}
