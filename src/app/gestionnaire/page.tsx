import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ETAT_ORDER, ETAT_META, formatFcfa } from "@/lib/etats";
import type { AppEtat } from "@/lib/supabase/types";

export default async function GestionnaireDashboard() {
  const supabase = await createClient();

  const [{ data: commandes }, { data: clients }, { data: produits }] = await Promise.all([
    supabase
      .from("commandes")
      .select("id, client_id, produit_id, prix_total, etat, cree_le")
      .order("cree_le", { ascending: false }),
    supabase.from("clients").select("id, nom"),
    supabase.from("produits").select("id, nom"),
  ]);

  const clientNom = new Map((clients ?? []).map((c) => [c.id, c.nom]));
  const produitNom = new Map((produits ?? []).map((p) => [p.id, p.nom]));

  const parEtat = new Map<AppEtat, typeof commandes>();
  for (const etat of ETAT_ORDER) parEtat.set(etat, []);
  for (const commande of commandes ?? []) {
    parEtat.get(commande.etat)?.push(commande);
  }

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-4">
      <h1 className="font-display text-2xl text-encre">Tableau de bord</h1>

      {!commandes?.length && (
        <p className="rounded-2xl bg-surface p-6 text-center text-sm text-encre/60">
          Aucune commande pour l&apos;instant.{" "}
          <Link href="/gestionnaire/commandes/nouvelle" className="underline">
            Créer la première
          </Link>
          .
        </p>
      )}

      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
        {ETAT_ORDER.map((etat) => {
          const items = parEtat.get(etat) ?? [];
          return (
            <div
              key={etat}
              className="flex w-[80vw] max-w-xs shrink-0 snap-start flex-col gap-2 rounded-2xl bg-surface p-3"
            >
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${ETAT_META[etat].color}`} />
                <p className="text-sm font-medium text-encre">{ETAT_META[etat].label}</p>
                <span className="ml-auto text-xs text-encre/50">{items.length}</span>
              </div>

              <div className="flex flex-col gap-2">
                {items.length === 0 && <p className="text-xs text-encre/40">—</p>}
                {items.map((commande) => (
                  <div key={commande.id} className="rounded-xl bg-creme p-3">
                    <p className="text-sm font-medium text-encre">
                      {clientNom.get(commande.client_id) ?? "Client"}
                    </p>
                    <p className="text-xs text-encre/60">
                      {produitNom.get(commande.produit_id) ?? "Produit"}
                    </p>
                    <p className="mt-1 text-xs text-encre/80">{formatFcfa(commande.prix_total)}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
