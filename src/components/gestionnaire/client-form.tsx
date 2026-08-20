"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const inputClass =
  "rounded-xl border border-encre/15 bg-creme px-4 py-3 text-base text-encre outline-none focus:border-braise";

export function ClientForm({ villes }: { villes: string[] }) {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [ville, setVille] = useState(villes[0] ?? "");
  const [quartier, setQuartier] = useState("");
  const [adresse, setAdresse] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("clients").insert({
      nom,
      telephone: telephone || null,
      ville: ville || null,
      quartier: quartier || null,
      adresse: adresse || null,
    });

    setLoading(false);

    if (insertError) {
      setError("Impossible d'enregistrer ce client.");
      return;
    }

    router.replace("/gestionnaire/clients");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-3xl bg-surface p-5">
      <label className="flex flex-col gap-1 text-sm text-encre">
        Nom
        <input required value={nom} onChange={(e) => setNom(e.target.value)} className={inputClass} />
      </label>

      <label className="flex flex-col gap-1 text-sm text-encre">
        Téléphone
        <input
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
          type="tel"
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

      <label className="flex flex-col gap-1 text-sm text-encre">
        Quartier
        <input value={quartier} onChange={(e) => setQuartier(e.target.value)} className={inputClass} />
      </label>

      <label className="flex flex-col gap-1 text-sm text-encre">
        Adresse
        <input value={adresse} onChange={(e) => setAdresse(e.target.value)} className={inputClass} />
      </label>

      {error && <p className="text-sm text-litige">{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}
