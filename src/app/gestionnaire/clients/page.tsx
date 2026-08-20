import { createClient } from "@/lib/supabase/server";
import { LinkButton } from "@/components/ui/link-button";

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("id, nom, telephone, ville")
    .order("nom");

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-encre">Clients</h1>
        <LinkButton href="/gestionnaire/clients/nouveau">+ Nouveau</LinkButton>
      </div>

      {!clients?.length && (
        <p className="rounded-2xl bg-surface p-6 text-center text-sm text-encre/60">
          Aucun client pour l&apos;instant.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {clients?.map((client) => (
          <div key={client.id} className="rounded-2xl bg-surface p-4">
            <p className="text-sm font-medium text-encre">{client.nom}</p>
            <p className="text-xs text-encre/60">
              {[client.telephone, client.ville].filter(Boolean).join(" · ") || "—"}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
