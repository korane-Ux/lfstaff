import { requireRole } from "@/lib/supabase/auth";
import { AppShell } from "@/components/layout/app-shell";

export default async function GestionnaireLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole(["super_admin", "gestionnaire"]);

  return (
    <AppShell profil={{ nom: profile.nom, role: profile.role, avatarUrl: profile.avatar_url }}>
      {children}
    </AppShell>
  );
}
