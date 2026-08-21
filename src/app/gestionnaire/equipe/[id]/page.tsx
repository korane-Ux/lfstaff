import { notFound } from "next/navigation";
import { requireRole } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { MembreForm } from "@/components/gestionnaire/membre-form";

export default async function MembreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["super_admin"]);

  const { id } = await params;
  const supabase = await createClient();

  const [{ data: membre }, { data: reglages }] = await Promise.all([
    supabase
      .from("users")
      .select("id, nom, telephone, ville, quartier, adresse, role, actif")
      .eq("id", id)
      .single(),
    supabase.from("reglages").select("villes_actives").single(),
  ]);

  if (!membre) notFound();

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-4">
      <h1 className="font-display text-2xl text-encre">{membre.nom}</h1>
      <MembreForm
        userId={membre.id}
        nomInitial={membre.nom}
        telephoneInitial={membre.telephone}
        villeInitial={membre.ville}
        quartierInitial={membre.quartier}
        adresseInitial={membre.adresse}
        role={membre.role}
        actifInitial={membre.actif}
        villes={reglages?.villes_actives ?? []}
      />
    </main>
  );
}
