import Link from "next/link";
import { requireRole } from "@/lib/supabase/auth";
import { RoleHeader } from "@/components/layout/role-header";

export default async function GestionnaireLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole(["super_admin", "gestionnaire"]);

  return (
    <div className="flex min-h-dvh flex-col bg-creme">
      <RoleHeader nom={profile.nom} role={profile.role} />
      <nav className="flex gap-2 overflow-x-auto border-b border-encre/10 px-4 py-2 text-sm">
        <Link
          href="/gestionnaire"
          className="shrink-0 rounded-full px-3 py-1.5 text-encre/80 hover:bg-surface"
        >
          Tableau de bord
        </Link>
        <Link
          href="/gestionnaire/produits"
          className="shrink-0 rounded-full px-3 py-1.5 text-encre/80 hover:bg-surface"
        >
          Produits
        </Link>
        <Link
          href="/gestionnaire/clients"
          className="shrink-0 rounded-full px-3 py-1.5 text-encre/80 hover:bg-surface"
        >
          Clients
        </Link>
        <Link
          href="/gestionnaire/retraits"
          className="shrink-0 rounded-full px-3 py-1.5 text-encre/80 hover:bg-surface"
        >
          Retraits
        </Link>
        <Link
          href="/gestionnaire/commandes/nouvelle"
          className="shrink-0 rounded-full bg-braise px-3 py-1.5 font-medium text-creme"
        >
          + Nouvelle commande
        </Link>
      </nav>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
