"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useFeedback } from "@/components/feedback/feedback-provider";

export function MarquerPayeAction({ demandeId }: { demandeId: string }) {
  const router = useRouter();
  const feedback = useFeedback();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("fn_marquer_retrait_paye", {
      p_demande_id: demandeId,
    });

    setLoading(false);

    if (rpcError) {
      setError("Impossible d'enregistrer le paiement.");
      return;
    }

    feedback.succes({
      titre: "Retrait payé",
      message: "Le paiement est enregistré dans le portefeuille du livreur.",
    });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-1">
      {error && <p role="alert" className="text-xs text-litige">{error}</p>}
      <Button variant="success" size="sm" onClick={handleClick} disabled={loading}>
        {loading ? "..." : "Marquer payé"}
      </Button>
    </div>
  );
}
