import { getCurrentProfile } from "@/lib/supabase/auth";
import { AppShell } from "@/components/layout/app-shell";

// L'aide est commune à tous les rôles, comme le profil : elle reprend la
// navigation du rôle connecté.
export default async function AideLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  return (
    <AppShell profil={{ nom: profile.nom, role: profile.role, avatarUrl: profile.avatar_url }}>
      {children}
    </AppShell>
  );
}
