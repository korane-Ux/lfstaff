"use client";

import { useState, type ChangeEvent } from "react";
import Image from "next/image";
import { uploaderPhoto } from "@/lib/supabase/storage";

export function PhotoInput({
  dossier,
  onUploaded,
}: {
  dossier: string;
  onUploaded: (url: string) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setLoading(true);
    setError(null);

    try {
      const url = await uploaderPhoto(file, dossier);
      onUploaded(url);
    } catch {
      setError("Impossible d'envoyer la photo.");
      setPreview(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center justify-center gap-3 rounded-none bg-creme px-4 py-3 text-sm font-medium text-encre">
        {preview && (
          <Image
            src={preview}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-lg object-cover"
            unoptimized
          />
        )}
        <span>{loading ? "Envoi..." : preview ? "Changer la photo" : "Ajouter une photo"}</span>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleChange}
          className="hidden"
        />
      </label>
      {error && <p className="text-xs text-litige">{error}</p>}
    </div>
  );
}
