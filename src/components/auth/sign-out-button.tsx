"use client";

import { useRouter } from "next/navigation";
import { SignOutIcon } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton({ avecIcone = false }: { avecIcone?: boolean }) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  if (avecIcone) {
    return (
      <button
        type="button"
        onClick={handleSignOut}
        className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-base text-encre/75 transition-colors hover:bg-creme hover:text-litige"
      >
        <SignOutIcon size={24} weight="duotone" className="icone-duo" />
        Se déconnecter
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="min-h-11 text-sm text-encre/65 underline underline-offset-2"
    >
      Se déconnecter
    </button>
  );
}
