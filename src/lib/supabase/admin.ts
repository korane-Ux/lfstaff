import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// Ne jamais importer ce fichier depuis un composant client ("use client") :
// la clé secrète donne un accès total à la base, RLS et auth incluses.
// Réservé aux Route Handlers qui ont explicitement besoin de créer des
// comptes (auth.admin.createUser n'a pas d'équivalent avec la clé anon).
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
