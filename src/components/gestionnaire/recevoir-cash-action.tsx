"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { MoyenPaiement } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { controlClass } from "@/components/ui/field";

const MOYEN_LABELS: Record<MoyenPaiement, string> = {
  cash: "Cash",
  om: "Orange Money",
  momo: "MoMo",
};

export function RecevoirCashAction({
  livreurId,
  montantSuggere,
}: {
  livreurId: string;
  montantSuggere: number;
}) {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [montant, setMontant] = useState(String(montantSuggere));
  const [moyen, setMoyen] = useState<MoyenPaiement>("cash");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!ouvert) {
    return (
      <Button variant="success" size="sm" onClick={() => setOuvert(true)}>
        Recevoir
      </Button>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("transactions").insert({
      type: "remise_cash",
      user_id: livreurId,
      montant: Number(montant) || 0,
      sens: "entree",
      moyen,
    });

    setLoading(false);

    if (insertError) {
      setError("Impossible d'enregistrer la remise.");
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 rounded-xl bg-creme p-3">
      <input
        type="number"
        min={0}
        required
        value={montant}
        onChange={(e) => setMontant(e.target.value)}
        className={controlClass}
      />
      <div className="flex gap-1">
        {(Object.keys(MOYEN_LABELS) as MoyenPaiement[]).map((m) => (
          <Button
            key={m}
            type="button"
            size="sm"
            variant={moyen === m ? "primary" : "secondary"}
            onClick={() => setMoyen(m)}
            className="flex-1"
          >
            {MOYEN_LABELS[m]}
          </Button>
        ))}
      </div>
      {error && <p className="text-xs text-litige">{error}</p>}
      <Button type="submit" variant="success" size="sm" disabled={loading}>
        {loading ? "..." : "Confirmer"}
      </Button>
    </form>
  );
}
