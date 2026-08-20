"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AppRole } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { ConfirmDangerDialog } from "@/components/ui/confirm-danger-dialog";
import { TextField, SelectField } from "@/components/ui/field";

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
      .update({ nom, telephone: telephone || null, ville: ville || null })
      .eq("id", userId);

    setLoading(false);

    if (updateError) {
      setError("Impossible d'enregistrer ces modifications.");
      return;
    }

    router.push("/gestionnaire/equipe");
    router.refresh();
  }

  async function handleReactiver() {
    const supabase = createClient();
    const { error: updateError } = await supabase.from("users").update({ actif: true }).eq("id", userId);
    if (!updateError) {
      setActif(true);
      router.refresh();
    }
  }

  async function handleDesactiver() {
    const supabase = createClient();
    const { error: updateError } = await supabase.from("users").update({ actif: false }).eq("id", userId);
    if (updateError) throw updateError;
    setActif(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-3xl bg-surface p-5">
      <p className="text-sm text-encre/65">{ROLE_LABELS[role]}</p>

      <TextField label="Nom" required value={nom} onChange={(e) => setNom(e.target.value)} />

      <TextField
        label="Téléphone"
        type="tel"
        value={telephone}
        onChange={(e) => setTelephone(e.target.value)}
      />

      {villes.length > 0 && (
        <SelectField label="Ville" value={ville} onChange={(e) => setVille(e.target.value)}>
          {villes.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </SelectField>
      )}

      {error && <p role="alert" className="text-sm text-litige">{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Enregistrement..." : "Enregistrer"}
      </Button>

      <div className="mt-2 flex flex-col gap-2 rounded-2xl border border-litige/20 p-4">
        <p className="text-sm font-medium text-encre">Zone sensible</p>
        {actif ? (
          <>
            <p className="text-xs text-encre/65">
              Un compte désactivé ne peut plus être choisi pour de nouvelles commandes.
            </p>
            <ConfirmDangerDialog
              title="Désactiver ce compte ?"
              description={`${nom} ne pourra plus se connecter ni être assigné à de nouvelles commandes.`}
              confirmLabel="Désactiver"
              onConfirm={handleDesactiver}
              trigger={(open) => (
                <Button type="button" variant="danger" size="sm" onClick={open} className="self-start">
                  Désactiver ce compte
                </Button>
              )}
            />
          </>
        ) : (
          <>
            <p className="text-xs text-encre/65">Ce compte est désactivé.</p>
            <Button type="button" variant="success" size="sm" onClick={handleReactiver} className="self-start">
              Réactiver ce compte
            </Button>
          </>
        )}
      </div>
    </form>
  );
}
