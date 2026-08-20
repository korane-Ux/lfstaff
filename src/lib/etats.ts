import type { AppEtat } from "@/lib/supabase/types";

export const ETAT_ORDER: AppEtat[] = [
  "nouvelle",
  "validee",
  "avance_envoyee",
  "en_creation",
  "expediee",
  "recue",
  "en_livraison",
  "livree_validee",
  "litige",
  "annulee",
];

export const ETAT_META: Record<AppEtat, { label: string; color: string }> = {
  nouvelle: { label: "Nouvelle", color: "bg-gris" },
  validee: { label: "Validée", color: "bg-laiton" },
  avance_envoyee: { label: "Avance envoyée", color: "bg-laiton-fonce" },
  en_creation: { label: "En création", color: "bg-creation" },
  expediee: { label: "Expédiée", color: "bg-ocre" },
  recue: { label: "Reçue", color: "bg-ocre-fonce" },
  en_livraison: { label: "En livraison", color: "bg-braise" },
  livree_validee: { label: "Livrée & validée", color: "bg-vert" },
  litige: { label: "Litige", color: "bg-litige" },
  annulee: { label: "Annulée", color: "bg-annule" },
};

// Intl.NumberFormat("fr-FR") separe les milliers avec une espace fine
// insecable (U+202F, parfois U+00A0) : invisible dans les polices PDF de
// base (Helvetica), donc "450 000" s'affiche "450000". On la remplace par
// une espace normale partout, ecran et PDF.
const SEPARATEURS_MILLIERS_INVISIBLES = /[  ]/g;

export function formatFcfa(montant: number | null | undefined) {
  if (montant === null || montant === undefined) return "—";
  const nombre = new Intl.NumberFormat("fr-FR")
    .format(montant)
    .replace(SEPARATEURS_MILLIERS_INVISIBLES, " ");
  return `${nombre} FCFA`;
}
