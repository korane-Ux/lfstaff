import { getCurrentProfile } from "@/lib/supabase/auth";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

export default async function BienvenuePage() {
  const profile = await getCurrentProfile();
  return <OnboardingFlow role={profile.role} />;
}
