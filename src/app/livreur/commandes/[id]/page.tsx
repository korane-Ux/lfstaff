import { notFound } from "next/navigation";
import { requireRole } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { formatFcfa } from "@/lib/etats";
import { LivrerAction } from "@/components/livreur/livrer-action";

export default async function LivreurCommandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireRole(["livreur"]);
  const supabase = await createClient();

  const { data: commande } = await supabase
    .from("commandes")
    .select("id, client_id, livreur_id, etat, solde_montant, solde_paye")
    .eq("id", id)
    .single();

  if (!commande || commande.livreur_id !== profile.id) notFound();

  const { data: client } = await supabase
    .from("clients")
    .select("nom, telephone, adresse, quartier, ville")
    .eq("id", commande.client_id)
    .single();

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-4">
      <h1 className="font-display text-2xl text-encre">{client?.nom}</h1>

      <div className="flex flex-col gap-1 rounded-2xl bg-surface p-4">
        {client?.telephone && (
          <a href={`tel:${client.telephone}`} className="text-sm text-braise underline">
            {client.telephone}
          </a>
        )}
        <p className="text-sm text-encre/80">
          {[client?.adresse, client?.quartier, client?.ville].filter(Boolean).join(" · ")}
        </p>
        <p className="mt-2 text-sm font-medium text-encre">
          À encaisser : {formatFcfa(commande.solde_montant)}
        </p>
      </div>

      {commande.etat === "en_livraison" && !commande.solde_paye ? (
        <LivrerAction commandeId={commande.id} />
      ) : (
        <p className="rounded-2xl bg-surface p-4 text-center text-sm text-encre/65">
          Déjà livrée.
        </p>
      )}
    </main>
  );
}
