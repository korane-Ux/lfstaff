import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ETAT_META, formatFcfa } from "@/lib/etats";
import { ValiderAction } from "@/components/gestionnaire/valider-action";
import { EnvoyerAvanceAction } from "@/components/gestionnaire/envoyer-avance-action";

export default async function CommandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: commande } = await supabase.from("commandes").select("*").eq("id", id).single();
  if (!commande) notFound();

  const [{ data: client }, { data: produit }, { data: reglages }, { data: fournisseurs }] =
    await Promise.all([
      supabase
        .from("clients")
        .select("nom, telephone, ville")
        .eq("id", commande.client_id)
        .single(),
      supabase.from("produits").select("nom").eq("id", commande.produit_id).single(),
      supabase.from("reglages").select("pct_avance_fournisseur").single(),
      supabase.from("users").select("id, nom").eq("role", "fournisseur").eq("actif", true),
    ]);

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-4">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${ETAT_META[commande.etat].color}`} />
        <h1 className="font-display text-2xl text-encre">{ETAT_META[commande.etat].label}</h1>
      </div>

      <div className="flex flex-col gap-1 rounded-2xl bg-surface p-4">
        <p className="text-sm font-medium text-encre">{client?.nom}</p>
        <p className="text-xs text-encre/60">
          {[client?.telephone, client?.ville].filter(Boolean).join(" · ")}
        </p>
        <p className="mt-2 text-sm text-encre/80">
          {produit?.nom} × {commande.quantite}
        </p>
        <p className="text-sm text-encre/80">Prix total : {formatFcfa(commande.prix_total)}</p>
        <p className="text-sm text-encre/80">
          Acompte : {formatFcfa(commande.acompte_montant)}{" "}
          {commande.acompte_paye ? "(encaissé)" : "(en attente)"}
        </p>
        {commande.avance_payee && (
          <p className="text-sm text-encre/80">
            Avance fournisseur : {formatFcfa(commande.avance_montant)}
          </p>
        )}
      </div>

      {commande.etat === "nouvelle" && (
        <ValiderAction commandeId={commande.id} acompteSuggere={commande.acompte_montant} />
      )}

      {commande.etat === "validee" && (
        <EnvoyerAvanceAction
          commandeId={commande.id}
          prixTotal={commande.prix_total}
          pctAvance={reglages?.pct_avance_fournisseur ?? 50}
          fournisseurs={fournisseurs ?? []}
        />
      )}

      {commande.etat !== "nouvelle" && commande.etat !== "validee" && (
        <p className="rounded-2xl bg-surface p-4 text-center text-sm text-encre/60">
          {commande.etat === "en_creation" && "En attente du fournisseur."}
          {commande.etat === "expediee" && "En transit vers la ville de livraison."}
          {commande.etat !== "en_creation" &&
            commande.etat !== "expediee" &&
            "Aucune action disponible pour cet état pour l'instant."}
        </p>
      )}
    </main>
  );
}
