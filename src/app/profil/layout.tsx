import { getCurrentProfile } from "@/lib/supabase/auth";
import { AppShell } from "@/components/layout/app-shell";

// Le profil est commun à tous les rôles : il reprend la navigation du rôle
// connecté, pour qu'on ne se retrouve jamais « hors de l'app » en l'ouvrant.
export default async function ProfilLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  return (
    <AppShell profil={{ nom: profile.nom, role: profile.role, avatarUrl: profile.avatar_url }}>
      {children}
    </AppShell>
  );
}
