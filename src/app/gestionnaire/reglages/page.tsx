import { getCurrentProfile } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { ReglagesForm } from "@/components/gestionnaire/reglages-form";

export default async function ReglagesPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { data: reglages } = await supabase
    .from("reglages")
    .select("taux_commission_livreur, pct_avance_fournisseur, pct_acompte_client, villes_actives")
    .single();

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-4">
      <h1 className="font-display text-2xl text-encre">Réglages</h1>

      {profile.role === "super_admin" ? (
        <ReglagesForm
          tauxCommissionLivreur={reglages?.taux_commission_livreur ?? 10}
          pctAvanceFournisseur={reglages?.pct_avance_fournisseur ?? 50}
          pctAcompteClient={reglages?.pct_acompte_client ?? 60}
          villesActives={reglages?.villes_actives ?? []}
        />
      ) : (
        <div className="flex flex-col gap-2 rounded-3xl bg-surface p-5 text-sm text-encre">
          <p>Commission du livreur : {reglages?.taux_commission_livreur}%</p>
          <p>Avance fournisseur suggérée : {reglages?.pct_avance_fournisseur}%</p>
          <p>Acompte client suggéré : {reglages?.pct_acompte_client}%</p>
          <p>Villes actives : {(reglages?.villes_actives ?? []).join(", ")}</p>
          <p className="mt-2 text-xs text-encre/65">Seul un super-admin peut modifier ces réglages.</p>
        </div>
      )}
    </main>
  );
}
