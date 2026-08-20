import Image from "next/image";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import type { AppRole } from "@/lib/supabase/types";

const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super-admin",
  gestionnaire: "Gestionnaire",
  fournisseur: "Fournisseur",
  livreur: "Livreur",
};

export function RoleHeader({
  nom,
  role,
  avatarUrl,
}: {
  nom: string;
  role: AppRole;
  avatarUrl?: string | null;
}) {
  return (
    <header className="flex items-center justify-between px-4 py-3">
      <Link href="/profil" className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface text-sm font-medium text-encre/65">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="" width={40} height={40} className="h-full w-full object-cover" />
          ) : (
            nom.charAt(0).toUpperCase()
          )}
        </span>
        <div>
          <p className="font-display text-lg text-encre">{nom}</p>
          <p className="text-xs text-encre/65">{ROLE_LABELS[role]}</p>
        </div>
      </Link>
      <SignOutButton />
    </header>
  );
}
