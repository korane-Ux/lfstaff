import { createClient } from "@/lib/supabase/server";
import { formatFcfa } from "@/lib/etats";
import { RecevoirCashAction } from "@/components/gestionnaire/recevoir-cash-action";

export default async function RemisesPage() {
  const supabase = await createClient();

  const { data: soldes } = await supabase
    .from("v_solde_livreur")
    .select("livreur_id, net_a_remettre")
    .gt("net_a_remettre", 0)
    .order("net_a_remettre", { ascending: false });

  const livreurIds = (soldes ?? []).map((s) => s.livreur_id);
  const { data: livreurs } = livreurIds.length
    ? await supabase.from("users").select("id, nom").in("id", livreurIds)
    : { data: [] };
  const nomLivreur = new Map((livreurs ?? []).map((l) => [l.id, l.nom]));

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-4">
      <h1 className="font-display text-2xl text-encre">Remises à recevoir</h1>

      {!soldes?.length && (
        <p className="rounded-2xl bg-surface p-6 text-center text-sm text-encre/65">
          Aucun livreur ne doit remettre de cash pour l&apos;instant.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {soldes?.map((s) => (
          <div
            key={s.livreur_id}
            className="flex items-center justify-between gap-3 rounded-2xl bg-surface p-4"
          >
            <div>
              <p className="text-sm font-medium text-encre">
                {nomLivreur.get(s.livreur_id) ?? "Livreur"}
              </p>
              <p className="text-xs text-encre/65">{formatFcfa(s.net_a_remettre)}</p>
            </div>
            <RecevoirCashAction livreurId={s.livreur_id} montantSuggere={s.net_a_remettre} />
          </div>
        ))}
      </div>
    </main>
  );
}
