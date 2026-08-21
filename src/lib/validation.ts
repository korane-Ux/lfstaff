// Validation légère côté client : signale une saisie visiblement fausse
// avant l'envoi, en plus du blocage natif (pattern) sur les champs
// concernés. Les champs restent optionnels — une valeur vide est valide.

export function telephoneValide(valeur: string): boolean {
  if (!valeur.trim()) return true;
  return /^[0-9+ ]{6,20}$/.test(valeur.trim());
}

export function emailValide(valeur: string): boolean {
  if (!valeur.trim()) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valeur.trim());
}

export const MESSAGE_TELEPHONE_INVALIDE =
  "Numéro invalide — chiffres uniquement (+ et espaces acceptés).";
export const MESSAGE_EMAIL_INVALIDE = "Adresse email invalide.";
