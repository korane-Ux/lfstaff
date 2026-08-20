import { lienAppel, lienSms, lienWhatsapp } from "@/lib/contact";

// Trois raccourcis pour joindre quelqu'un depuis la fiche commande — pas de
// backend d'envoi de message, juste des liens natifs (wa.me / tel: / sms:)
// pré-remplis avec un message personnalisé, ouverts dans l'app installée.
export function ContactActions({
  telephone,
  nom,
  message,
}: {
  telephone: string | null;
  nom: string;
  message: string;
}) {
  if (!telephone) {
    return <p className="text-xs text-encre/65">Pas de numéro enregistré pour {nom}.</p>;
  }

  return (
    <div className="flex gap-2">
      <a
        href={lienWhatsapp(telephone, message)}
        target="_blank"
        rel="noreferrer"
        className="flex-1 rounded-none bg-vert px-3 py-2 text-center text-xs font-medium text-accent-fg"
      >
        WhatsApp
      </a>
      <a href={lienAppel(telephone)} className="flex-1 rounded-none bg-braise px-3 py-2 text-center text-xs font-medium text-accent-fg">
        Appeler
      </a>
      <a
        href={lienSms(telephone, message)}
        className="flex-1 rounded-none bg-surface px-3 py-2 text-center text-xs font-medium text-encre/80"
      >
        SMS
      </a>
    </div>
  );
}
