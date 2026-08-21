import Image from "next/image";
import { requireRole } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { RepondreDisponibiliteAction } from "@/components/fournisseur/repondre-disponibilite-action";

export default async function DisponibilitePage() {
  const profile = await requireRole(["fournisseur"]);
  const supabase = await createClient();

  const { data: reponses } = await supabase
    .from("alerte_reponses")
    .select("id, alerte_id, disponible, quantite_disponible")
    .eq("fournisseur_id", profile.id);

  const alerteIds = [...new Set((reponses ?? []).map((r) => r.alerte_id))];
  const { data: alertes } = alerteIds.length
    ? await supabase
        .from("alertes_disponibilite")
        .select("id, produit_id, message, created_at")
        .in("id", alerteIds)
        .order("created_at", { ascending: false })
    : { data: [] };

  const produitIds = [...new Set((alertes ?? []).map((a) => a.produit_id))];
  const { data: produits } = produitIds.length
    ? await supabase.from("produits").select("id, nom, photo_url").in("id", produitIds)
    : { data: [] };
  const produitParId = new Map((produits ?? []).map((p) => [p.id, p]));
  const reponseParAlerte = new Map((reponses ?? []).map((r) => [r.alerte_id, r]));

  const lignes = (alertes ?? [])
    .map((a) => ({ alerte: a, reponse: reponseParAlerte.get(a.id), produit: produitParId.get(a.produit_id) }))
    .filter((l) => l.reponse);

  const enAttente = lignes.filter((l) => l.reponse!.disponible === null);
  const repondues = lignes.filter((l) => l.reponse!.disponible !== null);

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-4">
      <h1 className="font-display text-2xl text-encre">Disponibilité</h1>

      {!lignes.length && (
        <p className="mt-8 text-center text-sm text-encre/65">Aucune demande pour l&apos;instant.</p>
      )}

      {enAttente.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-encre">En attente de ta réponse</p>
          {enAttente.map(({ alerte, reponse, produit }) => (
            <div key={alerte.id} className="flex items-center gap-3 rounded-2xl bg-surface p-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-creme">
                {produit?.photo_url && (
                  <Image src={produit.photo_url} alt="" fill sizes="56px" className="object-cover" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-encre">{produit?.nom ?? "Produit"}</p>
                {alerte.message && <p className="text-xs text-encre/65">{alerte.message}</p>}
              </div>
              <RepondreDisponibiliteAction reponseId={reponse!.id} />
            </div>
          ))}
        </div>
      )}

      {repondues.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-encre">Déjà répondu</p>
          {repondues.map(({ alerte, reponse, produit }) => (
            <div key={alerte.id} className="flex items-center gap-3 rounded-2xl bg-surface p-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-creme">
                {produit?.photo_url && (
                  <Image src={produit.photo_url} alt="" fill sizes="56px" className="object-cover" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-encre">{produit?.nom ?? "Produit"}</p>
              </div>
              <p className={reponse!.disponible ? "text-sm text-vert" : "text-sm text-litige"}>
                {reponse!.disponible
                  ? `Disponible${reponse!.quantite_disponible ? ` (${reponse!.quantite_disponible})` : ""}`
                  : "Indisponible"}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
