import { notFound } from "next/navigation";
import { requireRole } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { formatFcfa } from "@/lib/etats";
import { formatSpecsMarmite } from "@/lib/produit-specs";
import { PretAction } from "@/components/fournisseur/pret-action";

export default async function FournisseurCommandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireRole(["fournisseur"]);
  const supabase = await createClient();

  const { data: commande } = await supabase
    .from("commandes")
    .select("id, produit_id, quantite, prix_total, specs, fournisseur_id, etat, ville_livraison")
    .eq("id", id)
    .single();

  if (!commande || commande.fournisseur_id !== profile.id) notFound();

  const { data: produit } = await supabase
    .from("produits")
    .select(
      "nom, caracteristiques, contenance_litres, diametre_cm, hauteur_cm, poids_kg, nb_anses, couvercle_inclus",
    )
    .eq("id", commande.produit_id)
    .single();

  const { data: reglages } = await supabase.from("reglages").select("villes_actives").single();

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-4">
      <h1 className="font-display text-2xl text-encre">{produit?.nom}</h1>

      <div className="flex flex-col gap-1 rounded-2xl bg-surface p-4">
        <p className="text-sm text-encre/80">Quantité : {commande.quantite}</p>
        {produit && <p className="text-sm text-encre/80">{formatSpecsMarmite(produit)}</p>}
        {produit && (
          <p className="text-sm text-encre/80">
            {produit.nb_anses} anse{produit.nb_anses > 1 ? "s" : ""} ·{" "}
            {produit.couvercle_inclus ? "couvercle inclus" : "sans couvercle"}
          </p>
        )}
        {produit?.caracteristiques && (
          <p className="text-sm text-encre/80">{produit.caracteristiques}</p>
        )}
        {commande.specs && <p className="text-sm text-encre/80">Précisions : {commande.specs}</p>}
        <p className="text-sm text-encre/80">{formatFcfa(commande.prix_total)}</p>
      </div>

      {commande.etat === "en_creation" ? (
        <PretAction
          commandeId={commande.id}
          villes={reglages?.villes_actives ?? []}
          villeLivraison={commande.ville_livraison}
        />
      ) : (
        <p className="rounded-2xl bg-surface p-4 text-center text-sm text-encre/60">Déjà expédiée.</p>
      )}
    </main>
  );
}
