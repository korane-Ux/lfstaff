import Link from "next/link";
import { requireRole } from "@/lib/supabase/auth";
import { RoleHeader } from "@/components/layout/role-header";

export default async function FournisseurLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole(["fournisseur"]);

  return (
    <div className="flex min-h-dvh flex-col bg-creme">
      <RoleHeader nom={profile.nom} role={profile.role} avatarUrl={profile.avatar_url} />
      <nav className="flex gap-2 overflow-x-auto border-b border-encre/10 px-4 py-2 text-sm">
        <Link
          href="/fournisseur"
          className="shrink-0 rounded-none px-3 py-1.5 text-encre/80 hover:bg-surface"
        >
          À fondre
        </Link>
        <Link
          href="/fournisseur/portefeuille"
          className="shrink-0 rounded-none px-3 py-1.5 text-encre/80 hover:bg-surface"
        >
          Portefeuille
        </Link>
        <Link
          href="/fournisseur/historique"
          className="shrink-0 rounded-none px-3 py-1.5 text-encre/80 hover:bg-surface"
        >
          Historique
        </Link>
      </nav>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
