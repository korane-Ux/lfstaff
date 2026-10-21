import { requireRole } from "@/lib/supabase/auth";
import { AppShell } from "@/components/layout/app-shell";

export default async function LivreurLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole(["livreur"]);

  return (
    <AppShell profil={{ nom: profile.nom, role: profile.role, avatarUrl: profile.avatar_url }}>
      {children}
    </AppShell>
  );
}
