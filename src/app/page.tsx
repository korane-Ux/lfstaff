import { redirect } from "next/navigation";
import { getCurrentProfile, roleHome } from "@/lib/supabase/auth";

export default async function Home() {
  const profile = await getCurrentProfile();
  redirect(roleHome(profile.role));
}
