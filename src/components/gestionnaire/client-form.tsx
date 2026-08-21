"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ConfirmDangerDialog } from "@/components/ui/confirm-danger-dialog";
import { TextField, SelectField, TextareaField } from "@/components/ui/field";
import {
  telephoneValide,
  emailValide,
  MESSAGE_TELEPHONE_INVALIDE,
  MESSAGE_EMAIL_INVALIDE,
} from "@/lib/validation";

type ClientExistant = {
  id: string;
  nom: string;
  telephone: string | null;
  email: string | null;
  ville: string | null;
  quartier: string | null;
  adresse: string | null;
  notes: string | null;
};

export function ClientForm({
  villes,
  client,
  isSuperAdmin = false,
}: {
  villes: string[];
  client?: ClientExistant;
  isSuperAdmin?: boolean;
}) {
  const router = useRouter();
  const [nom, setNom] = useState(client?.nom ?? "");
  const [telephone, setTelephone] = useState(client?.telephone ?? "");
  const [email, setEmail] = useState(client?.email ?? "");
  const [ville, setVille] = useState(client?.ville ?? villes[0] ?? "");
  const [quartier, setQuartier] = useState(client?.quartier ?? "");
  const [adresse, setAdresse] = useState(client?.adresse ?? "");
  const [notes, setNotes] = useState(client?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const telephoneErreur = telephoneValide(telephone) ? undefined : MESSAGE_TELEPHONE_INVALIDE;
  const emailErreur = emailValide(email) ? undefined : MESSAGE_EMAIL_INVALIDE;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (telephoneErreur || emailErreur) return;
    setLoading(true);
    setError(null);

    const payload = {
      nom,
      telephone: telephone || null,
      email: email || null,
      ville: ville || null,
      quartier: quartier || null,
      adresse: adresse || null,
      notes: notes || null,
    };

    const supabase = createClient();
    const { error: saveError } = client
      ? await supabase.from("clients").update(payload).eq("id", client.id)
      : await supabase.from("clients").insert(payload);

    setLoading(false);

    if (saveError) {
      setError("Impossible d'enregistrer ce client.");
      return;
    }

    router.replace("/gestionnaire/clients");
    router.refresh();
  }

  async function handleSupprimer() {
    if (!client) return;
    const supabase = createClient();
    const { error: deleteError } = await supabase.from("clients").delete().eq("id", client.id);
    if (deleteError) {
      throw new Error(
        deleteError.code === "23503"
          ? "Ce client a des commandes existantes, impossible de le supprimer."
          : deleteError.message,
      );
    }
    router.replace("/gestionnaire/clients");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-3xl bg-surface p-5">
      <TextField label="Nom" required value={nom} onChange={(e) => setNom(e.target.value)} />

      <TextField
        label="Téléphone"
        value={telephone}
        onChange={(e) => setTelephone(e.target.value)}
        type="tel"
        pattern="[0-9+ ]{6,20}"
        error={telephoneErreur}
      />

      <TextField
        label="Email"
        hint="pour le suivi de commande"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={emailErreur}
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

      <TextField label="Quartier" value={quartier} onChange={(e) => setQuartier(e.target.value)} />

      <TextField label="Adresse" value={adresse} onChange={(e) => setAdresse(e.target.value)} />

      <TextareaField
        label="Notes (optionnel)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
      />

      {error && <p role="alert" className="text-sm text-litige">{error}</p>}

      <Button type="submit" disabled={loading || !!telephoneErreur || !!emailErreur}>
        {loading ? "Enregistrement..." : client ? "Enregistrer" : "Créer le client"}
      </Button>

      {client && (
        <div className="mt-2 flex flex-col gap-2 rounded-2xl border border-litige/20 p-4">
          <p className="text-sm font-medium text-encre">Zone sensible</p>
          {isSuperAdmin ? (
            <>
              <p className="text-xs text-encre/65">La suppression de ce client est définitive.</p>
              <ConfirmDangerDialog
                title="Supprimer ce client ?"
                description={`"${client.nom}" sera supprimé définitivement.`}
                confirmLabel="Supprimer"
                onConfirm={handleSupprimer}
                trigger={(open) => (
                  <Button type="button" variant="danger" size="sm" onClick={open} className="self-start">
                    Supprimer ce client
                  </Button>
                )}
              />
            </>
          ) : (
            <p className="text-xs text-encre/65">Seul un super-admin peut supprimer ce client.</p>
          )}
        </div>
      )}
    </form>
  );
}
