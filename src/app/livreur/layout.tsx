import Link from "next/link";
import { requireRole } from "@/lib/supabase/auth";
import { RoleHeader } from "@/components/layout/role-header";

export default async function LivreurLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole(["livreur"]);

  return (
    <div className="flex min-h-dvh flex-col bg-creme">
      <RoleHeader nom={profile.nom} role={profile.role} />
      <nav className="flex gap-2 overflow-x-auto border-b border-encre/10 px-4 py-2 text-sm">
        <Link href="/livreur" className="shrink-0 rounded-none px-3 py-1.5 text-encre/80 hover:bg-surface">
          À livrer
        </Link>
        <Link
          href="/livreur/portefeuille"
          className="shrink-0 rounded-none px-3 py-1.5 text-encre/80 hover:bg-surface"
        >
          Portefeuille
        </Link>
      </nav>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
