import { requireRole } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { RoleHeader } from "@/components/layout/role-header";

export default async function LivreurPage() {
  const profile = await requireRole(["livreur"]);
  const supabase = await createClient();

  const { data: commandes } = await supabase
    .from("commandes")
    .select("id")
    .eq("livreur_id", profile.id)
    .eq("etat", "en_livraison");

  return (
    <div className="flex min-h-dvh flex-col bg-creme">
      <RoleHeader nom={profile.nom} role={profile.role} />
      <main className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
        <h1 className="font-display text-2xl text-encre">À livrer</h1>
        {commandes?.length ? (
          <p className="text-sm text-encre/70">
            {commandes.length} livraison{commandes.length > 1 ? "s" : ""} en attente — écran détaillé à venir.
          </p>
        ) : (
          <p className="text-sm text-encre/60">Aucune livraison pour l&apos;instant.</p>
        )}
      </main>
    </div>
  );
}
