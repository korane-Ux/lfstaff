import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export async function fetchCommandePourDocument(
  supabase: SupabaseClient<Database>,
  commandeId: string,
) {
  const { data: commande } = await supabase
    .from("commandes")
    .select("*")
    .eq("id", commandeId)
    .single();

  if (!commande) return null;

  const [{ data: client }, { data: produit }] = await Promise.all([
    supabase
      .from("clients")
      .select("nom, telephone, ville, quartier, adresse")
      .eq("id", commande.client_id)
      .single(),
    supabase.from("produits").select("nom").eq("id", commande.produit_id).single(),
  ]);

  return { commande, client, produit };
}

export type CommandePourDocument = NonNullable<
  Awaited<ReturnType<typeof fetchCommandePourDocument>>
>;

export function numeroCourt(commandeId: string) {
  return commandeId.slice(0, 8).toUpperCase();
}
