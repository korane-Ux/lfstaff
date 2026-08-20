import { createClient } from "@/lib/supabase/client";

const TAILLE_MAX = 5 * 1024 * 1024; // 5 Mo — raisonnable pour de la 3G

export async function uploaderPhoto(file: File, dossier: string): Promise<string> {
  if (file.size > TAILLE_MAX) {
    throw new Error("Photo trop lourde (5 Mo maximum).");
  }

  const supabase = createClient();
  const extension = file.name.split(".").pop() ?? "jpg";
  const chemin = `${dossier}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from("photos").upload(chemin, file);
  if (error) throw error;

  const { data } = supabase.storage.from("photos").getPublicUrl(chemin);
  return data.publicUrl;
}

export async function supprimerPhoto(url: string): Promise<void> {
  const chemin = url.split("/photos/")[1];
  if (!chemin) return;

  const supabase = createClient();
  await supabase.storage.from("photos").remove([chemin]);
}
