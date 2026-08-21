import Image from "next/image";
import Link from "next/link";
import { requireRole } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { ETAT_META, formatFcfa } from "@/lib/etats";

export default async function HistoriqueFournisseurPage() {
  const profile = await requireRole(["fournisseur"]);
  const supabase = await createClient();

  const { data: commandes } = await supabase
    .from("commandes")
    .select("id, quantite, prix_total, produit_id, etat, updated_at")
    .eq("fournisseur_id", profile.id)
    .neq("etat", "en_creation")
    .order("updated_at", { ascending: false });

  const produitIds = [...new Set((commandes ?? []).map((c) => c.produit_id))];
  const { data: produits } = produitIds.length
    ? await supabase.from("produits").select("id, nom, photo_url").in("id", produitIds)
    : { data: [] };
  const produitParId = new Map((produits ?? []).map((p) => [p.id, p]));

  return (
    <main className="flex flex-1 flex-col gap-3 px-4 py-4">
      <h1 className="font-display text-2xl text-encre">Historique</h1>

      {!commandes?.length && (
        <p className="mt-8 text-center text-sm text-encre/65">
          Aucune pièce expédiée pour l&apos;instant.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {commandes?.map((commande) => {
          const produit = produitParId.get(commande.produit_id);
          return (
            <Link
              key={commande.id}
              href={`/fournisseur/commandes/${commande.id}`}
              className="flex items-center gap-3 rounded-2xl bg-surface p-4"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-creme">
                {produit?.photo_url && (
                  <Image src={produit.photo_url} alt="" fill sizes="56px" className="object-cover" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-encre">{produit?.nom ?? "Produit"}</p>
                <p className="text-xs text-encre/65">Quantité : {commande.quantite}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="flex items-center gap-1.5 text-xs text-encre/70">
                  <span className={`h-2 w-2 rounded-full ${ETAT_META[commande.etat].color}`} />
                  {ETAT_META[commande.etat].label}
                </span>
                <p className="text-xs text-encre/65">{formatFcfa(commande.prix_total)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
