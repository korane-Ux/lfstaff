import type { AppRole } from "@/lib/supabase/types";

// Aucune dépendance serveur ici (pas de next/headers) — c'est justement
// ce qui permet à ce module d'être importé depuis un composant client
// (ex. la page de login) sans entraîner tout src/lib/supabase/auth.ts
// (et son import de next/headers) dans le bundle navigateur.
export function roleHome(role: AppRole) {
  if (role === "fournisseur") return "/fournisseur";
  if (role === "livreur") return "/livreur";
  return "/gestionnaire";
}
