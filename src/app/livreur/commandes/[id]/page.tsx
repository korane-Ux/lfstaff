import Image from "next/image";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { formatFcfa } from "@/lib/etats";
import { LivrerAction } from "@/components/livreur/livrer-action";
import { AideLivreur } from "@/components/livreur/aide-livreur";

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

  const [{ data: client }, { data: expedition }] = await Promise.all([
    supabase.from("clients").select("nom, telephone, adresse, quartier, ville").eq("id", commande.client_id).single(),
    supabase
      .from("expeditions")
      .select("photo_bordereau")
      .eq("commande_id", commande.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

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

        {expedition?.photo_bordereau && (
          <div className="mt-2 flex flex-col gap-1">
            <p className="text-xs text-encre/65">Photo du colis (envoyée par le fournisseur) :</p>
            <a href={expedition.photo_bordereau} target="_blank" rel="noreferrer">
              <Image
                src={expedition.photo_bordereau}
                alt="Colis"
                width={96}
                height={96}
                className="h-24 w-24 rounded-xl object-cover"
              />
            </a>
          </div>
        )}
      </div>

      {commande.etat === "en_livraison" && !commande.solde_paye ? (
        <>
          <LivrerAction commandeId={commande.id} />
          <AideLivreur
            titre="Le code ne marche pas ?"
            texte={
              "Le client a reçu un code à 4 chiffres par SMS ou WhatsApp de la part du Foyer.\n\n" +
              "S'il ne l'a pas reçu, appelle-le pour vérifier son numéro, ou appelle le bureau pour qu'on te le redonne.\n\n" +
              "Ne valide la livraison qu'une fois le code correct tapé."
            }
          />
        </>
      ) : (
        <p className="rounded-2xl bg-surface p-4 text-center text-sm text-encre/65">
          Déjà livrée.
        </p>
      )}
    </main>
  );
}
