import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { ProduitForm } from "@/components/gestionnaire/produit-form";

export default async function ProduitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const [{ data: produit }, { data: images }, { data: fournisseurs }, { data: alertes }] =
    await Promise.all([
      supabase
        .from("produits")
        .select(
          "id, nom, photo_url, categorie, fournisseur_id, contenance_litres, diametre_cm, hauteur_cm, poids_kg, nb_anses, couvercle_inclus, caracteristiques, cout_matiere, marge_pct, prix_manuel",
        )
        .eq("id", id)
        .single(),
      supabase.from("produit_images").select("id, url, position").eq("produit_id", id).order("position"),
      supabase.from("users").select("id, nom").eq("role", "fournisseur").eq("actif", true).order("nom"),
      supabase
        .from("alertes_disponibilite")
        .select("id, message, created_at")
        .eq("produit_id", id)
        .order("created_at", { ascending: false }),
    ]);

  if (!produit) notFound();

  const alerteIds = (alertes ?? []).map((a) => a.id);
  const { data: reponses } = alerteIds.length
    ? await supabase
        .from("alerte_reponses")
        .select("alerte_id, fournisseur_id, disponible, quantite_disponible")
        .in("alerte_id", alerteIds)
    : { data: [] };

  const fournisseurIds = [...new Set((reponses ?? []).map((r) => r.fournisseur_id))];
  const { data: fournisseursAlertes } = fournisseurIds.length
    ? await supabase.from("users").select("id, nom").in("id", fournisseurIds)
    : { data: [] };
  const nomFournisseur = new Map((fournisseursAlertes ?? []).map((f) => [f.id, f.nom]));

  const historique = (alertes ?? []).map((a) => ({
    id: a.id,
    message: a.message,
    createdAt: a.created_at,
    reponses: (reponses ?? [])
      .filter((r) => r.alerte_id === a.id)
      .map((r) => ({
        fournisseurId: r.fournisseur_id,
        fournisseurNom: nomFournisseur.get(r.fournisseur_id) ?? "Fournisseur",
        disponible: r.disponible,
        quantiteDisponible: r.quantite_disponible,
      })),
  }));

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-4">
      <h1 className="font-display text-2xl text-encre">{produit.nom}</h1>
      <ProduitForm
        produit={produit}
        images={images ?? []}
        isSuperAdmin={profile.role === "super_admin"}
        fournisseurs={fournisseurs ?? []}
        historiqueAlertes={historique}
      />
    </main>
  );
}
