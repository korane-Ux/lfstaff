// Numéros locaux saisis sans indicatif la plupart du temps (ex. "677123456") ;
// wa.me exige le format international. On complète avec l'indicatif
// Cameroun (237) uniquement quand le numéro n'en a manifestement pas déjà un.
export function numeroInternational(telephone: string): string {
  const chiffres = telephone.replace(/\D/g, "");
  if (chiffres.startsWith("237")) return chiffres;
  return `237${chiffres.replace(/^0+/, "")}`;
}

export function lienWhatsapp(telephone: string, message: string): string {
  return `https://wa.me/${numeroInternational(telephone)}?text=${encodeURIComponent(message)}`;
}

export function lienAppel(telephone: string): string {
  return `tel:+${numeroInternational(telephone)}`;
}

export function lienSms(telephone: string, message: string): string {
  return `sms:+${numeroInternational(telephone)}?body=${encodeURIComponent(message)}`;
}
