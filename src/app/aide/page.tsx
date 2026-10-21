import { getCurrentProfile } from "@/lib/supabase/auth";
import { CentreAide } from "@/components/aide/centre-aide";

export const metadata = { title: "Aide & FAQ · LFstaff" };

export default async function AidePage() {
  const profile = await getCurrentProfile();
  return <CentreAide role={profile.role} />;
}
