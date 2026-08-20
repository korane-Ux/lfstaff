"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";

export function MotDePasseForm() {
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);

    if (motDePasse.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (motDePasse !== confirmation) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password: motDePasse });
    setLoading(false);

    if (updateError) {
      setError("Impossible de changer le mot de passe.");
      return;
    }

    setMotDePasse("");
    setConfirmation("");
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-3xl bg-surface p-5">
      <p className="text-sm font-medium text-encre">Changer mon mot de passe</p>

      <TextField
        label="Nouveau mot de passe"
        type="password"
        required
        autoComplete="new-password"
        value={motDePasse}
        onChange={(e) => setMotDePasse(e.target.value)}
      />

      <TextField
        label="Confirmation"
        type="password"
        required
        autoComplete="new-password"
        value={confirmation}
        onChange={(e) => setConfirmation(e.target.value)}
      />

      {error && <p className="text-sm text-litige">{error}</p>}
      {saved && <p className="text-sm text-vert">Mot de passe changé.</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Enregistrement..." : "Changer le mot de passe"}
      </Button>
    </form>
  );
}
