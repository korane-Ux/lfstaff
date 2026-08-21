import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// v_solde_fournisseur / v_solde_livreur sont des vues : elles ne
// réappliquent pas forcément la RLS de `users`/`transactions` comme le
// ferait une requête directe sur ces tables. Pour rester cohérent avec le
// cantonnement par ville (migration 0010), on récupère d'abord la liste
// des livreurs/fournisseurs que l'appelant a le droit de voir (RLS sur
// `users` s'applique normalement ici — tout pour le super_admin, sa zone
// pour un gestionnaire), puis on filtre la vue avec ces identifiants.
export async function idsVisibles(
  supabase: SupabaseClient<Database>,
  role: "fournisseur" | "livreur",
): Promise<string[]> {
  const { data } = await supabase.from("users").select("id").eq("role", role);
  return (data ?? []).map((u) => u.id);
}
