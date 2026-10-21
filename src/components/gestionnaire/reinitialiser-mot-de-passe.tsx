"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon, KeyIcon, WhatsappLogoIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { lienWhatsapp } from "@/lib/contact";
import { jouerSon } from "@/lib/son";

type Resultat = { email: string; motDePasse: string };

// Réservé au super-admin (la route serveur le vérifie de son côté) : quand
// un membre a oublié son mot de passe, on lui en génère un provisoire et on
// le lui transmet (copier-coller ou WhatsApp).
export function ReinitialiserMotDePasse({
  userId,
  nom,
  telephone,
}: {
  userId: string;
  nom: string;
  telephone: string | null;
}) {
  const [etape, setEtape] = useState<"repos" | "confirmation" | "envoi">("repos");
  const [resultat, setResultat] = useState<Resultat | null>(null);
  const [copie, setCopie] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reinitialiser() {
    setEtape("envoi");
    setError(null);

    const reponse = await fetch(`/api/equipe/${userId}/mot-de-passe`, { method: "POST" });
    const corps = (await reponse.json().catch(() => ({}))) as Partial<Resultat> & { error?: string };

    if (!reponse.ok || !corps.motDePasse) {
      setEtape("repos");
      setError(corps.error ?? "Impossible de réinitialiser ce mot de passe.");
      jouerSon("erreur");
      return;
    }

    setResultat({ email: corps.email ?? "", motDePasse: corps.motDePasse });
    setEtape("repos");
    setCopie(false);
    jouerSon("succes");
  }

  async function copier() {
    if (!resultat) return;
    try {
      await navigator.clipboard.writeText(resultat.motDePasse);
      setCopie(true);
    } catch {
      // Presse-papiers refusé (navigateur, http) : le mot de passe reste
      // affiché en grand, on peut le recopier à la main.
    }
  }

  const message = resultat
    ? `Bonjour ${nom}, voici vos nouveaux accès LFstaff :\n` +
      `• E-mail : ${resultat.email}\n` +
      `• Mot de passe provisoire : ${resultat.motDePasse}\n` +
      `Pensez à le changer dans « Mon profil » après connexion.`
    : "";

  return (
    <section aria-labelledby="mdp-titre" className="flex flex-col gap-4 rounded-3xl bg-surface p-5">
      <div className="flex items-center gap-3">
        <KeyIcon size={30} weight="duotone" className="icone-duo shrink-0 text-encre" />
        <div>
          <h2 id="mdp-titre" className="font-display text-xl text-encre">
            Mot de passe
          </h2>
          <p className="text-sm text-encre/70">
            {nom} a oublié son mot de passe ? Générez-en un nouveau, provisoire.
          </p>
        </div>
      </div>

      {resultat ? (
        <div className="flex flex-col gap-3" role="status">
          <p className="text-sm text-encre/70">
            Nouveau mot de passe pour <strong className="text-encre">{resultat.email}</strong> :
          </p>
          <p className="select-all rounded-2xl bg-creme px-4 py-4 text-center font-mono text-3xl tracking-wider text-encre">
            {resultat.motDePasse}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button type="button" variant="secondary" onClick={copier} className="flex items-center justify-center gap-2">
              {copie ? <CheckIcon size={22} weight="bold" /> : <CopyIcon size={22} weight="duotone" />}
              {copie ? "Copié" : "Copier"}
            </Button>
            {telephone && (
              <a
                href={lienWhatsapp(telephone, message)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-12 items-center justify-center gap-2 bg-vert px-4 py-3 font-medium text-accent-fg"
              >
                <WhatsappLogoIcon size={22} weight="fill" />
                Envoyer par WhatsApp
              </a>
            )}
          </div>
          <p className="text-sm text-encre/70">
            Il ne sera plus affiché après avoir quitté cette page : transmettez-le maintenant. L&apos;ancien
            mot de passe ne fonctionne plus.
          </p>
        </div>
      ) : etape === "confirmation" ? (
        <div className="flex flex-col gap-3">
          <p className="text-base text-encre">
            L&apos;ancien mot de passe de {nom} cessera de fonctionner immédiatement. Continuer ?
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant="ghost" onClick={() => setEtape("repos")}>
              Annuler
            </Button>
            <Button type="button" onClick={reinitialiser}>
              Oui, réinitialiser
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          onClick={() => setEtape("confirmation")}
          disabled={etape === "envoi"}
          className="flex items-center justify-center gap-2"
        >
          <KeyIcon size={22} weight="duotone" />
          {etape === "envoi" ? "Réinitialisation…" : "Réinitialiser le mot de passe"}
        </Button>
      )}

      {error && (
        <p role="alert" className="text-sm text-litige">
          {error}
        </p>
      )}
    </section>
  );
}
