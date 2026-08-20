"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AppRole } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";

const inputClass =
  "rounded-xl border border-encre/15 bg-creme px-4 py-3 text-base text-encre outline-none focus:border-braise";

const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super-admin",
  gestionnaire: "Gestionnaire",
  fournisseur: "Fournisseur",
  livreur: "Livreur",
};

export function MembreForm({
  userId,
  nomInitial,
  telephoneInitial,
  villeInitial,
  role,
  actifInitial,
  villes,
}: {
  userId: string;
  nomInitial: string;
  telephoneInitial: string | null;
  villeInitial: string | null;
  role: AppRole;
  actifInitial: boolean;
  villes: string[];
}) {
  const router = useRouter();
  const [nom, setNom] = useState(nomInitial);
  const [telephone, setTelephone] = useState(telephoneInitial ?? "");
  const [ville, setVille] = useState(villeInitial ?? villes[0] ?? "");
  const [actif, setActif] = useState(actifInitial);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("users")
      .update({ nom, telephone: telephone || null, ville: ville || null, actif })
      .eq("id", userId);

    setLoading(false);

    if (updateError) {
      setError("Impossible d'enregistrer ces modifications.");
      return;
    }

    router.push("/gestionnaire/equipe");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-3xl bg-surface p-5">
      <p className="text-sm text-encre/60">{ROLE_LABELS[role]}</p>

      <label className="flex flex-col gap-1 text-sm text-encre">
        Nom
        <input required value={nom} onChange={(e) => setNom(e.target.value)} className={inputClass} />
      </label>

      <label className="flex flex-col gap-1 text-sm text-encre">
        Téléphone
        <input
          type="tel"
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
          className={inputClass}
        />
      </label>

      {villes.length > 0 && (
        <label className="flex flex-col gap-1 text-sm text-encre">
          Ville
          <select value={ville} onChange={(e) => setVille(e.target.value)} className={inputClass}>
            {villes.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="flex flex-col gap-2">
        <p className="text-sm text-encre">Statut</p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={actif ? "success" : "ghost"}
            onClick={() => setActif(true)}
            className="flex-1"
          >
            Actif
          </Button>
          <Button
            type="button"
            variant={!actif ? "danger" : "ghost"}
            onClick={() => setActif(false)}
            className="flex-1"
          >
            Désactivé
          </Button>
        </div>
        {!actif && (
          <p className="text-xs text-encre/50">
            Un compte désactivé ne peut plus être choisi pour de nouvelles commandes.
          </p>
        )}
      </div>

      {error && <p className="text-sm text-litige">{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}
