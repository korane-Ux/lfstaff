import { createClient } from "@/lib/supabase/server";
import { ProduitForm } from "@/components/gestionnaire/produit-form";

export default async function NouveauProduitPage() {
  const supabase = await createClient();
  const { data: fournisseurs } = await supabase
    .from("users")
    .select("id, nom")
    .eq("role", "fournisseur")
    .eq("actif", true)
    .order("nom");

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-4">
      <h1 className="font-display text-2xl text-encre">Nouveau produit</h1>
      <ProduitForm fournisseurs={fournisseurs ?? []} />
    </main>
  );
}
