import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/supabase/types";

export async function getCurrentProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("id, nom, role, ville")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  return profile;
}

export function roleHome(role: AppRole) {
  if (role === "fournisseur") return "/fournisseur";
  if (role === "livreur") return "/livreur";
  return "/gestionnaire";
}

export async function requireRole(allowed: AppRole[]) {
  const profile = await getCurrentProfile();
  if (!allowed.includes(profile.role)) {
    redirect(roleHome(profile.role));
  }
  return profile;
}
