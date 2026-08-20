import { requireRole } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { EquipeForm } from "@/components/gestionnaire/equipe-form";

export default async function NouveauMembrePage() {
  await requireRole(["super_admin"]);
  const supabase = await createClient();
  const { data: reglages } = await supabase.from("reglages").select("villes_actives").single();

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-4">
      <h1 className="font-display text-2xl text-encre">Nouveau membre</h1>
      <EquipeForm villes={reglages?.villes_actives ?? []} />
    </main>
  );
}
