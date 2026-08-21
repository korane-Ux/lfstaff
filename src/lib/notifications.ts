import type { AppEtat } from "@/lib/supabase/types";
import { formatFcfa } from "@/lib/etats";

type ContexteEmail = {
  clientNom: string;
  produitNom: string;
  codeLivraison: string | null;
  motif: string | null;
  soldeMontant: number;
};

type Message = { objet: string; corps: string } | null;

// Toutes les étapes ne méritent pas un email — "nouvelle" est l'instant de
// la création elle-même (rien à annoncer), et le reste correspond à des
// jalons que le client comprend sans jargon interne.
export function messagePourEtat(etat: AppEtat, ctx: ContexteEmail): Message {
  const { clientNom, produitNom, codeLivraison, motif, soldeMontant } = ctx;

  switch (etat) {
    case "validee":
      return {
        objet: `Le Foyer — commande confirmée`,
        corps: `Bonjour ${clientNom},\n\nNous avons bien reçu votre acompte. Votre commande "${produitNom}" est confirmée et part en fabrication.\n\nMerci de votre confiance,\nLe Foyer`,
      };
    case "en_creation":
      return {
        objet: `Le Foyer — votre marmite est en fabrication`,
        corps: `Bonjour ${clientNom},\n\nVotre commande "${produitNom}" est maintenant en cours de fabrication chez notre fondeur.\n\nLe Foyer`,
      };
    case "expediee":
      return {
        objet: `Le Foyer — votre commande a quitté l'atelier`,
        corps: `Bonjour ${clientNom},\n\nVotre commande "${produitNom}" a quitté l'atelier et est en transit.\n\nLe Foyer`,
      };
    case "recue":
      return {
        objet: `Le Foyer — votre commande est arrivée`,
        corps: `Bonjour ${clientNom},\n\nVotre commande "${produitNom}" est arrivée dans notre entrepôt et sera bientôt en livraison.\n\nLe Foyer`,
      };
    case "en_livraison":
      return {
        objet: `Le Foyer — votre commande est en route`,
        corps: `Bonjour ${clientNom},\n\nVotre commande "${produitNom}" est en route vers vous.${
          codeLivraison ? ` Donnez ce code au livreur pour confirmer la réception : ${codeLivraison}.` : ""
        }${soldeMontant > 0 ? ` Solde à régler à la livraison : ${formatFcfa(soldeMontant)}.` : ""}\n\nLe Foyer`,
      };
    case "livree_validee":
      return {
        objet: `Le Foyer — livraison confirmée, merci !`,
        corps: `Bonjour ${clientNom},\n\nVotre commande "${produitNom}" a bien été livrée. Merci de votre confiance !\n\nLe Foyer`,
      };
    case "litige":
      return {
        objet: `Le Foyer — un point sur votre commande`,
        corps: `Bonjour ${clientNom},\n\nNous avons rencontré un souci avec votre commande "${produitNom}"${
          motif ? ` : ${motif}` : ""
        }. Nous vous recontactons rapidement pour le résoudre.\n\nLe Foyer`,
      };
    case "annulee":
      return {
        objet: `Le Foyer — commande annulée`,
        corps: `Bonjour ${clientNom},\n\nVotre commande "${produitNom}" a été annulée${
          motif ? ` : ${motif}` : ""
        }.\n\nLe Foyer`,
      };
    default:
      return null;
  }
}
