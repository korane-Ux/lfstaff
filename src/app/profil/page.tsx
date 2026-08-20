import Link from "next/link";
import { getCurrentProfile, roleHome } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { ETAT_META } from "@/lib/etats";
import { ProfilForm } from "@/components/profil/profil-form";
import { MotDePasseForm } from "@/components/profil/mot-de-passe-form";
import { ThemeToggle } from "@/components/profil/theme-toggle";
import { SignOutButton } from "@/components/auth/sign-out-button";

const COMMANDE_HREF: Record<string, (id: string) => string> = {
  fournisseur: (id) => `/fournisseur/commandes/${id}`,
  livreur: (id) => `/livreur/commandes/${id}`,
};

export default async function ProfilPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { data: reglages } = await supabase.from("reglages").select("villes_actives").single();

  const { data: historique } = await supabase
    .from("historique_etats")
    .select("id, commande_id, etat, horodatage")
    .eq("user_id", profile.id)
    .order("horodatage", { ascending: false })
    .limit(15);

  const commandeIds = [...new Set((historique ?? []).map((h) => h.commande_id))];
  const { data: commandes } = commandeIds.length
    ? await supabase.from("commandes").select("id, client_id, produit_id").in("id", commandeIds)
    : { data: [] };
  const commandeById = new Map((commandes ?? []).map((c) => [c.id, c]));

  const clientIds = [...new Set((commandes ?? []).map((c) => c.client_id))];
  const produitIds = [...new Set((commandes ?? []).map((c) => c.produit_id))];
  const [{ data: clients }, { data: produits }] = await Promise.all([
    clientIds.length ? supabase.from("clients").select("id, nom").in("id", clientIds) : Promise.resolve({ data: [] }),
    produitIds.length
      ? supabase.from("produits").select("id, nom").in("id", produitIds)
      : Promise.resolve({ data: [] }),
  ]);
  const clientNom = new Map((clients ?? []).map((c) => [c.id, c.nom]));
  const produitNom = new Map((produits ?? []).map((p) => [p.id, p.nom]));

  const hrefPourCommande = COMMANDE_HREF[profile.role] ?? ((id: string) => `/gestionnaire/commandes/${id}`);

  return (
    <div className="flex min-h-dvh flex-col bg-creme">
      <header className="flex items-center justify-between px-4 py-3">
        <Link href={roleHome(profile.role)} className="text-sm text-encre/60 underline underline-offset-2">
          ← Retour
        </Link>
        <SignOutButton />
      </header>

      <main className="flex flex-1 flex-col gap-4 px-4 py-2">
        <h1 className="font-display text-2xl text-encre">Mon profil</h1>

        <ProfilForm
          userId={profile.id}
          nomInitial={profile.nom}
          telephoneInitial={profile.telephone}
          villeInitial={profile.ville}
          avatarUrlInitial={profile.avatar_url}
          villes={reglages?.villes_actives ?? []}
        />

        <MotDePasseForm />

        <ThemeToggle />

        <div className="flex flex-col gap-2 rounded-3xl bg-surface p-5">
          <p className="text-sm font-medium text-encre">Activité récente</p>

          {!historique?.length && <p className="text-xs text-encre/50">Aucune action pour l&apos;instant.</p>}

          <div className="flex flex-col gap-2">
            {historique?.map((entree) => {
              const commande = commandeById.get(entree.commande_id);
              return (
                <Link
                  key={entree.id}
                  href={hrefPourCommande(entree.commande_id)}
                  className="flex items-center justify-between rounded-xl bg-creme p-3"
                >
                  <div>
                    <p className="text-sm text-encre">
                      {commande ? produitNom.get(commande.produit_id) ?? "Produit" : "Commande"}
                      {commande && ` · ${clientNom.get(commande.client_id) ?? "Client"}`}
                    </p>
                    <p className="text-xs text-encre/50">
                      {new Date(entree.horodatage).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs text-encre/70">
                    <span className={`h-2 w-2 rounded-full ${ETAT_META[entree.etat].color}`} />
                    {ETAT_META[entree.etat].label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
