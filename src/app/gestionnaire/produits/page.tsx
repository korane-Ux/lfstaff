import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatFcfa } from "@/lib/etats";
import { formatSpecsMarmite } from "@/lib/produit-specs";
import { LinkButton } from "@/components/ui/link-button";

export default async function ProduitsPage() {
  const supabase = await createClient();
  const { data: produits } = await supabase
    .from("produits")
    .select("id, nom, prix_final, actif, contenance_litres, diametre_cm, hauteur_cm, poids_kg, photo_url")
    .order("nom");

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-encre">Produits</h1>
        <LinkButton href="/gestionnaire/produits/nouveau">+ Nouveau</LinkButton>
      </div>

      {!produits?.length && (
        <p className="rounded-2xl bg-surface p-6 text-center text-sm text-encre/60">
          Aucun produit pour l&apos;instant.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {produits?.map((produit) => (
          <Link
            key={produit.id}
            href={`/gestionnaire/produits/${produit.id}`}
            className="flex flex-col overflow-hidden rounded-2xl bg-surface"
          >
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
                <div className="flex h-full w-full items-center justify-center text-xs text-encre/30">
                  Pas de photo
                </div>
              )}
              {!produit.actif && (
                <span className="absolute left-2 top-2 rounded-none bg-encre/70 px-2 py-0.5 text-[10px] font-medium text-creme">
                  Inactif
                </span>
              )}
            </div>
            <div className="flex flex-col gap-0.5 p-3">
              <p className="truncate text-sm font-medium text-encre">{produit.nom}</p>
              <p className="truncate text-xs text-encre/60">{formatSpecsMarmite(produit)}</p>
              <p className="mt-1 text-sm font-medium text-braise">{formatFcfa(produit.prix_final)}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
