import { createClient } from "@/lib/supabase/server";
import { formatFcfa } from "@/lib/etats";
import { MarquerPayeAction } from "@/components/gestionnaire/marquer-paye-action";

export default async function RetraitsPage() {
  const supabase = await createClient();

  const { data: demandes } = await supabase
    .from("demandes_retrait")
    .select("id, livreur_id, montant, created_at")
    .eq("statut", "en_attente")
    .order("created_at");

  const livreurIds = [...new Set((demandes ?? []).map((d) => d.livreur_id))];
  const { data: livreurs } = livreurIds.length
    ? await supabase.from("users").select("id, nom").in("id", livreurIds)
    : { data: [] };
  const nomLivreur = new Map((livreurs ?? []).map((l) => [l.id, l.nom]));

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-4">
      <h1 className="font-display text-2xl text-encre">Retraits à traiter</h1>

      {!demandes?.length && (
        <p className="rounded-2xl bg-surface p-6 text-center text-sm text-encre/60">
          Aucune demande en attente.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {demandes?.map((demande) => (
          <div
            key={demande.id}
            className="flex items-center justify-between rounded-2xl bg-surface p-4"
          >
            <div>
              <p className="text-sm font-medium text-encre">
                {nomLivreur.get(demande.livreur_id) ?? "Livreur"}
              </p>
              <p className="text-xs text-encre/60">{formatFcfa(demande.montant)}</p>
            </div>
            <MarquerPayeAction
              demandeId={demande.id}
              livreurId={demande.livreur_id}
              montant={demande.montant}
            />
          </div>
        ))}
      </div>
    </main>
  );
}
