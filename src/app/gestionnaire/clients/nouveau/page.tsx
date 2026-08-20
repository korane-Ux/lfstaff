import { createClient } from "@/lib/supabase/server";
import { ClientForm } from "@/components/gestionnaire/client-form";

export default async function NouveauClientPage() {
  const supabase = await createClient();
  const { data: reglages } = await supabase.from("reglages").select("villes_actives").single();

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-4">
      <h1 className="font-display text-2xl text-encre">Nouveau client</h1>
      <ClientForm villes={reglages?.villes_actives ?? []} />
    </main>
  );
}
