export type PeriodeKey = "jour" | "semaine" | "mois";

export const PERIODE_LABELS: Record<PeriodeKey, string> = {
  jour: "Aujourd'hui",
  semaine: "Cette semaine",
  mois: "Ce mois",
};

export const PERIODE_ORDER: PeriodeKey[] = ["jour", "semaine", "mois"];

// Cameroun = UTC+1 toute l'année (pas d'heure d'été). Le serveur qui exécute
// ce code peut tourner dans n'importe quel fuseau (souvent UTC en
// production) — on calcule donc "aujourd'hui" en heure du Cameroun à la
// main plutôt que de faire confiance à l'horloge locale du serveur.
const WAT_OFFSET_MS = 60 * 60 * 1000;

function dateString(annee: number, mois: number, jour: number) {
  const mm = String(mois + 1).padStart(2, "0");
  const dd = String(jour).padStart(2, "0");
  return `${annee}-${mm}-${dd}`;
}

export function calculerPeriode(cle: PeriodeKey, instant: Date = new Date()) {
  const enCameroun = new Date(instant.getTime() + WAT_OFFSET_MS);
  const annee = enCameroun.getUTCFullYear();
  const mois = enCameroun.getUTCMonth();
  const jour = enCameroun.getUTCDate();
  const jourSemaine = enCameroun.getUTCDay();

  let anneeDebut = annee;
  let moisDebut = mois;
  let jourDebut = jour;

  if (cle === "semaine") {
    const decalage = jourSemaine === 0 ? -6 : 1 - jourSemaine;
    const d = new Date(Date.UTC(annee, mois, jour + decalage));
    anneeDebut = d.getUTCFullYear();
    moisDebut = d.getUTCMonth();
    jourDebut = d.getUTCDate();
  } else if (cle === "mois") {
    jourDebut = 1;
  }

  const debutDate = dateString(anneeDebut, moisDebut, jourDebut);
  const finDate = dateString(annee, mois, jour);

  const debutInstant = new Date(
    Date.UTC(anneeDebut, moisDebut, jourDebut) - WAT_OFFSET_MS,
  ).toISOString();
  const finInstant = new Date(Date.UTC(annee, mois, jour + 1) - WAT_OFFSET_MS).toISOString();

  return { debutDate, finDate, debutInstant, finInstant };
}
