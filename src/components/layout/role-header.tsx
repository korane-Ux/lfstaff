import { SignOutButton } from "@/components/auth/sign-out-button";
import type { AppRole } from "@/lib/supabase/types";

const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super-admin",
  gestionnaire: "Gestionnaire",
  fournisseur: "Fournisseur",
  livreur: "Livreur",
};

export function RoleHeader({ nom, role }: { nom: string; role: AppRole }) {
  return (
    <header className="flex items-center justify-between px-4 py-3">
      <div>
        <p className="font-display text-lg text-encre">{nom}</p>
        <p className="text-xs text-encre/60">{ROLE_LABELS[role]}</p>
      </div>
      <SignOutButton />
    </header>
  );
}
