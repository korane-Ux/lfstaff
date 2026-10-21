import { createClient } from "@/lib/supabase/server";
import { CommandeForm } from "@/components/gestionnaire/commande-form";

export default async function NouvelleVentePage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const { client: clientDemande } = await searchParams;
  const supabase = await createClient();

  const [{ data: clients }, { data: produits }, { data: reglages }] = await Promise.all([
    supabase.from("clients").select("id, nom").order("nom"),
    supabase
      .from("produits")
      .select("id, nom, prix_final, photo_url, categorie")
      .eq("actif", true)
      .order("nom"),
    supabase.from("reglages").select("pct_acompte_client, villes_actives").single(),
  ]);

  // ?client=… arrive de « Lui faire une vente » (après création d'un client)
  // ou de sa fiche : on ne le présélectionne que s'il est bien visible.
  const clientInitial = (clients ?? []).some((c) => c.id === clientDemande) ? clientDemande : undefined;

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-4">
      <h1 className="font-display text-2xl text-encre">Nouvelle vente</h1>
      <CommandeForm
        clients={clients ?? []}
        produits={produits ?? []}
        pctAcompte={reglages?.pct_acompte_client ?? 60}
        villes={reglages?.villes_actives ?? []}
        clientInitial={clientInitial}
      />
    </main>
  );
}
