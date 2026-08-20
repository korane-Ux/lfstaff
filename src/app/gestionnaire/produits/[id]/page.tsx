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

  const [{ data: produit }, { data: images }] = await Promise.all([
    supabase
      .from("produits")
      .select(
        "id, nom, photo_url, categorie, contenance_litres, diametre_cm, hauteur_cm, poids_kg, nb_anses, couvercle_inclus, caracteristiques, cout_matiere, marge_pct, prix_manuel",
      )
      .eq("id", id)
      .single(),
    supabase.from("produit_images").select("id, url, position").eq("produit_id", id).order("position"),
  ]);

  if (!produit) notFound();

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-4">
      <h1 className="font-display text-2xl text-encre">{produit.nom}</h1>
      <ProduitForm produit={produit} images={images ?? []} isSuperAdmin={profile.role === "super_admin"} />
    </main>
  );
}
