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

    const { error: updateError } = await supabase
      .from("commandes")
      .update({ etat: "recue" })
      .eq("id", commandeId);

    if (updateError) {
      setLoading(false);
      setError("Impossible de marquer cette commande comme reçue.");
      return;
    }

    await supabase
      .from("expeditions")
      .update({ date_arrivee_reelle: new Date().toISOString().slice(0, 10) })
      .eq("commande_id", commandeId);

    setLoading(false);
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
