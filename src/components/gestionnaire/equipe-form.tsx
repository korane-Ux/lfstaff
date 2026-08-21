"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { AppRole } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { TextField, SelectField } from "@/components/ui/field";
import {
  telephoneValide,
  emailValide,
  MESSAGE_TELEPHONE_INVALIDE,
  MESSAGE_EMAIL_INVALIDE,
} from "@/lib/validation";

const ROLES: { value: AppRole; label: string }[] = [
  { value: "gestionnaire", label: "Gestionnaire" },
  { value: "fournisseur", label: "Fournisseur" },
  { value: "livreur", label: "Livreur" },
];

export function EquipeForm({ villes }: { villes: string[] }) {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [role, setRole] = useState<AppRole>("livreur");
  const [ville, setVille] = useState(villes[0] ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cree, setCree] = useState<{ email: string; motDePasse: string } | null>(null);

  const telephoneErreur = telephoneValide(telephone) ? undefined : MESSAGE_TELEPHONE_INVALIDE;
  const emailErreur = emailValide(email) ? undefined : MESSAGE_EMAIL_INVALIDE;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (telephoneErreur || emailErreur) return;
    setLoading(true);
    setError(null);

    const res = await fetch("/api/equipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom, email, telephone, role, ville }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Impossible de créer ce compte.");
      return;
    }

    setCree({ email: data.email, motDePasse: data.motDePasse });
  }

  if (cree) {
    return (
      <div className="flex flex-col gap-3 rounded-3xl bg-surface p-5">
        <p className="text-sm font-medium text-encre">Compte créé — transmets ces identifiants :</p>
        <div className="flex flex-col gap-1 rounded-xl bg-creme p-4">
          <p className="text-xs text-encre/65">Email</p>
          <p className="text-base font-medium text-encre">{cree.email}</p>
          <p className="mt-2 text-xs text-encre/65">Mot de passe temporaire</p>
          <p className="font-display text-lg text-braise">{cree.motDePasse}</p>
        </div>
        <p className="text-xs text-encre/65">
          Ce mot de passe ne sera plus affiché — communique-le maintenant.
        </p>
        <Button onClick={() => router.push("/gestionnaire/equipe")}>Terminé</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-3xl bg-surface p-5">
      <TextField label="Nom" required value={nom} onChange={(e) => setNom(e.target.value)} />

      <TextField
        label="Email"
        required
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={emailErreur}
      />

      <TextField
        label="Téléphone"
        type="tel"
        value={telephone}
        onChange={(e) => setTelephone(e.target.value)}
        pattern="[0-9+ ]{6,20}"
        error={telephoneErreur}
      />

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-encre/80">Rôle</p>
        <div className="flex gap-2">
          {ROLES.map((r) => (
            <Button
              key={r.value}
              type="button"
              variant={role === r.value ? "primary" : "ghost"}
              onClick={() => setRole(r.value)}
              className="flex-1"
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>

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

      <Button type="submit" disabled={loading || !!telephoneErreur || !!emailErreur}>
        {loading ? "Création..." : "Créer le compte"}
      </Button>
    </form>
  );
}
