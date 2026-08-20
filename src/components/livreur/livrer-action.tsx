"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function LivrerAction({ commandeId }: { commandeId: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: ok, error: rpcError } = await supabase.rpc("fn_confirmer_livraison", {
      p_commande_id: commandeId,
      p_code: code,
    });

    setLoading(false);

    if (rpcError || !ok) {
      setError("Code incorrect — redemande-le au client.");
      return;
    }

    router.replace("/livreur");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-2xl bg-surface p-4">
      <p className="text-sm font-medium text-encre">Code donné par le client</p>

      <input
        required
        inputMode="numeric"
        pattern="[0-9]{4}"
        maxLength={4}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        placeholder="0000"
        className="rounded-xl border border-encre/15 bg-creme px-4 py-4 text-center text-2xl tracking-[0.5em] text-encre outline-none focus:border-braise"
      />

      {error && <p className="text-sm text-litige">{error}</p>}

      <Button type="submit" size="lg" disabled={loading || code.length !== 4}>
        {loading ? "Vérification..." : "Livrer"}
      </Button>
    </form>
  );
}
