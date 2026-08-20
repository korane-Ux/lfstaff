"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { PhotoInput } from "@/components/ui/photo-input";
import { TextField, SelectField } from "@/components/ui/field";

export function ProfilForm({
  userId,
  nomInitial,
  telephoneInitial,
  villeInitial,
  avatarUrlInitial,
  villes,
}: {
  userId: string;
  nomInitial: string;
  telephoneInitial: string | null;
  villeInitial: string | null;
  avatarUrlInitial: string | null;
  villes: string[];
}) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState(avatarUrlInitial);
  const [nom, setNom] = useState(nomInitial);
  const [telephone, setTelephone] = useState(telephoneInitial ?? "");
  const [ville, setVille] = useState(villeInitial ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("users")
      .update({ nom, telephone: telephone || null, ville: ville || null, avatar_url: avatarUrl })
      .eq("id", userId);

    setLoading(false);

    if (updateError) {
      setError("Impossible d'enregistrer ces modifications.");
      return;
    }

    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-3xl bg-surface p-5">
      <p className="text-sm font-medium text-encre">Mes informations</p>

      <PhotoInput dossier="avatars" onUploaded={setAvatarUrl} />

      <TextField label="Nom" required value={nom} onChange={(e) => setNom(e.target.value)} />

      <TextField
        label="Téléphone"
        type="tel"
        value={telephone}
        onChange={(e) => setTelephone(e.target.value)}
      />

      {villes.length > 0 && (
        <SelectField label="Ville" value={ville} onChange={(e) => setVille(e.target.value)}>
          <option value="">—</option>
          {villes.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </SelectField>
      )}

      {error && <p className="text-sm text-litige">{error}</p>}
      {saved && <p className="text-sm text-vert">Modifications enregistrées.</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}
