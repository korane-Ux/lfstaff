import { requireRole } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { formatFcfa } from "@/lib/etats";

export default async function PortefeuilleFournisseurPage() {
  const profile = await requireRole(["fournisseur"]);
  const supabase = await createClient();

  const { data: solde } = await supabase
    .from("v_solde_fournisseur")
    .select("total_recu")
    .eq("fournisseur_id", profile.id)
    .maybeSingle();

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-4">
      <h1 className="font-display text-2xl text-encre">Portefeuille</h1>

      <div className="flex flex-col gap-2 rounded-2xl bg-surface p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-encre/70">Total reçu de Le Foyer</span>
          <span className="font-display text-lg text-braise">
            {formatFcfa(solde?.total_recu ?? 0)}
          </span>
        </div>
      </div>

      <a
        href={`/releve/${profile.id}`}
        className="rounded-full bg-surface px-4 py-2 text-center text-sm font-medium text-encre/80"
      >
        Télécharger mon relevé
      </a>
    </main>
  );
}
