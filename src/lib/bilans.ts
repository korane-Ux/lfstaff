import type { SupabaseClient } from "@supabase/supabase-js";
import { calculerPeriode, type PeriodeKey } from "@/lib/periode";
import type { Database } from "@/lib/supabase/types";

export async function calculerBilanPeriode(
  supabase: SupabaseClient<Database>,
  periode: PeriodeKey,
) {
  const { debutDate, finDate, debutInstant, finInstant } = calculerPeriode(periode);

  const [{ data: transactionsPeriode }, { data: expeditionsPeriode }, { data: commandesPeriode }] =
    await Promise.all([
      supabase
        .from("transactions")
        .select("type, montant, sens")
        .gte("date", debutDate)
        .lte("date", finDate),
      supabase
        .from("expeditions")
        .select("frais_transport")
        .gte("date_depart", debutDate)
        .lte("date_depart", finDate),
      supabase
        .from("commandes")
        .select(
          "id, prix_total, avance_montant, commission_montant, acompte_montant, acompte_paye, solde_montant, solde_paye, etat",
        )
        .gte("cree_le", debutInstant)
        .lt("cree_le", finInstant),
    ]);

  const encaisse = (transactionsPeriode ?? [])
    .filter((t) => t.sens === "entree")
    .reduce((total, t) => total + t.montant, 0);

  const sortiesAvances = (transactionsPeriode ?? [])
    .filter((t) => t.type === "avance_fournisseur")
    .reduce((total, t) => total + t.montant, 0);

  const sortiesCommissions = (transactionsPeriode ?? [])
    .filter((t) => t.type === "commission_livreur")
    .reduce((total, t) => total + t.montant, 0);

  const sortiesTransport = (expeditionsPeriode ?? []).reduce(
    (total, e) => total + (e.frais_transport ?? 0),
    0,
  );

  const commandesActives = (commandesPeriode ?? []).filter((c) => c.etat !== "annulee");

  const enAttente = commandesActives.reduce((total, c) => {
    const acompteManquant = c.acompte_paye ? 0 : c.acompte_montant;
    const soldeManquant = c.solde_paye ? 0 : c.solde_montant;
    return total + acompteManquant + soldeManquant;
  }, 0);

  const margeNette = commandesActives.reduce(
    (total, c) => total + c.prix_total - (c.avance_montant ?? 0) - (c.commission_montant ?? 0),
    0,
  );

  return {
    debutDate,
    finDate,
    nombreCommandes: commandesActives.length,
    encaisse,
    sortiesAvances,
    sortiesCommissions,
    sortiesTransport,
    enAttente,
    margeNette,
  };
}

export type BilanPeriode = Awaited<ReturnType<typeof calculerBilanPeriode>>;
