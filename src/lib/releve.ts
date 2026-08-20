import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export async function fetchReleve(supabase: SupabaseClient<Database>, userId: string) {
  const [{ data: profil }, { data: transactions }] = await Promise.all([
    supabase.from("users").select("nom, role").eq("id", userId).single(),
    supabase
      .from("transactions")
      .select("date, type, montant")
      .eq("user_id", userId)
      .order("date", { ascending: false }),
  ]);

  return { profil, transactions: transactions ?? [] };
}

export type Releve = Awaited<ReturnType<typeof fetchReleve>>;
