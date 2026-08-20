"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatFcfa } from "@/lib/etats";

export function DemanderRetraitAction({ montant }: { montant: number }) {
  const router = useRouter();
  const [envoyee, setEnvoyee] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("demandes_retrait").insert({ montant });

    setLoading(false);

    if (insertError) {
      setError("Impossible d'envoyer la demande.");
      return;
    }

    setEnvoyee(true);
    router.refresh();
  }

  if (envoyee) {
    return (
      <p className="rounded-2xl bg-vert/10 p-4 text-center text-sm font-medium text-vert">
        Demande envoyée — la gestionnaire va la traiter.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-sm text-litige">{error}</p>}
      <button
        onClick={handleClick}
        disabled={loading}
        className="rounded-xl bg-braise px-4 py-4 text-lg font-medium text-creme disabled:opacity-60"
      >
        {loading ? "Envoi..." : `Demander mon paiement (${formatFcfa(montant)})`}
      </button>
    </div>
  );
}
