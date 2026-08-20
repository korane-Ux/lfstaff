"use client";

import { useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatFcfa } from "@/lib/etats";
import { PhotoInput } from "@/components/ui/photo-input";
import { Button } from "@/components/ui/button";
import { SelectField, TextareaField } from "@/components/ui/field";

type Client = { id: string; nom: string };
type Produit = {
  id: string;
  nom: string;
  prix_final: number | null;
  photo_url: string | null;
  categorie: string | null;
};

export function CommandeForm({
  clients,
  produits,
  pctAcompte,
  villes,
}: {
  clients: Client[];
  produits: Produit[];
  pctAcompte: number;
  villes: string[];
}) {
  const router = useRouter();
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [panier, setPanier] = useState<Record<string, number>>({});
  const [filtreCategorie, setFiltreCategorie] = useState<string | null>(null);
  const [villeLivraison, setVilleLivraison] = useState(villes[0] ?? "");
  const [specs, setSpecs] = useState("");
  const [photoRef, setPhotoRef] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const categories = useMemo(
    () => [...new Set(produits.map((p) => p.categorie).filter((c): c is string => !!c))],
    [produits],
  );

  const produitsAffiches = filtreCategorie
    ? produits.filter((p) => p.categorie === filtreCategorie)
    : produits;

  const lignesPanier = Object.entries(panier)
    .filter(([, qte]) => qte > 0)
    .map(([produitId, qte]) => {
      const produit = produits.find((p) => p.id === produitId);
      return { produit, quantite: qte, sousTotal: (produit?.prix_final ?? 0) * qte };
    })
    .filter((l) => l.produit);

  const total = lignesPanier.reduce((sum, l) => sum + l.sousTotal, 0);
  const acompteSuggere = Math.round((total * pctAcompte) / 100);

  function ajuster(produitId: string, delta: number) {
    setPanier((prev) => {
      const next = Math.max(0, (prev[produitId] ?? 0) + delta);
      return { ...prev, [produitId]: next };
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!lignesPanier.length) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("commandes").insert(
      lignesPanier.map((ligne) => {
        const prixTotal = ligne.sousTotal;
        const acompte = Math.round((prixTotal * pctAcompte) / 100);
        return {
          client_id: clientId,
          produit_id: ligne.produit!.id,
          quantite: ligne.quantite,
          prix_total: prixTotal,
          acompte_montant: acompte,
          solde_montant: prixTotal - acompte,
          ville_livraison: villeLivraison || null,
          specs: specs || null,
          photo_ref: photoRef,
        };
      }),
    );

    setLoading(false);

    if (insertError) {
      setError("Impossible de créer la commande.");
      return;
    }

    router.replace("/gestionnaire");
    router.refresh();
  }

  if (!clients.length) {
    return (
      <p className="rounded-2xl bg-surface p-6 text-center text-sm text-encre/65">
        Il faut d&apos;abord un client.{" "}
        <Link href="/gestionnaire/clients/nouveau" className="underline">
          En créer un
        </Link>
        .
      </p>
    );
  }

  if (!produits.length) {
    return (
      <p className="rounded-2xl bg-surface p-6 text-center text-sm text-encre/65">
        Il faut d&apos;abord un produit au catalogue.{" "}
        <Link href="/gestionnaire/produits/nouveau" className="underline">
          En créer un
        </Link>
        .
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="rounded-3xl bg-surface p-5">
        <SelectField label="Client" value={clientId} onChange={(e) => setClientId(e.target.value)}>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </SelectField>
      </div>

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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {produitsAffiches.map((produit) => {
          const qte = panier[produit.id] ?? 0;
          return (
            <div key={produit.id} className="flex flex-col overflow-hidden rounded-2xl bg-surface">
              <div className="relative aspect-square w-full bg-creme">
                {produit.photo_url ? (
                  <Image
                    src={produit.photo_url}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-encre/65">
                    Pas de photo
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1 p-3">
                <p className="truncate text-sm font-medium text-encre">{produit.nom}</p>
                <p className="text-sm font-medium text-braise">{formatFcfa(produit.prix_final)}</p>
                <div className="mt-1 flex items-center justify-between">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => ajuster(produit.id, -1)}
                    disabled={qte === 0}
                  >
                    −
                  </Button>
                  <span className="text-sm font-medium text-encre">{qte}</span>
                  <Button type="button" size="sm" variant="ghost" onClick={() => ajuster(produit.id, 1)}>
                    +
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-4 rounded-3xl bg-surface p-5">
        <p className="text-sm font-medium text-encre">
          {lignesPanier.length
            ? `${lignesPanier.length} produit${lignesPanier.length > 1 ? "s" : ""} · Total ${formatFcfa(total)} · Acompte suggéré ${formatFcfa(acompteSuggere)}`
            : "Ajoute au moins un produit ci-dessus."}
        </p>

        {villes.length > 0 && (
          <SelectField
            label="Ville de livraison"
            value={villeLivraison}
            onChange={(e) => setVilleLivraison(e.target.value)}
          >
            {villes.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </SelectField>
        )}

        <TextareaField
          label="Précisions (optionnel)"
          value={specs}
          onChange={(e) => setSpecs(e.target.value)}
          rows={2}
        />

        <PhotoInput dossier="commandes" onUploaded={setPhotoRef} />

        {error && <p role="alert" className="text-sm text-litige">{error}</p>}

        <Button type="submit" disabled={loading || !lignesPanier.length}>
          {loading ? "Création..." : "Créer la commande"}
        </Button>
      </div>
    </form>
  );
}
