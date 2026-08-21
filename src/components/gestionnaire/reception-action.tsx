"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { notifierClientCommande } from "@/lib/notify-client";

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

    notifierClientCommande(commandeId);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-surface p-4">
      {error && <p role="alert" className="text-sm text-litige">{error}</p>}
      <Button onClick={handleClick} disabled={loading}>
        {loading ? "Enregistrement..." : "Colis reçu"}
      </Button>
    </div>
  );
}
