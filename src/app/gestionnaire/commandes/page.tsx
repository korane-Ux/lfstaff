import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/auth";
import { ETAT_ORDER, ETAT_META, formatFcfa } from "@/lib/etats";
import type { AppEtat } from "@/lib/supabase/types";
import { LinkButton } from "@/components/ui/link-button";

export default async function GestionnaireCommandesPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const [{ data: commandes }, { data: clients }, { data: produits }] = await Promise.all([
    supabase
      .from("commandes")
      .select("id, client_id, produit_id, prix_total, etat, cree_le")
      .order("cree_le", { ascending: false }),
    supabase.from("clients").select("id, nom"),
    supabase.from("produits").select("id, nom"),
  ]);

  const clientNom = new Map((clients ?? []).map((c) => [c.id, c.nom]));
  const produitNom = new Map((produits ?? []).map((p) => [p.id, p.nom]));

  const parEtat = new Map<AppEtat, typeof commandes>();
  for (const etat of ETAT_ORDER) parEtat.set(etat, []);
  for (const commande of commandes ?? []) {
    parEtat.get(commande.etat)?.push(commande);
  }

  const enCours = (commandes ?? []).filter((c) => c.etat !== "livree_validee" && c.etat !== "annulee");
  const valeurEnCours = enCours.reduce((total, c) => total + c.prix_total, 0);
  const enLitige = parEtat.get("litige") ?? [];
  const livrees = parEtat.get("livree_validee") ?? [];
  const enAttenteAvance = parEtat.get("validee") ?? [];
  const enAttenteLivreur = parEtat.get("recue") ?? [];

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-4">
      <div>
        <h1 className="font-display text-2xl text-encre">Commandes</h1>
        <p className="text-xs text-encre/65">
          {profile.role === "super_admin" ? "Toutes zones" : profile.ville ?? "Ta zone"}
        </p>
      </div>

      {!!commandes?.length && (
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col gap-1 rounded-2xl bg-surface p-3">
            <p className="text-xs text-encre/65">En cours</p>
            <p className="font-display text-xl text-encre">{enCours.length}</p>
            <p className="text-[11px] text-encre/65">{formatFcfa(valeurEnCours)}</p>
          </div>
          <div className="flex flex-col gap-1 rounded-2xl bg-surface p-3">
            <p className="text-xs text-encre/65">En litige</p>
            <p className="font-display text-xl text-litige">{enLitige.length}</p>
          </div>
          <div className="flex flex-col gap-1 rounded-2xl bg-surface p-3">
            <p className="text-xs text-encre/65">Livrées</p>
            <p className="font-display text-xl text-vert">{livrees.length}</p>
          </div>
        </div>
      )}

      {(enAttenteAvance.length >= 2 || enAttenteLivreur.length >= 2) && (
        <div className="flex flex-wrap gap-2">
          {enAttenteAvance.length >= 2 && (
            <LinkButton href="/gestionnaire/commandes/grouper-fournisseur" variant="secondary" size="sm">
              Grande commande → fournisseur ({enAttenteAvance.length})
            </LinkButton>
          )}
          {enAttenteLivreur.length >= 2 && (
            <LinkButton href="/gestionnaire/commandes/grouper-livreur" variant="secondary" size="sm">
              Grande commande → livreur ({enAttenteLivreur.length})
            </LinkButton>
          )}
        </div>
      )}

      {!commandes?.length && (
        <p className="rounded-2xl bg-surface p-6 text-center text-sm text-encre/65">
          Aucune commande pour l&apos;instant.{" "}
          <Link href="/gestionnaire" className="underline">
            Faire une vente
          </Link>
          .
        </p>
      )}

      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
        {ETAT_ORDER.map((etat) => {
          const items = parEtat.get(etat) ?? [];
          return (
            <div
              key={etat}
              className="flex w-[80vw] max-w-xs shrink-0 snap-start flex-col gap-2 rounded-2xl bg-surface p-3"
            >
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${ETAT_META[etat].color}`} />
                <p className="text-sm font-medium text-encre">{ETAT_META[etat].label}</p>
                <span className="ml-auto text-xs text-encre/65">{items.length}</span>
              </div>

              <div className="flex flex-col gap-2">
                {items.length === 0 && <p className="text-xs text-encre/65">—</p>}
                {items.map((commande) => (
                  <Link
                    key={commande.id}
                    href={`/gestionnaire/commandes/${commande.id}`}
                    className="block rounded-xl bg-creme p-3"
                  >
                    <p className="text-sm font-medium text-encre">
                      {clientNom.get(commande.client_id) ?? "Client"}
                    </p>
                    <p className="text-xs text-encre/65">
                      {produitNom.get(commande.produit_id) ?? "Produit"}
                    </p>
                    <p className="mt-1 text-xs text-encre/80">{formatFcfa(commande.prix_total)}</p>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
