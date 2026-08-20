import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatFcfa } from "@/lib/etats";
import { formatSpecsMarmite } from "@/lib/produit-specs";

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
        <Link
          href="/gestionnaire/produits/nouveau"
          className="rounded-full bg-braise px-4 py-2 text-sm font-medium text-creme"
        >
          + Nouveau
        </Link>
      </div>

      {!produits?.length && (
        <p className="rounded-2xl bg-surface p-6 text-center text-sm text-encre/60">
          Aucun produit pour l&apos;instant.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {produits?.map((produit) => (
          <div
            key={produit.id}
            className="flex items-center gap-3 rounded-2xl bg-surface p-4"
          >
            {produit.photo_url ? (
              <Image
                src={produit.photo_url}
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 shrink-0 rounded-xl object-cover"
              />
            ) : (
              <div className="h-12 w-12 shrink-0 rounded-xl bg-creme" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-encre">{produit.nom}</p>
              <p className="text-xs text-encre/60">{formatSpecsMarmite(produit)}</p>
              {!produit.actif && <p className="text-xs text-encre/40">Inactif</p>}
            </div>
            <p className="text-sm text-encre/80">{formatFcfa(produit.prix_final)}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
