import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ETAT_META, formatFcfa } from "@/lib/etats";
import { ValiderAction } from "@/components/gestionnaire/valider-action";
import { EnvoyerAvanceAction } from "@/components/gestionnaire/envoyer-avance-action";
import { ReceptionAction } from "@/components/gestionnaire/reception-action";
import { ControleQualiteAction } from "@/components/gestionnaire/controle-qualite-action";
import { ValiderLivraisonAction } from "@/components/gestionnaire/valider-livraison-action";
import { LitigeAction } from "@/components/gestionnaire/litige-action";
import { AnnulerAction } from "@/components/gestionnaire/annuler-action";

export default async function CommandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: commande } = await supabase.from("commandes").select("*").eq("id", id).single();
  if (!commande) notFound();

  const [
    { data: client },
    { data: produit },
    { data: reglages },
    { data: fournisseurs },
    { data: livreurs },
    { data: expedition },
  ] = await Promise.all([
    supabase.from("clients").select("nom, telephone, ville").eq("id", commande.client_id).single(),
    supabase.from("produits").select("nom").eq("id", commande.produit_id).single(),
    supabase.from("reglages").select("pct_avance_fournisseur, taux_commission_livreur").single(),
    supabase.from("users").select("id, nom").eq("role", "fournisseur").eq("actif", true),
    supabase.from("users").select("id, nom").eq("role", "livreur").eq("actif", true),
    supabase
      .from("expeditions")
      .select("photo_bordereau")
      .eq("commande_id", commande.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const commissionSuggeree = Math.round(
    (commande.prix_total * (reglages?.taux_commission_livreur ?? 10)) / 100,
  );

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
        {commande.etat === "en_livraison" && commande.code_livraison && (
          <p className="mt-2 text-sm font-medium text-encre">
            Code à communiquer au client : <span className="text-braise">{commande.code_livraison}</span>
          </p>
        )}
        {(commande.etat === "litige" || commande.etat === "annulee") && commande.motif_annulation && (
          <p className="mt-2 text-sm text-litige">Motif : {commande.motif_annulation}</p>
        )}

        {(commande.photo_ref || expedition?.photo_bordereau) && (
          <div className="mt-2 flex gap-2">
            {commande.photo_ref && (
              <a href={commande.photo_ref} target="_blank" rel="noreferrer">
                <Image
                  src={commande.photo_ref}
                  alt="Référence"
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-xl object-cover"
                />
              </a>
            )}
            {expedition?.photo_bordereau && (
              <a href={expedition.photo_bordereau} target="_blank" rel="noreferrer">
                <Image
                  src={expedition.photo_bordereau}
                  alt="Bordereau"
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-xl object-cover"
                />
              </a>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href={`/gestionnaire/commandes/${commande.id}/bon-de-commande`}
          className="rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-encre/80"
        >
          Bon de commande
        </a>
        {commande.acompte_paye && (
          <a
            href={`/gestionnaire/commandes/${commande.id}/recu?type=acompte`}
            className="rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-encre/80"
          >
            Reçu acompte
          </a>
        )}
        {commande.solde_paye && (
          <a
            href={`/gestionnaire/commandes/${commande.id}/recu?type=solde`}
            className="rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-encre/80"
          >
            Reçu solde
          </a>
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

      {commande.etat === "en_creation" && (
        <p className="rounded-2xl bg-surface p-4 text-center text-sm text-encre/60">
          En attente du fournisseur.
        </p>
      )}

      {commande.etat === "expediee" && <ReceptionAction commandeId={commande.id} />}

      {commande.etat === "recue" && (
        <ControleQualiteAction commandeId={commande.id} livreurs={livreurs ?? []} />
      )}

      {commande.etat === "en_livraison" && !commande.solde_paye && (
        <p className="rounded-2xl bg-surface p-4 text-center text-sm text-encre/60">
          En attente que le livreur confirme la remise.
        </p>
      )}

      {commande.etat === "en_livraison" && commande.solde_paye && commande.livreur_id && (
        <ValiderLivraisonAction
          commandeId={commande.id}
          livreurId={commande.livreur_id}
          soldeMontant={commande.solde_montant}
          commissionMontant={commissionSuggeree}
        />
      )}

      {commande.etat === "litige" && <LitigeAction commandeId={commande.id} />}

      {(commande.etat === "livree_validee" || commande.etat === "annulee") && (
        <p className="rounded-2xl bg-surface p-4 text-center text-sm text-encre/60">
          Aucune action disponible pour cet état.
        </p>
      )}

      {commande.etat !== "livree_validee" && commande.etat !== "annulee" && commande.etat !== "litige" && (
        <AnnulerAction commandeId={commande.id} />
      )}
    </main>
  );
}
