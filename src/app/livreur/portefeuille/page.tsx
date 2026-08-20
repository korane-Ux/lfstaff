import { requireRole } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { formatFcfa } from "@/lib/etats";
import { DemanderRetraitAction } from "@/components/livreur/demander-retrait-action";

export default async function PortefeuillePage() {
  const profile = await requireRole(["livreur"]);
  const supabase = await createClient();

  const [{ data: solde }, { data: demandeEnCours }] = await Promise.all([
    supabase.from("v_solde_livreur").select("*").eq("livreur_id", profile.id).single(),
    supabase
      .from("demandes_retrait")
      .select("id, montant")
      .eq("livreur_id", profile.id)
      .eq("statut", "en_attente")
      .maybeSingle(),
  ]);

  const cashEnMain = solde?.cash_en_main ?? 0;
  const commissionsDues = solde?.commissions_dues ?? 0;
  const netARemettre = solde?.net_a_remettre ?? 0;

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-4">
      <h1 className="font-display text-2xl text-encre">Portefeuille</h1>

      <div className="flex flex-col gap-2 rounded-2xl bg-surface p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-encre/70">Cash en main</span>
          <span className="font-medium text-encre">{formatFcfa(cashEnMain)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-encre/70">Commissions dues</span>
          <span className="font-medium text-encre">{formatFcfa(commissionsDues)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between border-t border-encre/10 pt-2 text-sm">
          <span className="font-medium text-encre">
            {netARemettre >= 0 ? "À remettre à la gestionnaire" : "À recevoir de la gestionnaire"}
          </span>
          <span className="font-display text-lg text-braise">{formatFcfa(Math.abs(netARemettre))}</span>
        </div>
      </div>

      {demandeEnCours ? (
        <p className="rounded-2xl bg-surface p-4 text-center text-sm text-encre/60">
          Demande de {formatFcfa(demandeEnCours.montant)} en attente de traitement.
        </p>
      ) : netARemettre < 0 ? (
        <DemanderRetraitAction montant={Math.abs(netARemettre)} />
      ) : netARemettre > 0 ? (
        <p className="rounded-2xl bg-surface p-4 text-center text-sm text-encre/60">
          Remets ce montant à la gestionnaire en personne.
        </p>
      ) : (
        <p className="rounded-2xl bg-surface p-4 text-center text-sm text-encre/60">
          Rien à demander pour l&apos;instant.
        </p>
      )}

      <a
        href={`/releve/${profile.id}`}
        className="rounded-full bg-surface px-4 py-2 text-center text-sm font-medium text-encre/80"
      >
        Télécharger mon relevé
      </a>
    </main>
  );
}
