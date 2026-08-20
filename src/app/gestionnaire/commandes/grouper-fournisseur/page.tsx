import { createClient } from "@/lib/supabase/server";
import { GrouperFournisseurForm } from "@/components/gestionnaire/grouper-fournisseur-form";

export default async function GrouperFournisseurPage() {
  const supabase = await createClient();

  const [{ data: commandes }, { data: fournisseurs }, { data: reglages }] = await Promise.all([
    supabase
      .from("commandes")
      .select("id, client_id, produit_id, prix_total")
      .eq("etat", "validee")
      .order("cree_le"),
    supabase.from("users").select("id, nom").eq("role", "fournisseur").eq("actif", true),
    supabase.from("reglages").select("pct_avance_fournisseur").single(),
  ]);

  const clientIds = [...new Set((commandes ?? []).map((c) => c.client_id))];
  const produitIds = [...new Set((commandes ?? []).map((c) => c.produit_id))];
  const [{ data: clients }, { data: produits }] = await Promise.all([
    clientIds.length ? supabase.from("clients").select("id, nom").in("id", clientIds) : Promise.resolve({ data: [] }),
    produitIds.length
      ? supabase.from("produits").select("id, nom, photo_url, categorie").in("id", produitIds)
      : Promise.resolve({ data: [] }),
  ]);

  const clientNom = new Map((clients ?? []).map((c) => [c.id, c.nom]));
  const produitById = new Map((produits ?? []).map((p) => [p.id, p]));

  const lignes = (commandes ?? []).map((c) => ({
    id: c.id,
    prixTotal: c.prix_total,
    clientNom: clientNom.get(c.client_id) ?? "Client",
    produitNom: produitById.get(c.produit_id)?.nom ?? "Produit",
    produitPhoto: produitById.get(c.produit_id)?.photo_url ?? null,
    produitCategorie: produitById.get(c.produit_id)?.categorie ?? null,
  }));

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-4">
      <h1 className="font-display text-2xl text-encre">Grande commande — fournisseur</h1>
      <p className="text-sm text-encre/60">
        Regroupe plusieurs commandes validées et envoie l&apos;avance fournisseur en une seule fois.
      </p>

      {!lignes.length && (
        <p className="rounded-2xl bg-surface p-6 text-center text-sm text-encre/60">
          Aucune commande validée en attente d&apos;avance pour l&apos;instant.
        </p>
      )}

      {!!lignes.length && (
        <GrouperFournisseurForm
          lignes={lignes}
          fournisseurs={fournisseurs ?? []}
          pctAvance={reglages?.pct_avance_fournisseur ?? 50}
        />
      )}
    </main>
  );
}
