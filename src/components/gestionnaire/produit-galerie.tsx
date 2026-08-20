"use client";

import { useState, type ChangeEvent } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { uploaderPhoto, supprimerPhoto } from "@/lib/supabase/storage";

type ImageGalerie = { id: string; url: string; position: number };

export function ProduitGalerie({ produitId, images }: { produitId: string; images: ImageGalerie[] }) {
  const [liste, setListe] = useState(images);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAjout(event: ChangeEvent<HTMLInputElement>) {
    const fichiers = Array.from(event.target.files ?? []);
    if (!fichiers.length) return;

    setLoading(true);
    setError(null);
    event.target.value = "";

    try {
      const supabase = createClient();
      let position = liste.reduce((max, img) => Math.max(max, img.position), -1);
      const ajoutees: ImageGalerie[] = [];

      for (const fichier of fichiers) {
        const url = await uploaderPhoto(fichier, "produits");
        position += 1;
        const { data, error: insertError } = await supabase
          .from("produit_images")
          .insert({ produit_id: produitId, url, position })
          .select("id, url, position")
          .single();
        if (insertError) throw insertError;
        if (data) ajoutees.push(data);
      }

      setListe((prev) => [...prev, ...ajoutees]);
    } catch {
      setError("Impossible d'ajouter ces photos.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSupprimer(image: ImageGalerie) {
    setError(null);
    const supabase = createClient();
    const { error: deleteError } = await supabase.from("produit_images").delete().eq("id", image.id);
    if (deleteError) {
      setError("Impossible de retirer cette photo.");
      return;
    }
    await supprimerPhoto(image.url);
    setListe((prev) => prev.filter((img) => img.id !== image.id));
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-encre">Galerie ({liste.length} photo{liste.length > 1 ? "s" : ""})</p>

      {liste.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {liste.map((image) => (
            <div key={image.id} className="relative aspect-square overflow-hidden rounded-xl bg-creme">
              <Image src={image.url} alt="" fill sizes="120px" className="object-cover" />
              <button
                type="button"
                onClick={() => handleSupprimer(image)}
                aria-label="Retirer cette photo"
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-none bg-encre/70 text-xs font-medium text-creme"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <label className="flex items-center justify-center gap-2 rounded-none bg-creme px-4 py-3 text-sm font-medium text-encre">
        <span>{loading ? "Envoi..." : "Ajouter des photos"}</span>
        <input type="file" accept="image/*" multiple onChange={handleAjout} disabled={loading} className="hidden" />
      </label>
      {error && <p className="text-xs text-litige">{error}</p>}
    </div>
  );
}
