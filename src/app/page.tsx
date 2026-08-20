import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/auth/sign-out-button";
import type { AppRole } from "@/lib/supabase/types";

const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super-admin",
  gestionnaire: "Gestionnaire",
  fournisseur: "Fournisseur",
  livreur: "Livreur",
};

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("nom, role")
    .eq("id", user.id)
    .single();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-creme px-6 py-16">
      <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-3xl bg-surface p-8 text-center shadow-sm">
        <Image src="/icons/icon-192.png" alt="LFstaff" width={72} height={72} priority />
        <h1 className="font-display text-3xl text-encre">
          Bonjour{profile?.nom ? `, ${profile.nom}` : ""}
        </h1>
        <p className="text-sm text-encre/70">
          {profile?.role ? ROLE_LABELS[profile.role] : "Rôle non configuré"}
        </p>
        <SignOutButton />
      </div>
    </main>
  );
}
