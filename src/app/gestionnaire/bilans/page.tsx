import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatFcfa } from "@/lib/etats";
import { calculerBilanPeriode } from "@/lib/bilans";
import { PERIODE_LABELS, PERIODE_ORDER, type PeriodeKey } from "@/lib/periode";

function estPeriodeKey(value: string | undefined): value is PeriodeKey {
  return value === "jour" || value === "semaine" || value === "mois";
}

export default async function BilansPage({
  searchParams,
}: {
  searchParams: Promise<{ periode?: string }>;
}) {
  const { periode: periodeParam } = await searchParams;
  const periode: PeriodeKey = estPeriodeKey(periodeParam) ? periodeParam : "semaine";

  const supabase = await createClient();

  const [bilan, { data: soldesFournisseurs }, { data: soldesLivreurs }] = await Promise.all([
    calculerBilanPeriode(supabase, periode),
    supabase.from("v_solde_fournisseur").select("fournisseur_id, total_recu"),
    supabase.from("v_solde_livreur").select("livreur_id, net_a_remettre"),
  ]);

  const fournisseursAvecSolde = (soldesFournisseurs ?? []).filter((s) => s.total_recu > 0);
  const livreursAPayer = (soldesLivreurs ?? []).filter((s) => s.net_a_remettre < 0);

  const allUserIds = [
    ...new Set([
      ...fournisseursAvecSolde.map((s) => s.fournisseur_id),
      ...livreursAPayer.map((s) => s.livreur_id),
    ]),
  ];
  const { data: users } = allUserIds.length
    ? await supabase.from("users").select("id, nom").in("id", allUserIds)
    : { data: [] };
  const nomUser = new Map((users ?? []).map((u) => [u.id, u.nom]));

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-encre">Bilans</h1>
        <a
          href={`/gestionnaire/bilans/rapport?periode=${periode}`}
          className="rounded-full bg-braise px-4 py-2 text-sm font-medium text-creme"
        >
          Télécharger le PDF
        </a>
      </div>

      <div className="flex gap-2">
        {PERIODE_ORDER.map((cle) => (
          <Link
            key={cle}
            href={`/gestionnaire/bilans?periode=${cle}`}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              cle === periode ? "bg-braise text-creme" : "bg-surface text-encre/70"
            }`}
          >
            {PERIODE_LABELS[cle]}
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-2 rounded-2xl bg-surface p-4">
        <p className="text-sm font-medium text-encre">Argent — {PERIODE_LABELS[periode].toLowerCase()}</p>
        <Ligne label="Encaissé" valeur={bilan.encaisse} />
        <Ligne label="Avances fournisseurs" valeur={-bilan.sortiesAvances} />
        <Ligne label="Commissions livreurs" valeur={-bilan.sortiesCommissions} />
        <Ligne label="Transport" valeur={-bilan.sortiesTransport} />
      </div>

      <div className="flex flex-col gap-2 rounded-2xl bg-surface p-4">
        <p className="text-sm font-medium text-encre">
          Commandes créées {PERIODE_LABELS[periode].toLowerCase()}
        </p>
        <Ligne label="Nombre" valeur={bilan.nombreCommandes} brut />
        <Ligne label="En attente d'encaissement" valeur={bilan.enAttente} />
        <Ligne label="Marge nette" valeur={bilan.margeNette} accent />
      </div>

      {(fournisseursAvecSolde.length > 0 || livreursAPayer.length > 0) && (
        <div className="flex flex-col gap-2 rounded-2xl bg-surface p-4">
          <p className="text-sm font-medium text-encre">Soldes en attente</p>
          {fournisseursAvecSolde.map((s) => (
            <div key={s.fournisseur_id} className="flex items-center justify-between text-sm">
              <span className="text-encre/70">
                {nomUser.get(s.fournisseur_id) ?? "Fournisseur"} (déjà versé)
              </span>
              <span className="text-encre">{formatFcfa(s.total_recu)}</span>
            </div>
          ))}
          {livreursAPayer.map((s) => (
            <div key={s.livreur_id} className="flex items-center justify-between text-sm">
              <span className="text-encre/70">{nomUser.get(s.livreur_id) ?? "Livreur"} (à payer)</span>
              <span className="text-encre">{formatFcfa(Math.abs(s.net_a_remettre))}</span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function Ligne({
  label,
  valeur,
  accent,
  brut,
}: {
  label: string;
  valeur: number;
  accent?: boolean;
  brut?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-encre/70">{label}</span>
      <span className={accent ? "font-display text-lg text-braise" : "text-encre"}>
        {brut ? valeur : formatFcfa(valeur)}
      </span>
    </div>
  );
}
