import Link from "next/link";
import type { CSSProperties } from "react";
import {
  ArrowRightIcon,
  ChartLineUpIcon,
  CheckCircleIcon,
  CoinsIcon,
  FireIcon,
  HandCoinsIcon,
  HandshakeIcon,
  HourglassIcon,
  MoneyIcon,
  MopedIcon,
  PackageIcon,
  PaperPlaneTiltIcon,
  SealCheckIcon,
  SparkleIcon,
  TrendUpIcon,
  TruckIcon,
  WarningIcon,
} from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/auth";
import { ETAT_META, formatFcfa } from "@/lib/etats";
import { calculerBilanPeriode } from "@/lib/bilans";
import { idsVisibles } from "@/lib/zone";
import { aujourdhuiIso, dateDuJour, ilYA, salutation } from "@/lib/temps";
import type { AppEtat } from "@/lib/supabase/types";

// ─── La coulée : les 4 phases du cycle (design/lfstaff-systeme.md §2) ────
// Chaque phase a la couleur de son état le plus chaud ; le texte posé
// dessus est fixe (clair ou sombre selon le fond), jamais lié au thème.
type Phase = {
  titre: string;
  sousTitre: string;
  icone: Icon;
  etats: AppEtat[];
  fond: string;
  texte: string;
};

const PHASES: Phase[] = [
  {
    titre: "Engagement",
    sousTitre: "Commande & acompte",
    icone: HandshakeIcon,
    etats: ["nouvelle", "validee"],
    fond: "bg-laiton",
    texte: "text-black/80",
  },
  {
    titre: "Fonte",
    sousTitre: "Chez le fournisseur",
    icone: FireIcon,
    etats: ["avance_envoyee", "en_creation"],
    fond: "bg-creation",
    texte: "text-black/80",
  },
  {
    titre: "Transit",
    sousTitre: "Entre les villes",
    icone: TruckIcon,
    etats: ["expediee", "recue"],
    fond: "bg-ocre",
    texte: "text-black/80",
  },
  {
    titre: "Livraison",
    sousTitre: "Chez le client",
    icone: MopedIcon,
    etats: ["en_livraison"],
    fond: "bg-braise",
    texte: "text-accent-fg",
  },
  {
    titre: "Livrées",
    sousTitre: "Validées & payées",
    icone: SealCheckIcon,
    etats: ["livree_validee"],
    fond: "bg-vert",
    texte: "text-accent-fg",
  },
];

type ActionFile = {
  titre: string;
  explication: string;
  nombre: number;
  href: string;
  icone: Icon;
  urgent?: boolean;
};

function delai(index: number): CSSProperties {
  return { "--delai": `${index * 60}ms` } as CSSProperties;
}

export default async function TableauDeBordPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const livreurIds = await idsVisibles(supabase, "livreur");

  const [
    { data: commandes },
    { data: expeditionsEnRoute },
    { data: retraits },
    { data: remises },
    bilanMois,
    { data: historique },
  ] = await Promise.all([
    supabase.from("commandes").select("id, etat, prix_total, solde_paye, client_id"),
    supabase
      .from("expeditions")
      .select("commande_id, date_arrivee_prevue")
      .is("date_arrivee_reelle", null),
    supabase.from("demandes_retrait").select("id, montant").eq("statut", "en_attente"),
    livreurIds.length
      ? supabase
          .from("v_solde_livreur")
          .select("livreur_id, net_a_remettre")
          .in("livreur_id", livreurIds)
          .gt("net_a_remettre", 0)
      : Promise.resolve({ data: [] }),
    calculerBilanPeriode(supabase, "mois"),
    supabase
      .from("historique_etats")
      .select("id, commande_id, etat, user_id, horodatage")
      .order("horodatage", { ascending: false })
      .limit(6),
  ]);

  // Noms pour le fil d'activité (clients des commandes, auteurs des actions).
  const commandeById = new Map((commandes ?? []).map((c) => [c.id, c]));
  const clientIds = [
    ...new Set(
      (historique ?? [])
        .map((h) => commandeById.get(h.commande_id)?.client_id)
        .filter((id): id is string => !!id),
    ),
  ];
  const auteurIds = [...new Set((historique ?? []).map((h) => h.user_id).filter((id): id is string => !!id))];
  const [{ data: clients }, { data: auteurs }] = await Promise.all([
    clientIds.length
      ? supabase.from("clients").select("id, nom").in("id", clientIds)
      : Promise.resolve({ data: [] }),
    auteurIds.length
      ? supabase.from("users").select("id, nom").in("id", auteurIds)
      : Promise.resolve({ data: [] }),
  ]);
  const nomClient = new Map((clients ?? []).map((c) => [c.id, c.nom]));
  const nomAuteur = new Map((auteurs ?? []).map((u) => [u.id, u.nom]));

  // ── Comptages ──
  const parEtat = new Map<AppEtat, number>();
  for (const c of commandes ?? []) parEtat.set(c.etat, (parEtat.get(c.etat) ?? 0) + 1);
  const compte = (etat: AppEtat) => parEtat.get(etat) ?? 0;

  const enCours = (commandes ?? []).filter((c) => c.etat !== "livree_validee" && c.etat !== "annulee");
  const valeurEnCours = enCours.reduce((total, c) => total + c.prix_total, 0);

  const aujourdhui = aujourdhuiIso();
  const idsExpediees = new Set((commandes ?? []).filter((c) => c.etat === "expediee").map((c) => c.id));
  const retards = (expeditionsEnRoute ?? []).filter(
    (e) => idsExpediees.has(e.commande_id) && e.date_arrivee_prevue && e.date_arrivee_prevue < aujourdhui,
  ).length;

  const livraisonsAValider = (commandes ?? []).filter((c) => c.etat === "en_livraison" && c.solde_paye).length;
  const totalRetraits = (retraits ?? []).reduce((t, r) => t + r.montant, 0);
  const totalRemises = (remises ?? []).reduce((t, r) => t + r.net_a_remettre, 0);

  const filesAction: ActionFile[] = [
    {
      titre: "Litiges à régler",
      explication: "Colis non conformes, à voir avec le fournisseur.",
      nombre: compte("litige"),
      href: "/gestionnaire/commandes#etat-litige",
      icone: WarningIcon,
      urgent: true,
    },
    {
      titre: "Colis à réceptionner",
      explication: retards
        ? `${retards} en retard : appelez l'agence de transport.`
        : "En route depuis le fournisseur.",
      nombre: compte("expediee"),
      href: "/gestionnaire/commandes#etat-expediee",
      icone: PackageIcon,
      urgent: retards > 0,
    },
    {
      titre: "Acomptes à encaisser",
      explication: "Nouvelles commandes : encaissez l'acompte pour les valider.",
      nombre: compte("nouvelle"),
      href: "/gestionnaire/commandes#etat-nouvelle",
      icone: CoinsIcon,
    },
    {
      titre: "Avances à envoyer",
      explication: "Acompte encaissé : lancez la fonte.",
      nombre: compte("validee"),
      href: "/gestionnaire/commandes#etat-validee",
      icone: PaperPlaneTiltIcon,
    },
    {
      titre: "Contrôle qualité",
      explication: "Colis reçus à vérifier, puis à confier à un livreur.",
      nombre: compte("recue"),
      href: "/gestionnaire/commandes#etat-recue",
      icone: SealCheckIcon,
    },
    {
      titre: "Livraisons à valider",
      explication: "Solde encaissé : validez pour créditer le livreur.",
      nombre: livraisonsAValider,
      href: "/gestionnaire/commandes#etat-en_livraison",
      icone: CheckCircleIcon,
    },
    {
      titre: "Retraits à payer",
      explication: `${formatFcfa(totalRetraits)} demandés par les livreurs.`,
      nombre: retraits?.length ?? 0,
      href: "/gestionnaire/retraits",
      icone: HandCoinsIcon,
    },
    {
      titre: "Cash à récupérer",
      explication: `${formatFcfa(totalRemises)} détenus par les livreurs.`,
      nombre: remises?.length ?? 0,
      href: "/gestionnaire/remises",
      icone: MoneyIcon,
    },
  ].filter((f) => f.nombre > 0);

  const resume =
    enCours.length === 0
      ? "Aucune commande en cours pour l'instant."
      : `${enCours.length} commande${enCours.length > 1 ? "s" : ""} en cours${
          filesAction.length ? `, ${filesAction.length} point${filesAction.length > 1 ? "s" : ""} à traiter` : ""
        }.`;

  const kpis = [
    { label: "Encaissé ce mois", valeur: formatFcfa(bilanMois.encaisse), icone: CoinsIcon },
    { label: "Marge nette du mois", valeur: formatFcfa(bilanMois.margeNette), icone: TrendUpIcon },
    { label: "Reste à encaisser", valeur: formatFcfa(bilanMois.enAttente), icone: HourglassIcon },
    { label: "Valeur en cours", valeur: formatFcfa(valeurEnCours), icone: FireIcon },
  ];

  return (
    <main className="flex flex-1 flex-col gap-8 px-4 py-6">
      {/* ── Accueil ── */}
      <section className="apparition flex flex-col gap-2" style={delai(0)}>
        <p className="text-base capitalize text-encre/65">
          {dateDuJour()} · {profile.role === "super_admin" ? "Toutes zones" : profile.ville ?? "Votre zone"}
        </p>
        <h1 className="font-display text-4xl leading-tight text-encre">
          {salutation()}, {profile.nom.split(" ")[0]}
        </h1>
        <p className="text-lg text-encre/80">{resume}</p>
      </section>

      {/* ── La coulée ── */}
      <section aria-labelledby="coulee-titre" className="apparition flex flex-col gap-4" style={delai(1)}>
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 id="coulee-titre" className="font-display text-2xl text-encre">
              La coulée
            </h2>
            <p className="text-base text-encre/65">Où en sont vos commandes, de la commande au client.</p>
          </div>
          <Link
            href="/gestionnaire/commandes"
            className="hidden min-h-11 shrink-0 items-center gap-1.5 text-base font-semibold text-braise hover:underline md:flex"
          >
            Tout voir <ArrowRightIcon size={18} weight="bold" />
          </Link>
        </div>

        <div className="relative rounded-[2rem] bg-surface p-5 md:p-8">
          {/* Le canal de métal en fusion qui relie les phases (décoratif). */}
          <div
            aria-hidden="true"
            className="metal-en-fusion-v absolute bottom-12 left-[2.95rem] top-12 w-1.5 rounded-full opacity-80 md:hidden"
          />
          <div
            aria-hidden="true"
            className="metal-en-fusion absolute left-[10%] right-[10%] top-[3.75rem] hidden h-1.5 rounded-full opacity-80 md:block"
          />

          <ol className="relative flex flex-col gap-6 md:flex-row md:gap-2">
            {PHASES.map((phase, index) => {
              const total = phase.etats.reduce((t, e) => t + compte(e), 0);
              const Icone = phase.icone;
              const cible = phase.etats.find((e) => compte(e) > 0) ?? phase.etats[0];
              return (
                <li key={phase.titre} className="apparition md:flex-1" style={delai(index + 2)}>
                  <Link
                    href={`/gestionnaire/commandes#etat-${cible}`}
                    aria-label={`${phase.titre} : ${total} commande${total > 1 ? "s" : ""}`}
                    className="group flex items-center gap-4 rounded-2xl p-1 md:flex-col md:gap-3 md:text-center"
                  >
                    <span
                      className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full ring-4 ring-surface transition-transform group-hover:scale-110 ${phase.fond} ${phase.texte}`}
                    >
                      <Icone size={28} weight="fill" />
                      <span className="absolute -right-2 -top-2 flex h-8 min-w-8 items-center justify-center rounded-full bg-encre px-2 text-base font-bold text-creme">
                        {total}
                      </span>
                    </span>
                    <span className="flex flex-col gap-1 md:items-center">
                      <span className="font-display text-xl leading-tight text-encre">{phase.titre}</span>
                      <span className="text-sm text-encre/65">{phase.sousTitre}</span>
                      {phase.etats.length > 1 && (
                        <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 md:justify-center">
                          {phase.etats.map((etat) => (
                            <span key={etat} className="flex items-center gap-1.5 text-sm text-encre/80">
                              <span className={`h-2.5 w-2.5 rounded-full ${ETAT_META[etat].color}`} />
                              {ETAT_META[etat].label} · <strong>{compte(etat)}</strong>
                            </span>
                          ))}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>

          {(compte("litige") > 0 || compte("annulee") > 0) && (
            <p className="relative mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-encre/10 pt-4 text-sm text-encre/70">
              <span className="font-semibold">Hors coulée :</span>
              {compte("litige") > 0 && (
                <span className="flex items-center gap-1.5 text-litige">
                  <span className="h-2.5 w-2.5 rounded-full bg-litige" /> Litige · <strong>{compte("litige")}</strong>
                </span>
              )}
              {compte("annulee") > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-annule" /> Annulée · <strong>{compte("annulee")}</strong>
                </span>
              )}
            </p>
          )}
        </div>
      </section>

      {/* ── À faire maintenant ── */}
      <section aria-labelledby="afaire-titre" className="flex flex-col gap-4">
        <h2 id="afaire-titre" className="apparition font-display text-2xl text-encre" style={delai(7)}>
          À faire maintenant
        </h2>

        {filesAction.length === 0 ? (
          <div className="apparition flex items-center gap-4 rounded-[2rem] bg-surface p-6" style={delai(8)}>
            <SparkleIcon size={40} weight="duotone" className="icone-duo shrink-0 text-vert" />
            <div>
              <p className="font-display text-xl text-encre">Tout est à jour</p>
              <p className="text-base text-encre/70">Rien ne vous attend. Profitez-en pour faire une vente !</p>
            </div>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filesAction.map((file, index) => {
              const Icone = file.icone;
              return (
                <li key={file.titre} className="apparition" style={delai(index + 8)}>
                  <Link
                    href={file.href}
                    className={`group flex h-full items-center gap-4 rounded-2xl p-4 transition-transform hover:-translate-y-0.5 ${
                      file.urgent ? "pulse-braise bg-braise/10 ring-2 ring-braise/40" : "bg-surface"
                    }`}
                  >
                    <span
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                        file.urgent ? "bg-braise text-accent-fg" : "bg-creme text-encre"
                      }`}
                    >
                      <Icone size={30} weight="duotone" className={file.urgent ? "" : "icone-duo"} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="flex items-baseline gap-2">
                        <span className="font-display text-3xl leading-none text-encre">{file.nombre}</span>
                        <span className="text-base font-semibold text-encre">{file.titre}</span>
                      </span>
                      <span className="mt-1 text-sm text-encre/70">{file.explication}</span>
                    </span>
                    <ArrowRightIcon
                      size={22}
                      weight="bold"
                      className="shrink-0 text-encre/40 transition-transform group-hover:translate-x-1 group-hover:text-braise"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        {/* ── Ce mois-ci ── */}
        <section aria-labelledby="mois-titre" className="flex flex-col gap-4">
          <div className="flex items-end justify-between">
            <h2 id="mois-titre" className="font-display text-2xl text-encre">
              Ce mois-ci
            </h2>
            <Link
              href="/gestionnaire/bilans?periode=mois"
              className="flex min-h-11 items-center gap-1.5 text-base font-semibold text-braise hover:underline"
            >
              <ChartLineUpIcon size={20} weight="duotone" /> Bilans
            </Link>
          </div>
          <dl className="grid grid-cols-2 gap-3">
            {kpis.map((kpi, index) => {
              const Icone = kpi.icone;
              return (
                <div
                  key={kpi.label}
                  className="apparition flex flex-col gap-2 rounded-2xl bg-surface p-4"
                  style={delai(index + 12)}
                >
                  <Icone size={28} weight="duotone" className="icone-duo text-encre" />
                  <dt className="text-sm text-encre/70">{kpi.label}</dt>
                  <dd className="font-display text-xl leading-tight text-encre md:text-2xl">{kpi.valeur}</dd>
                </div>
              );
            })}
          </dl>
        </section>

        {/* ── Activité récente ── */}
        <section aria-labelledby="activite-titre" className="flex flex-col gap-4">
          <h2 id="activite-titre" className="font-display text-2xl text-encre">
            Activité récente
          </h2>
          {!historique?.length ? (
            <p className="rounded-2xl bg-surface p-5 text-base text-encre/70">Pas encore d&apos;activité.</p>
          ) : (
            <ol className="flex flex-col rounded-2xl bg-surface p-2">
              {historique.map((h) => {
                const commande = commandeById.get(h.commande_id);
                const client = commande ? nomClient.get(commande.client_id) : undefined;
                const auteur = h.user_id ? nomAuteur.get(h.user_id) : undefined;
                return (
                  <li key={h.id}>
                    <Link
                      href={`/gestionnaire/commandes/${h.commande_id}`}
                      className="flex items-center gap-3 rounded-xl p-3 hover:bg-creme"
                    >
                      <span className={`h-3 w-3 shrink-0 rounded-full ${ETAT_META[h.etat].color}`} aria-hidden="true" />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-base text-encre">
                          <strong>{client ?? "Commande"}</strong> → {ETAT_META[h.etat].label}
                        </span>
                        <span className="text-sm text-encre/60">
                          {auteur ? `par ${auteur} · ` : ""}
                          {ilYA(h.horodatage)}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </div>
    </main>
  );
}
