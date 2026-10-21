"use client";

import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  CaretDownIcon,
  CheckCircleIcon,
  LifebuoyIcon,
  LightbulbIcon,
  MagnifyingGlassIcon,
  WarningIcon,
  XIcon,
} from "@phosphor-icons/react";
import type { AppRole } from "@/lib/supabase/types";
import { GUIDES, PARCOURS, guidesPour, type Guide, type Question, type Rubrique } from "@/components/aide/contenu";

// ─── Rendu du texte : [[Bouton]] et **gras** ─────────────────────────────

function Texte({ children }: { children: string }) {
  const morceaux = children.split(/(\[\[.+?\]\]|\*\*.+?\*\*)/g);
  return (
    <>
      {morceaux.map((m, i) => {
        if (m.startsWith("[[")) {
          // Dessiné comme les boutons de l'app (coins carrés, braise) pour
          // qu'on le reconnaisse ensuite à l'écran.
          return (
            <span
              key={i}
              className="mx-0.5 inline-block bg-braise px-2 py-0.5 text-[0.92em] font-semibold whitespace-nowrap text-accent-fg"
            >
              {m.slice(2, -2)}
            </span>
          );
        }
        if (m.startsWith("**")) return <strong key={i} className="font-semibold text-encre">{m.slice(2, -2)}</strong>;
        return <Fragment key={i}>{m}</Fragment>;
      })}
    </>
  );
}

function Encadre({ ton, titre, icone, children }: { ton: string; titre: string; icone: ReactNode; children: string }) {
  return (
    <div className={`flex gap-3 rounded-2xl p-4 ${ton}`}>
      <span className="shrink-0">{icone}</span>
      <p className="text-base text-encre">
        <strong className="mr-1 font-semibold">{titre} :</strong>
        <Texte>{children}</Texte>
      </p>
    </div>
  );
}

// ─── Une question (volet dépliant) ───────────────────────────────────────

function CarteQuestion({ q, ouverte }: { q: Question; ouverte?: boolean }) {
  return (
    <details id={q.id} open={ouverte} className="group scroll-mt-24 rounded-2xl bg-surface open:ring-2 open:ring-braise/30">
      <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 rounded-2xl p-4 hover:bg-creme/60 [&::-webkit-details-marker]:hidden">
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-lg font-semibold leading-snug text-encre">{q.question}</span>
          <span className="text-sm text-encre/65">{q.resume}</span>
        </span>
        <CaretDownIcon
          size={22}
          weight="bold"
          className="shrink-0 text-encre/50 transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>

      <div className="flex flex-col gap-4 px-4 pb-5">
        <ol className="flex flex-col gap-3">
          {q.etapes.map((etape, i) => (
            <li key={i} className="flex gap-3">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-encre font-display text-lg text-creme"
              >
                {i + 1}
              </span>
              <p className="pt-1 text-base leading-relaxed text-encre/85">
                <span className="sr-only">Étape {i + 1} : </span>
                <Texte>{etape}</Texte>
              </p>
            </li>
          ))}
        </ol>

        {q.resultat && (
          <Encadre
            ton="bg-vert/12"
            titre="Résultat"
            icone={<CheckCircleIcon size={26} weight="duotone" className="text-vert" />}
          >
            {q.resultat}
          </Encadre>
        )}
        {q.astuce && (
          <Encadre
            ton="bg-laiton/20"
            titre="Astuce"
            icone={<LightbulbIcon size={26} weight="duotone" className="text-laiton-fonce" />}
          >
            {q.astuce}
          </Encadre>
        )}
        {q.attention && (
          <Encadre
            ton="bg-litige/10"
            titre="Attention"
            icone={<WarningIcon size={26} weight="duotone" className="text-litige" />}
          >
            {q.attention}
          </Encadre>
        )}

        {q.lien && (
          <Link
            href={q.lien.href}
            className="group/lien flex min-h-12 items-center justify-between gap-2 self-start bg-creme px-4 py-2 text-base font-semibold text-braise"
          >
            {q.lien.label}
            <ArrowRightIcon size={20} weight="bold" className="transition-transform group-hover/lien:translate-x-1" />
          </Link>
        )}
      </div>
    </details>
  );
}

// ─── Le parcours d'une commande ──────────────────────────────────────────

const ACTEURS = { gestionnaire: "Gestionnaire", fournisseur: "Fournisseur", livreur: "Livreur" } as const;

function Parcours({ acteur }: { acteur: keyof typeof ACTEURS | null }) {
  return (
    <section aria-labelledby="parcours-titre" className="flex flex-col gap-3">
      <div>
        <h2 id="parcours-titre" className="font-display text-2xl text-encre">
          Le parcours d&apos;une commande
        </h2>
        <p className="text-base text-encre/65">
          Qui fait quoi, de la vente à la livraison{acteur ? " — vos étapes sont surlignées" : ""}.
        </p>
      </div>
      <ol className="flex snap-x gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-7 lg:overflow-visible">
        {PARCOURS.map((p, i) => {
          const moi = acteur === p.acteur;
          const Icone = p.icone;
          return (
            <li
              key={p.etat}
              className={`relative flex w-44 shrink-0 snap-start flex-col gap-2 rounded-2xl p-4 lg:w-auto ${
                moi ? "bg-braise/10 ring-2 ring-braise" : "bg-surface"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-2xl text-encre/30">{i + 1}</span>
                {moi && (
                  <span className="rounded-full bg-braise px-2 py-0.5 text-xs font-bold text-accent-fg">Vous</span>
                )}
              </div>
              <span className={`flex h-11 w-11 items-center justify-center rounded-full ${p.couleur} text-black/75`}>
                <Icone size={24} weight="fill" />
              </span>
              <span className="text-base font-semibold leading-tight text-encre">{p.etat}</span>
              <span className="text-sm leading-snug text-encre/75">{p.action}</span>
              <span className="mt-auto text-xs font-semibold uppercase tracking-wide text-encre/50">
                {ACTEURS[p.acteur]}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

// ─── Centre d'aide ───────────────────────────────────────────────────────

// Recherche tolérante : sans accents ni majuscules (« acompte » trouve
// « Encaisser l'Acompte », « reinitialiser » trouve « réinitialiser »).
function normaliser(texte: string) {
  return texte
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function texteQuestion(q: Question) {
  return normaliser([q.question, q.resume, ...q.etapes, q.resultat, q.astuce, q.attention].filter(Boolean).join(" "));
}

type Onglet = { cle: string; label: string; guides: Guide[]; acteur: keyof typeof ACTEURS | null };

function ongletsPour(role: AppRole): Onglet[] {
  const acteur: keyof typeof ACTEURS =
    role === "livreur" ? "livreur" : role === "fournisseur" ? "fournisseur" : "gestionnaire";
  const moi: Onglet = { cle: "moi", label: "Mon guide", guides: guidesPour(role), acteur };
  // Le super-admin consulte aussi les guides des autres rôles, pour pouvoir
  // accompagner un livreur ou un fournisseur au téléphone.
  if (role !== "super_admin") return [moi];
  return [
    moi,
    { cle: "livreur", label: "Guide livreur", guides: ["livreur"], acteur: "livreur" },
    { cle: "fournisseur", label: "Guide fournisseur", guides: ["fournisseur"], acteur: "fournisseur" },
  ];
}

export function CentreAide({ role }: { role: AppRole }) {
  const onglets = useMemo(() => ongletsPour(role), [role]);
  const [ongletActif, setOngletActif] = useState(onglets[0].cle);
  const [recherche, setRecherche] = useState("");

  const onglet = onglets.find((o) => o.cle === ongletActif) ?? onglets[0];
  const rubriques: Rubrique[] = onglet.guides.flatMap((g) => GUIDES[g]);

  // Lien direct vers une question (ex. /aide#encaisser-acompte) : on ouvre
  // le volet et on le fait défiler à l'écran. <details> gère seul son
  // ouverture, il suffit de poser l'attribut.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    const element = id ? document.getElementById(id) : null;
    if (element instanceof HTMLDetailsElement) element.open = true;
    element?.scrollIntoView({ block: "start" });
  }, []);

  const terme = normaliser(recherche.trim());
  const resultats = terme
    ? rubriques.flatMap((r) => r.questions.filter((q) => texteQuestion(q).includes(terme)).map((q) => ({ r, q })))
    : [];

  return (
    <main className="flex flex-1 flex-col gap-8 px-4 py-6">
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-braise text-accent-fg">
            <LifebuoyIcon size={36} weight="duotone" />
          </span>
          <div>
            <h1 className="font-display text-4xl leading-tight text-encre">Aide & FAQ</h1>
            <p className="text-lg text-encre/70">Tout ce qu&apos;il faut savoir, étape par étape.</p>
          </div>
        </div>

        <label className="relative block">
          <span className="sr-only">Rechercher dans l&apos;aide</span>
          <MagnifyingGlassIcon
            size={24}
            weight="bold"
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-encre/50"
          />
          <input
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Que voulez-vous faire ? Ex. : acompte, code, mot de passe…"
            className="min-h-14 w-full rounded-2xl border-2 border-encre/10 bg-surface py-3 pl-13 pr-12 text-lg text-encre outline-none placeholder:text-encre/45 focus:border-braise"
          />
          {recherche && (
            <button
              type="button"
              onClick={() => setRecherche("")}
              aria-label="Effacer la recherche"
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-encre/60 hover:bg-creme"
            >
              <XIcon size={20} weight="bold" />
            </button>
          )}
        </label>

        {onglets.length > 1 && (
          <div role="tablist" aria-label="Guides" className="flex flex-wrap gap-2">
            {onglets.map((o) => (
              <button
                key={o.cle}
                type="button"
                role="tab"
                aria-selected={o.cle === onglet.cle}
                onClick={() => setOngletActif(o.cle)}
                className={`min-h-11 px-4 text-base font-semibold ${
                  o.cle === onglet.cle ? "bg-encre text-creme" : "bg-surface text-encre/75"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}
      </section>

      {terme ? (
        <section aria-live="polite" className="flex flex-col gap-3">
          <h2 className="font-display text-2xl text-encre">
            {resultats.length
              ? `${resultats.length} réponse${resultats.length > 1 ? "s" : ""} pour « ${recherche.trim()} »`
              : `Aucune réponse pour « ${recherche.trim()} »`}
          </h2>
          {resultats.length === 0 && (
            <p className="rounded-2xl bg-surface p-5 text-base text-encre/75">
              Essayez un autre mot (ex. « livrer », « avance », « client »), ou demandez à l&apos;administrateur.
            </p>
          )}
          {resultats.map(({ r, q }) => (
            <div key={q.id} className="flex flex-col gap-1">
              <span className="px-1 text-sm font-semibold uppercase tracking-wide text-encre/50">{r.titre}</span>
              <CarteQuestion q={q} ouverte />
            </div>
          ))}
        </section>
      ) : (
        <>
          <Parcours acteur={onglet.acteur} />

          {/* Sommaire : accès direct à chaque rubrique */}
          <nav aria-label="Rubriques de l'aide" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {rubriques.map((r) => {
              const Icone = r.icone;
              return (
                <a
                  key={r.id}
                  href={`#rubrique-${r.id}`}
                  className="flex min-h-20 items-center gap-3 rounded-2xl bg-surface p-4 transition-transform hover:-translate-y-0.5"
                >
                  <Icone size={30} weight="duotone" className="icone-duo shrink-0 text-encre" />
                  <span className="flex flex-col">
                    <span className="text-base font-semibold leading-tight text-encre">{r.titre}</span>
                    <span className="text-sm text-encre/60">
                      {r.questions.length} question{r.questions.length > 1 ? "s" : ""}
                    </span>
                  </span>
                </a>
              );
            })}
          </nav>

          {rubriques.map((r) => {
            const Icone = r.icone;
            return (
              <section key={r.id} id={`rubrique-${r.id}`} aria-labelledby={`titre-${r.id}`} className="flex scroll-mt-24 flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-creme ring-1 ring-encre/10">
                    <Icone size={28} weight="duotone" className="icone-duo text-encre" />
                  </span>
                  <div>
                    <h2 id={`titre-${r.id}`} className="font-display text-2xl leading-tight text-encre">
                      {r.titre}
                    </h2>
                    <p className="text-base text-encre/65">{r.description}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {r.questions.map((q) => (
                    <CarteQuestion key={q.id} q={q} />
                  ))}
                </div>
              </section>
            );
          })}
        </>
      )}

      <p className="rounded-2xl bg-surface p-5 text-center text-base text-encre/70">
        Vous ne trouvez pas votre réponse ? Contactez l&apos;administrateur de LFstaff.
      </p>
    </main>
  );
}
