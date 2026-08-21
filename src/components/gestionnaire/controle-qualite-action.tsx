"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { SelectField, TextareaField } from "@/components/ui/field";
import { notifierClientCommande } from "@/lib/notify-client";

type Livreur = { id: string; nom: string };

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

    notifierClientCommande(commandeId);
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

    notifierClientCommande(commandeId);
    router.refresh();
  }

  if (choix === null) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl bg-surface p-4">
        <p className="text-sm font-medium text-encre">Contrôle qualité</p>
        <div className="flex gap-2">
          <Button variant="success" onClick={() => setChoix("conforme")} className="flex-1">
            Conforme
          </Button>
          <Button variant="danger" onClick={() => setChoix("non_conforme")} className="flex-1">
            Non conforme
          </Button>
        </div>
      </div>
    );
  }

  if (choix === "conforme") {
    if (!livreurs.length) {
      return (
        <p className="rounded-2xl bg-surface p-4 text-sm text-encre/65">
          Aucun livreur enregistré — demande au super-admin d&apos;en créer un.
        </p>
      );
    }

    return (
      <form onSubmit={handleConforme} className="flex flex-col gap-3 rounded-2xl bg-surface p-4">
        <p className="text-sm font-medium text-encre">Assigner un livreur</p>

        <SelectField label="Livreur" value={livreurId} onChange={(e) => setLivreurId(e.target.value)}>
          {livreurs.map((l) => (
            <option key={l.id} value={l.id}>
              {l.nom}
            </option>
          ))}
        </SelectField>

        {error && <p role="alert" className="text-sm text-litige">{error}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? "Envoi..." : "Assigner et passer en livraison"}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleNonConforme} className="flex flex-col gap-3 rounded-2xl bg-surface p-4">
      <p className="text-sm font-medium text-encre">Motif du litige</p>

      <TextareaField
        label="Détails"
        required
        value={motif}
        onChange={(e) => setMotif(e.target.value)}
        rows={3}
        placeholder="Ce qui ne va pas avec le colis..."
      />

      {error && <p role="alert" className="text-sm text-litige">{error}</p>}

      <Button type="submit" variant="danger" disabled={loading}>
        {loading ? "Envoi..." : "Passer en litige"}
      </Button>
    </form>
  );
}
