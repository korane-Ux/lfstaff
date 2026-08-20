"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { MoyenPaiement } from "@/lib/supabase/types";

const inputClass =
  "rounded-xl border border-encre/15 bg-creme px-4 py-3 text-base text-encre outline-none focus:border-braise";

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
      <button
        onClick={() => setOuvert(true)}
        className="rounded-full bg-vert px-4 py-2 text-sm font-medium text-creme"
      >
        Recevoir
      </button>
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
        className={inputClass}
      />
      <div className="flex gap-1">
        {(Object.keys(MOYEN_LABELS) as MoyenPaiement[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMoyen(m)}
            className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium ${
              moyen === m ? "bg-braise text-creme" : "bg-surface text-encre/70"
            }`}
          >
            {MOYEN_LABELS[m]}
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-litige">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-vert px-3 py-2 text-sm font-medium text-creme disabled:opacity-60"
      >
        {loading ? "..." : "Confirmer"}
      </button>
    </form>
  );
}
