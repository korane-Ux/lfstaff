import {
  ChartLineUpIcon,
  ClipboardTextIcon,
  ClockCounterClockwiseIcon,
  CookingPotIcon,
  FireIcon,
  GearSixIcon,
  HandCoinsIcon,
  HouseIcon,
  IdentificationBadgeIcon,
  MoneyIcon,
  MopedIcon,
  PackageIcon,
  PlusCircleIcon,
  UserCircleIcon,
  UsersThreeIcon,
  WalletIcon,
  type Icon,
} from "@phosphor-icons/react";
import type { AppRole } from "@/lib/supabase/types";

export type NavItem = {
  href: string;
  // Libellé complet (menu latéral, menu « Plus ») et libellé court pour la
  // barre du bas, où la place est comptée.
  label: string;
  labelCourt?: string;
  icone: Icon;
  // Actif seulement sur l'URL exacte (pages d'accueil), sinon aussi sur
  // toutes les sous-pages (ex. /commandes/123 garde « Commandes » actif).
  exact?: boolean;
  // Présent dans la barre du bas sur téléphone (5 places maximum).
  barreMobile?: boolean;
  // Action principale, mise en avant au centre de la barre du bas.
  principal?: boolean;
  superAdminSeulement?: boolean;
};

const GESTIONNAIRE: NavItem[] = [
  { href: "/gestionnaire", label: "Accueil", icone: HouseIcon, exact: true, barreMobile: true },
  { href: "/gestionnaire/commandes", label: "Commandes", icone: PackageIcon, barreMobile: true },
  {
    href: "/gestionnaire/nouvelle-commande",
    label: "Nouvelle vente",
    labelCourt: "Vendre",
    icone: PlusCircleIcon,
    barreMobile: true,
    principal: true,
  },
  { href: "/gestionnaire/clients", label: "Clients", icone: UsersThreeIcon, barreMobile: true },
  { href: "/gestionnaire/produits", label: "Produits", icone: CookingPotIcon },
  { href: "/gestionnaire/bilans", label: "Bilans", icone: ChartLineUpIcon },
  { href: "/gestionnaire/retraits", label: "Retraits livreurs", icone: HandCoinsIcon },
  { href: "/gestionnaire/remises", label: "Remises cash", icone: MoneyIcon },
  {
    href: "/gestionnaire/equipe",
    label: "Équipe",
    icone: IdentificationBadgeIcon,
    superAdminSeulement: true,
  },
  { href: "/gestionnaire/reglages", label: "Réglages", icone: GearSixIcon },
];

const LIVREUR: NavItem[] = [
  { href: "/livreur", label: "À livrer", icone: MopedIcon, exact: true, barreMobile: true },
  { href: "/livreur/portefeuille", label: "Portefeuille", icone: WalletIcon, barreMobile: true },
  { href: "/profil", label: "Mon profil", labelCourt: "Profil", icone: UserCircleIcon, barreMobile: true },
];

const FOURNISSEUR: NavItem[] = [
  { href: "/fournisseur", label: "À fondre", icone: FireIcon, exact: true, barreMobile: true },
  {
    href: "/fournisseur/disponibilite",
    label: "Disponibilité",
    labelCourt: "Dispo",
    icone: ClipboardTextIcon,
    barreMobile: true,
  },
  {
    href: "/fournisseur/historique",
    label: "Historique",
    icone: ClockCounterClockwiseIcon,
    barreMobile: true,
  },
  { href: "/fournisseur/portefeuille", label: "Portefeuille", icone: WalletIcon, barreMobile: true },
];

export function navigationPour(role: AppRole): NavItem[] {
  if (role === "livreur") return LIVREUR;
  if (role === "fournisseur") return FOURNISSEUR;
  return GESTIONNAIRE.filter((item) => !item.superAdminSeulement || role === "super_admin");
}

export function estActif(item: NavItem, pathname: string): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super-admin",
  gestionnaire: "Gestionnaire",
  fournisseur: "Fournisseur",
  livreur: "Livreur",
};
