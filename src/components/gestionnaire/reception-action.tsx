"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ReceptionAction({ commandeId }: { commandeId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("fn_receptionner_commande", {
      p_commande_id: commandeId,
    });

    setLoading(false);

    if (rpcError) {
      setError("Impossible de marquer cette commande comme reçue.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-surface p-4">
      {error && <p className="text-sm text-litige">{error}</p>}
      <button
        onClick={handleClick}
        disabled={loading}
        className="rounded-xl bg-braise px-4 py-3 text-base font-medium text-creme disabled:opacity-60"
      >
        {loading ? "Enregistrement..." : "Colis reçu"}
      </button>
    </div>
  );
}
