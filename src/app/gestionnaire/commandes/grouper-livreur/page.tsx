import { createClient } from "@/lib/supabase/server";
import { GrouperLivreurForm } from "@/components/gestionnaire/grouper-livreur-form";

export default async function GrouperLivreurPage() {
  const supabase = await createClient();

  const [{ data: commandes }, { data: livreurs }] = await Promise.all([
    supabase
      .from("commandes")
      .select("id, client_id, produit_id, solde_montant, ville_livraison")
      .eq("etat", "recue")
      .order("cree_le"),
    supabase.from("users").select("id, nom").eq("role", "livreur").eq("actif", true),
  ]);

  const clientIds = [...new Set((commandes ?? []).map((c) => c.client_id))];
  const produitIds = [...new Set((commandes ?? []).map((c) => c.produit_id))];
  const [{ data: clients }, { data: produits }] = await Promise.all([
    clientIds.length ? supabase.from("clients").select("id, nom").in("id", clientIds) : Promise.resolve({ data: [] }),
    produitIds.length
      ? supabase.from("produits").select("id, nom, photo_url").in("id", produitIds)
      : Promise.resolve({ data: [] }),
  ]);

  const clientNom = new Map((clients ?? []).map((c) => [c.id, c.nom]));
  const produitById = new Map((produits ?? []).map((p) => [p.id, p]));

  const lignes = (commandes ?? []).map((c) => ({
    id: c.id,
    soldeMontant: c.solde_montant,
    villeLivraison: c.ville_livraison,
    clientNom: clientNom.get(c.client_id) ?? "Client",
    produitNom: produitById.get(c.produit_id)?.nom ?? "Produit",
    produitPhoto: produitById.get(c.produit_id)?.photo_url ?? null,
  }));

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-4">
      <h1 className="font-display text-2xl text-encre">Grande commande — livreur</h1>
      <p className="text-sm text-encre/65">
        Regroupe plusieurs commandes reçues et prêtes, contrôlées conformes, et assigne-les d&apos;un coup à
        un livreur pour une même tournée.
      </p>

      {!lignes.length && (
        <p className="rounded-2xl bg-surface p-6 text-center text-sm text-encre/65">
          Aucune commande reçue en attente d&apos;assignation pour l&apos;instant.
        </p>
      )}

      {!!lignes.length && <GrouperLivreurForm lignes={lignes} livreurs={livreurs ?? []} />}
    </main>
  );
}
