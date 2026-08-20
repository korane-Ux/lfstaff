import Link from "next/link";
import { requireRole } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { formatFcfa } from "@/lib/etats";

export default async function LivreurPage() {
  const profile = await requireRole(["livreur"]);
  const supabase = await createClient();

  const { data: commandes } = await supabase
    .from("commandes")
    .select("id, client_id, solde_montant, solde_paye")
    .eq("livreur_id", profile.id)
    .eq("etat", "en_livraison")
    .order("cree_le");

  const clientIds = [...new Set((commandes ?? []).map((c) => c.client_id))];
  const { data: clients } = clientIds.length
    ? await supabase.from("clients").select("id, nom, adresse, ville").in("id", clientIds)
    : { data: [] };
  const clientById = new Map((clients ?? []).map((c) => [c.id, c]));

  const aLivrer = (commandes ?? []).filter((c) => !c.solde_paye);

  return (
    <main className="flex flex-1 flex-col gap-3 px-4 py-4">
      <h1 className="font-display text-2xl text-encre">À livrer</h1>

      {!aLivrer.length && (
        <p className="mt-8 text-center text-sm text-encre/60">Aucune livraison pour l&apos;instant.</p>
      )}

      <div className="flex flex-col gap-2">
        {aLivrer.map((commande) => {
          const client = clientById.get(commande.client_id);
          return (
            <Link
              key={commande.id}
              href={`/livreur/commandes/${commande.id}`}
              className="flex items-center justify-between rounded-2xl bg-surface p-4"
            >
              <div>
                <p className="text-sm font-medium text-encre">{client?.nom ?? "Client"}</p>
                <p className="text-xs text-encre/60">
                  {[client?.adresse, client?.ville].filter(Boolean).join(" · ")}
                </p>
              </div>
              <p className="text-sm text-encre/80">{formatFcfa(commande.solde_montant)}</p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
