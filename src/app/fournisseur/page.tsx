import Image from "next/image";
import Link from "next/link";
import { requireRole } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { formatFcfa } from "@/lib/etats";

export default async function FournisseurPage() {
  const profile = await requireRole(["fournisseur"]);
  const supabase = await createClient();

  const { data: commandes } = await supabase
    .from("commandes")
    .select("id, quantite, prix_total, produit_id")
    .eq("fournisseur_id", profile.id)
    .eq("etat", "en_creation")
    .order("cree_le");

  const produitIds = [...new Set((commandes ?? []).map((c) => c.produit_id))];
  const { data: produits } = produitIds.length
    ? await supabase.from("produits").select("id, nom, photo_url").in("id", produitIds)
    : { data: [] };
  const produitParId = new Map((produits ?? []).map((p) => [p.id, p]));

  const valeurTotale = (commandes ?? []).reduce((total, c) => total + c.prix_total, 0);

  return (
    <main className="flex flex-1 flex-col gap-3 px-4 py-4">
      <h1 className="font-display text-2xl text-encre">À fondre</h1>

      {!!commandes?.length && (
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1 rounded-2xl bg-surface p-3">
            <p className="text-xs text-encre/60">Pièces à créer</p>
            <p className="font-display text-xl text-encre">{commandes.length}</p>
          </div>
          <div className="flex flex-col gap-1 rounded-2xl bg-surface p-3">
            <p className="text-xs text-encre/60">Valeur totale</p>
            <p className="font-display text-xl text-encre">{formatFcfa(valeurTotale)}</p>
          </div>
        </div>
      )}

      {!commandes?.length && (
        <p className="mt-8 text-center text-sm text-encre/60">Rien à fondre pour l&apos;instant.</p>
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
              <p className="text-xs text-encre/60">Quantité : {commande.quantite}</p>
            </div>
            <p className="text-sm text-encre/80">{formatFcfa(commande.prix_total)}</p>
          </Link>
          );
        })}
      </div>
    </main>
  );
}
