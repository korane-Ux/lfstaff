"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const inputClass =
  "rounded-xl border border-encre/15 bg-creme px-4 py-3 text-base text-encre outline-none focus:border-braise";

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

      <label className="flex flex-col gap-1 text-sm text-encre">
        Nouveau mot de passe
        <input
          type="password"
          required
          autoComplete="new-password"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-encre">
        Confirmation
        <input
          type="password"
          required
          autoComplete="new-password"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          className={inputClass}
        />
      </label>

      {error && <p className="text-sm text-litige">{error}</p>}
      {saved && <p className="text-sm text-vert">Mot de passe changé.</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Enregistrement..." : "Changer le mot de passe"}
      </Button>
    </form>
  );
}
