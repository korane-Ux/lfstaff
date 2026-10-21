// Heure du Cameroun (UTC+1, pas d'heure d'été). Le serveur tourne souvent
// en UTC : on ne se fie jamais à son horloge locale (même raison que
// periode.ts).
const FUSEAU = "Africa/Douala";

export function salutation(instant: Date = new Date()): string {
  const heure = Number(
    new Intl.DateTimeFormat("fr-FR", { hour: "numeric", hour12: false, timeZone: FUSEAU }).format(instant),
  );
  if (heure < 5) return "Bonne nuit";
  if (heure < 12) return "Bonjour";
  if (heure < 18) return "Bon après-midi";
  return "Bonsoir";
}

export function dateDuJour(instant: Date = new Date()): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: FUSEAU,
  }).format(instant);
}

// « aujourd'hui » au format AAAA-MM-JJ, en heure du Cameroun — pour comparer
// avec les colonnes date (ex. date_arrivee_prevue).
export function aujourdhuiIso(instant: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: FUSEAU }).format(instant);
}

const RELATIF = new Intl.RelativeTimeFormat("fr-FR", { numeric: "auto" });

// « il y a 5 min », « hier », « il y a 3 jours » : plus parlant qu'une date
// brute pour lire une activité récente d'un coup d'œil.
export function ilYA(date: string | Date, maintenant: Date = new Date()): string {
  const secondes = Math.round((new Date(date).getTime() - maintenant.getTime()) / 1000);
  const abs = Math.abs(secondes);
  if (abs < 60) return "à l'instant";
  if (abs < 3600) return RELATIF.format(Math.round(secondes / 60), "minute");
  if (abs < 86400) return RELATIF.format(Math.round(secondes / 3600), "hour");
  if (abs < 86400 * 30) return RELATIF.format(Math.round(secondes / 86400), "day");
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: FUSEAU }).format(
    new Date(date),
  );
}
