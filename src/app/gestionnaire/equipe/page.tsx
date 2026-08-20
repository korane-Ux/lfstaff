import Link from "next/link";
import { requireRole } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/supabase/types";

const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super-admin",
  gestionnaire: "Gestionnaire",
  fournisseur: "Fournisseur",
  livreur: "Livreur",
};

export default async function EquipePage() {
  await requireRole(["super_admin"]);
  const supabase = await createClient();

  const { data: users } = await supabase
    .from("users")
    .select("id, nom, telephone, role, ville, actif")
    .order("role");

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-encre">Équipe</h1>
        <Link
          href="/gestionnaire/equipe/nouveau"
          className="rounded-full bg-braise px-4 py-2 text-sm font-medium text-creme"
        >
          + Nouveau
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {users?.map((u) => (
          <div key={u.id} className="flex items-center justify-between rounded-2xl bg-surface p-4">
            <div>
              <p className="text-sm font-medium text-encre">{u.nom}</p>
              <p className="text-xs text-encre/60">
                {[u.telephone, u.ville].filter(Boolean).join(" · ")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-encre/80">{ROLE_LABELS[u.role]}</p>
              {!u.actif && <p className="text-xs text-litige">Inactif</p>}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
