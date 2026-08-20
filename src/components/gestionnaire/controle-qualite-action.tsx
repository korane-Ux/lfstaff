"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Livreur = { id: string; nom: string };

const inputClass =
  "rounded-xl border border-encre/15 bg-creme px-4 py-3 text-base text-encre outline-none focus:border-braise";

export function ControleQualiteAction({
  commandeId,
  livreurs,
}: {
  commandeId: string;
  livreurs: Livreur[];
}) {
  const router = useRouter();
  const [choix, setChoix] = useState<"conforme" | "non_conforme" | null>(null);
  const [livreurId, setLivreurId] = useState(livreurs[0]?.id ?? "");
  const [motif, setMotif] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleConforme(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("commandes")
      .update({ livreur_id: livreurId, etat: "en_livraison" })
      .eq("id", commandeId);

    setLoading(false);

    if (updateError) {
      setError("Impossible d'assigner ce livreur.");
      return;
    }

    router.refresh();
  }

  async function handleNonConforme(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("commandes")
      .update({ etat: "litige", motif_annulation: motif })
      .eq("id", commandeId);

    setLoading(false);

    if (updateError) {
      setError("Impossible d'enregistrer le litige.");
      return;
    }

    router.refresh();
  }

  if (choix === null) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl bg-surface p-4">
        <p className="text-sm font-medium text-encre">Contrôle qualité</p>
        <div className="flex gap-2">
          <button
            onClick={() => setChoix("conforme")}
            className="flex-1 rounded-xl bg-vert px-4 py-3 text-sm font-medium text-creme"
          >
            Conforme
          </button>
          <button
            onClick={() => setChoix("non_conforme")}
            className="flex-1 rounded-xl bg-litige px-4 py-3 text-sm font-medium text-creme"
          >
            Non conforme
          </button>
        </div>
      </div>
    );
  }

  if (choix === "conforme") {
    if (!livreurs.length) {
      return (
        <p className="rounded-2xl bg-surface p-4 text-sm text-encre/60">
          Aucun livreur enregistré — demande au super-admin d&apos;en créer un.
        </p>
      );
    }

    return (
      <form onSubmit={handleConforme} className="flex flex-col gap-3 rounded-2xl bg-surface p-4">
        <p className="text-sm font-medium text-encre">Assigner un livreur</p>

        <label className="flex flex-col gap-1 text-sm text-encre">
          Livreur
          <select value={livreurId} onChange={(e) => setLivreurId(e.target.value)} className={inputClass}>
            {livreurs.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nom}
              </option>
            ))}
          </select>
        </label>

        {error && <p className="text-sm text-litige">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-braise px-4 py-3 text-base font-medium text-creme disabled:opacity-60"
        >
          {loading ? "Envoi..." : "Assigner et passer en livraison"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleNonConforme} className="flex flex-col gap-3 rounded-2xl bg-surface p-4">
      <p className="text-sm font-medium text-encre">Motif du litige</p>

      <textarea
        required
        value={motif}
        onChange={(e) => setMotif(e.target.value)}
        rows={3}
        placeholder="Ce qui ne va pas avec le colis..."
        className={inputClass}
      />

      {error && <p className="text-sm text-litige">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-litige px-4 py-3 text-base font-medium text-creme disabled:opacity-60"
      >
        {loading ? "Envoi..." : "Passer en litige"}
      </button>
    </form>
  );
}
