import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { ClientForm } from "@/components/gestionnaire/client-form";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const [{ data: client }, { data: reglages }] = await Promise.all([
    supabase
      .from("clients")
      .select("id, nom, telephone, ville, quartier, adresse, notes")
      .eq("id", id)
      .single(),
    supabase.from("reglages").select("villes_actives").single(),
  ]);

  if (!client) notFound();

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-4">
      <h1 className="font-display text-2xl text-encre">{client.nom}</h1>
      <ClientForm
        client={client}
        villes={reglages?.villes_actives ?? []}
        isSuperAdmin={profile.role === "super_admin"}
      />
    </main>
  );
}
