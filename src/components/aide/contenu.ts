import {
  CheckCircleIcon,
  ClipboardTextIcon,
  CoinsIcon,
  CookingPotIcon,
  FireIcon,
  GearSixIcon,
  HouseIcon,
  IdentificationBadgeIcon,
  MopedIcon,
  PlusCircleIcon,
  RocketLaunchIcon,
  SealCheckIcon,
  TruckIcon,
  WalletIcon,
  type Icon,
} from "@phosphor-icons/react";
import type { AppRole } from "@/lib/supabase/types";

// ─── Format des textes ───────────────────────────────────────────────────
// Dans les étapes et encadrés :
//   [[Libellé]]  → dessiné comme le vrai bouton de l'app (on le reconnaît
//                  à l'écran)
//   **texte**    → en gras (nom d'une rubrique, d'un champ, d'un état)
// Les libellés entre [[ ]] doivent rester identiques à ceux de l'app.

export type Question = {
  id: string;
  question: string;
  resume: string;
  etapes: string[];
  resultat?: string;
  astuce?: string;
  attention?: string;
  lien?: { label: string; href: string };
};

export type Rubrique = {
  id: string;
  titre: string;
  description: string;
  icone: Icon;
  questions: Question[];
};

export type Guide = "gestionnaire" | "admin" | "livreur" | "fournisseur" | "commun";

// ─── Pour tout le monde ──────────────────────────────────────────────────

const COMMUN: Rubrique[] = [
  {
    id: "demarrer",
    titre: "Bien démarrer",
    description: "Connexion, mot de passe, installation et confort de lecture.",
    icone: RocketLaunchIcon,
    questions: [
      {
        id: "connexion",
        question: "Comment me connecter ?",
        resume: "Avec l'e-mail et le mot de passe donnés par l'administrateur.",
        etapes: [
          "Ouvrez **lfstaff.vercel.app**, ou l'icône LFstaff de votre écran d'accueil.",
          "Tapez votre **e-mail** et votre **mot de passe**. Touchez l'œil pour voir ce que vous tapez.",
          "Touchez [[Se connecter]].",
        ],
        astuce: "Majuscules et minuscules comptent : « nMuG » n'est pas « nmug ». L'œil permet de vérifier.",
      },
      {
        id: "mot-de-passe-oublie",
        question: "J'ai oublié mon mot de passe",
        resume: "Demandez-en un nouveau à l'administrateur, ou recevez un lien par e-mail.",
        etapes: [
          "Le plus simple : prévenez l'administrateur. Il vous génère un mot de passe provisoire et vous l'envoie par WhatsApp.",
          "Ou bien, sur la page de connexion, tapez votre e-mail puis touchez **Mot de passe oublié ?**",
          "Ouvrez l'e-mail reçu (regardez aussi dans les indésirables) et touchez le lien.",
          "Choisissez un nouveau mot de passe puis touchez [[Valider le nouveau mot de passe]].",
        ],
      },
      {
        id: "changer-mot-de-passe",
        question: "Changer mon mot de passe",
        resume: "Depuis Mon profil, à tout moment.",
        etapes: [
          "Ouvrez **Mon profil** (touchez votre photo ou votre nom en haut).",
          "Dans la partie mot de passe, tapez le nouveau mot de passe.",
          "Touchez [[Changer le mot de passe]].",
        ],
        astuce: "Après un mot de passe provisoire reçu par WhatsApp, changez-le dès la première connexion.",
        lien: { label: "Ouvrir mon profil", href: "/profil" },
      },
      {
        id: "installer",
        question: "Installer LFstaff sur mon téléphone",
        resume: "L'app s'ouvre alors en plein écran, comme une vraie application.",
        etapes: [
          "Un bandeau **Installer LFstaff sur cet appareil ?** peut apparaître : touchez [[Installer]].",
          "Sinon, sur **Android** (Chrome) : menu **⋮** → **Installer l'application** ou **Ajouter à l'écran d'accueil**.",
          "Sur **iPhone** (Safari) : bouton **Partager** → **Sur l'écran d'accueil**.",
        ],
      },
      {
        id: "confort",
        question: "Agrandir le texte, couper les sons",
        resume: "Réglez l'app à votre goût, pour ce téléphone.",
        etapes: [
          "Ouvrez **Mon profil**, partie **Confort**.",
          "**Taille du texte** : touchez **Normal**, **Grand** ou **Très grand**. Tout l'écran s'agrandit aussitôt.",
          "**Sons de confirmation** : le petit tintement quand une action réussit. Coupez-le si besoin.",
          "**Animations** : désactivez-les si les mouvements vous gênent.",
        ],
        lien: { label: "Régler le confort", href: "/profil" },
      },
      {
        id: "mode-sombre",
        question: "Passer en mode sombre",
        resume: "Plus reposant le soir, et plus économe en batterie.",
        etapes: [
          "Sur téléphone : touchez l'icône **lune** en haut à droite.",
          "Sur ordinateur : **Mode sombre**, en bas du menu de gauche.",
          "Pour revenir au réglage du téléphone : **Mon profil** → **Apparence** → **Système**.",
        ],
      },
      {
        id: "reussite",
        question: "Une fenêtre « Et ensuite ? » s'ouvre après une action",
        resume: "Elle confirme que tout s'est bien passé et propose l'étape suivante.",
        etapes: [
          "La coche verte et le tintement confirment que l'action est enregistrée.",
          "Le gros bouton rouge propose l'étape logique suivante : touchez-le pour y aller directement.",
          "Ou touchez **Rester sur cette page**.",
        ],
      },
    ],
  },
];

// ─── Gestionnaire ────────────────────────────────────────────────────────

const GESTIONNAIRE: Rubrique[] = [
  {
    id: "tableau-de-bord",
    titre: "Le tableau de bord",
    description: "Votre accueil : tout ce qui se passe, et ce qui vous attend.",
    icone: HouseIcon,
    questions: [
      {
        id: "lire-coulee",
        question: "Comment lire « La coulée » ?",
        resume: "Elle montre où en sont toutes vos commandes, de la vente à la livraison.",
        etapes: [
          "Chaque rond est une phase : **Engagement**, **Fonte**, **Transit**, **Livraison**, **Livrées**.",
          "Le chiffre sur le rond = le nombre de commandes dans cette phase.",
          "Sous chaque phase, le détail par état (ex. **Nouvelle · 1**, **Validée · 0**).",
          "Touchez une phase pour ouvrir la liste des commandes concernées.",
        ],
        lien: { label: "Voir mon tableau de bord", href: "/gestionnaire" },
      },
      {
        id: "a-faire",
        question: "Que veut dire « À faire maintenant » ?",
        resume: "La liste de ce qui vous attend, le plus urgent en premier.",
        etapes: [
          "Chaque carte = un type de tâche, avec le nombre à traiter (acomptes, avances, colis, livraisons, retraits…).",
          "Les cartes **rouges qui pulsent** sont urgentes : colis en retard ou litige.",
          "Touchez une carte pour aller directement là où il faut agir.",
        ],
        resultat: "« Tout est à jour » : rien ne vous attend.",
      },
    ],
  },
  {
    id: "vendre",
    titre: "Vendre",
    description: "Créer une commande, ajouter un client, encaisser l'acompte.",
    icone: PlusCircleIcon,
    questions: [
      {
        id: "faire-vente",
        question: "Faire une vente (créer une commande)",
        resume: "En quelques touches, depuis le gros bouton Vendre.",
        etapes: [
          "Touchez [[Vendre]] (le gros bouton au centre en bas), ou **Nouvelle vente** dans le menu.",
          "Choisissez le **Client**. Nouveau client ? Créez-le d'abord (voir « Ajouter un client »).",
          "Trouvez la marmite (champ **Rechercher** ou catégories) et réglez la quantité avec **+** et **−**. Vous pouvez mettre plusieurs produits.",
          "Indiquez la **Ville de livraison**, des **Précisions** si besoin, et une photo de référence.",
          "Vérifiez le total et l'acompte suggéré, puis touchez [[Créer la commande]].",
        ],
        resultat: "La commande est créée à l'état **Nouvelle**. La fenêtre de réussite propose aussitôt d'encaisser l'acompte.",
        lien: { label: "Faire une vente", href: "/gestionnaire/nouvelle-commande" },
      },
      {
        id: "ajouter-client",
        question: "Ajouter un client",
        resume: "Une fois pour toutes : il sera proposé à chaque vente.",
        etapes: [
          "Ouvrez **Clients** puis touchez [[+ Nouveau]].",
          "Remplissez **Nom** et **Téléphone**. Ajoutez **Ville**, **Quartier** et **Adresse** : le livreur en aura besoin.",
          "L'**Email** est facultatif : s'il est rempli, le client reçoit le suivi de sa commande.",
          "Touchez [[Créer le client]].",
        ],
        astuce: "Dans la fenêtre de réussite, touchez **Lui faire une vente** : il sera déjà sélectionné.",
        lien: { label: "Ajouter un client", href: "/gestionnaire/clients/nouveau" },
      },
      {
        id: "encaisser-acompte",
        question: "Encaisser l'acompte (valider une commande)",
        resume: "Première étape après la vente : la commande devient Validée.",
        etapes: [
          "Ouvrez la commande à l'état **Nouvelle** (depuis **Commandes** ou la carte « Acomptes à encaisser »).",
          "Dans **Encaisser l'acompte**, vérifiez le **Montant reçu**. Il est prérempli avec le pourcentage des réglages.",
          "Choisissez le moyen : **Cash**, **Orange Money** ou **MoMo**.",
          "Touchez [[Valider la commande]].",
        ],
        resultat: "La commande passe **Validée** et le client est prévenu.",
        attention:
          "Encaissez toujours l'acompte AVANT d'envoyer l'avance au fournisseur : on n'avance jamais un argent qu'on n'a pas.",
      },
    ],
  },
  {
    id: "fabrication",
    titre: "Fabrication & transit",
    description: "Payer le fournisseur, réceptionner le colis, contrôler la qualité.",
    icone: FireIcon,
    questions: [
      {
        id: "envoyer-avance",
        question: "Envoyer l'avance au fournisseur",
        resume: "C'est l'avance qui lance la fonte.",
        etapes: [
          "Ouvrez une commande **Validée**.",
          "Dans **Envoyer l'avance au fournisseur**, choisissez le **Fournisseur** et vérifiez le **Montant de l'avance**.",
          "Choisissez le moyen de paiement puis touchez [[Envoyer l'avance]].",
        ],
        resultat: "La commande passe **En création** et apparaît chez le fournisseur, dans « À fondre ».",
      },
      {
        id: "grande-commande-fournisseur",
        question: "Envoyer plusieurs commandes d'un coup au même fournisseur",
        resume: "Une seule avance pour toute une série.",
        etapes: [
          "Dès que 2 commandes ou plus sont **Validées**, le bouton **Grande commande → fournisseur** apparaît dans **Commandes**.",
          "Cochez les commandes et choisissez le **Fournisseur**.",
          "Touchez [[Envoyer la grande commande]].",
        ],
      },
      {
        id: "reception",
        question: "Réceptionner un colis expédié",
        resume: "Le fournisseur a expédié : récupérez le colis à l'agence.",
        etapes: [
          "La commande est **Expédiée** : l'agence, le n° de bordereau et la date d'arrivée prévue sont sur sa fiche.",
          "Récupérez le colis à l'agence de transport.",
          "Ouvrez la commande et touchez [[Colis reçu]].",
        ],
        resultat: "La commande passe **Reçue** : place au contrôle qualité.",
        attention:
          "Un colis en retard (date prévue dépassée) apparaît en rouge sur le tableau de bord : appelez l'agence.",
      },
      {
        id: "controle-qualite",
        question: "Contrôler la qualité et confier au livreur",
        resume: "Vérifiez la marmite avant qu'elle parte chez le client.",
        etapes: [
          "Ouvrez la commande **Reçue**. Vérifiez la marmite : mesures, finition, anses, couvercle.",
          "Conforme : dans **Assigner un livreur**, choisissez le **Livreur** puis touchez [[Assigner et passer en livraison]].",
          "Non conforme : décrivez le problème (**Détails**) puis touchez [[Passer en litige]].",
        ],
        resultat: "En livraison, le client reçoit son **code de livraison** à 4 chiffres.",
      },
      {
        id: "grande-commande-livreur",
        question: "Confier plusieurs livraisons au même livreur",
        resume: "Une tournée en une seule fois.",
        etapes: [
          "Dès que 2 commandes ou plus sont **Reçues**, le bouton **Grande commande → livreur** apparaît dans **Commandes**.",
          "Cochez les commandes et choisissez le **Livreur**.",
          "Touchez [[Assigner et passer en livraison]].",
        ],
      },
      {
        id: "litige",
        question: "Régler un litige",
        resume: "La pièce n'est pas conforme : on la refait, ou on annule.",
        etapes: [
          "Ouvrez la commande en **Litige**, bloc **Résoudre le litige**.",
          "Le fournisseur reprend la pièce : touchez [[Renvoyer au fournisseur]]. La commande repart en fonte.",
          "Pas de solution : touchez [[Annuler la commande]].",
        ],
      },
    ],
  },
  {
    id: "argent",
    titre: "Livraison & argent",
    description: "Valider les livraisons, payer les livreurs, récupérer le cash.",
    icone: CoinsIcon,
    questions: [
      {
        id: "valider-livraison",
        question: "Valider une livraison (créditer le livreur)",
        resume: "Votre point de contrôle : rien n'est payé sans vous.",
        etapes: [
          "Quand le livreur a saisi le code du client, la commande affiche **Livraison confirmée par le client**.",
          "Vérifiez, puis touchez [[Valider et créditer la commission]].",
        ],
        resultat: "La commande passe **Livrée & validée** et la commission est créditée au livreur.",
      },
      {
        id: "code-client",
        question: "Le client n'a pas reçu son code de livraison",
        resume: "Le code est visible sur la fiche de la commande.",
        etapes: [
          "Ouvrez la commande **En livraison** : le code à 4 chiffres y est affiché.",
          "Vérifiez le numéro du client, puis communiquez-lui le code par téléphone.",
        ],
        attention:
          "Donnez le code au client, pas au livreur : c'est la preuve que le client a bien reçu sa marmite.",
      },
      {
        id: "retraits",
        question: "Payer un livreur qui demande son argent",
        resume: "Ses demandes arrivent dans Retraits livreurs.",
        etapes: [
          "Ouvrez **Retraits livreurs** (menu, ou carte « Retraits à payer » du tableau de bord).",
          "Payez le livreur (cash, Orange Money ou MoMo).",
          "Touchez [[Marquer payé]].",
        ],
        lien: { label: "Voir les retraits", href: "/gestionnaire/retraits" },
      },
      {
        id: "remises",
        question: "Récupérer le cash détenu par un livreur",
        resume: "Le livreur encaisse les soldes en espèces : c'est l'argent de l'entreprise.",
        etapes: [
          "Ouvrez **Remises cash** : chaque livreur avec le montant à remettre, commissions déjà déduites.",
          "Recevez l'argent, puis touchez [[Recevoir]] à côté du livreur.",
          "Saisissez le montant et le moyen, puis touchez [[Confirmer]].",
        ],
        lien: { label: "Voir les remises", href: "/gestionnaire/remises" },
      },
      {
        id: "bilans",
        question: "Voir les bilans et télécharger un rapport",
        resume: "Encaissé, sorties, marge nette : jour, semaine ou mois.",
        etapes: [
          "Ouvrez **Bilans**.",
          "Choisissez la période : **Aujourd'hui**, **Cette semaine** ou **Ce mois**.",
          "Lisez l'encaissé, les sorties (avances, commissions, transport) et la **Marge nette**.",
          "Touchez **Télécharger le PDF** pour l'imprimer ou l'envoyer.",
        ],
        lien: { label: "Ouvrir les bilans", href: "/gestionnaire/bilans" },
      },
    ],
  },
  {
    id: "catalogue",
    titre: "Catalogue & clients",
    description: "Les marmites que vous vendez et les personnes qui les achètent.",
    icone: CookingPotIcon,
    questions: [
      {
        id: "ajouter-produit",
        question: "Ajouter une marmite au catalogue",
        resume: "Elle apparaîtra aussitôt dans la Nouvelle vente.",
        etapes: [
          "Ouvrez **Produits** puis touchez [[+ Nouveau]].",
          "Remplissez **Nom**, **Catégorie** et le **Fournisseur assigné**.",
          "Renseignez les **Mesures de la marmite** : contenance, diamètre, hauteur, poids, nombre d'anses, couvercle.",
          "Ajoutez des photos.",
          "**Prix** : un prix fixe, ou le **Coût matière** + la **Marge** (le prix se calcule tout seul).",
          "Touchez [[Créer le produit]].",
        ],
        lien: { label: "Ajouter un produit", href: "/gestionnaire/produits/nouveau" },
      },
      {
        id: "alerte-dispo",
        question: "Demander aux fournisseurs s'ils ont une marmite",
        resume: "Avant de promettre un délai au client.",
        etapes: [
          "Ouvrez le produit, partie **Disponibilité chez les fournisseurs**.",
          "Cochez les fournisseurs à interroger et ajoutez un **Message** si besoin.",
          "Touchez [[Envoyer]].",
        ],
        resultat: "Leurs réponses (disponible avec quantité, ou indisponible) s'affichent sur la fiche du produit.",
      },
      {
        id: "modifier-client",
        question: "Modifier ou supprimer un client",
        resume: "Depuis sa fiche, dans Clients.",
        etapes: [
          "Ouvrez **Clients** et touchez le client.",
          "Modifiez ses informations puis touchez [[Enregistrer]].",
          "Supprimer : partie **Zone sensible**. Réservé au super-admin, et seulement si le client n'a aucune commande.",
        ],
      },
    ],
  },
  {
    id: "reglages",
    titre: "Réglages",
    description: "Les pourcentages et commissions proposés par défaut.",
    icone: GearSixIcon,
    questions: [
      {
        id: "pourcentages",
        question: "Changer la commission et les pourcentages",
        resume: "Ce sont des suggestions, ajustables sur chaque commande.",
        etapes: [
          "Ouvrez **Réglages**.",
          "Modifiez la **Commission du livreur**, l'**Avance fournisseur suggérée** et l'**Acompte client suggéré**.",
          "Gérez les **Villes actives**.",
          "Touchez [[Enregistrer]].",
        ],
        lien: { label: "Ouvrir les réglages", href: "/gestionnaire/reglages" },
      },
    ],
  },
];

// ─── Super-admin ─────────────────────────────────────────────────────────

const ADMIN: Rubrique[] = [
  {
    id: "administration",
    titre: "Administration de l'équipe",
    description: "Comptes, mots de passe et accès (super-admin uniquement).",
    icone: IdentificationBadgeIcon,
    questions: [
      {
        id: "creer-membre",
        question: "Créer un compte (gestionnaire, fournisseur, livreur)",
        resume: "Les identifiants s'affichent une seule fois : transmettez-les tout de suite.",
        etapes: [
          "Ouvrez **Équipe** puis touchez [[+ Nouveau]].",
          "Remplissez **Nom**, **Email**, **Téléphone**, le **Rôle** et la **Ville**.",
          "Touchez [[Créer le compte]].",
          "Notez ou transmettez l'e-mail et le **Mot de passe temporaire** affichés, puis touchez [[Terminé]].",
        ],
        lien: { label: "Ouvrir l'équipe", href: "/gestionnaire/equipe" },
      },
      {
        id: "reinitialiser-mdp",
        question: "Un membre a oublié son mot de passe",
        resume: "Générez-lui un mot de passe provisoire en deux touches.",
        etapes: [
          "Ouvrez **Équipe** et touchez le membre.",
          "Dans la partie **Mot de passe**, touchez [[Réinitialiser le mot de passe]].",
          "Confirmez avec [[Oui, réinitialiser]].",
          "Transmettez le nouveau mot de passe : [[Copier]], ou [[Envoyer par WhatsApp]] (le message est déjà rédigé).",
        ],
        attention:
          "Le mot de passe provisoire ne s'affiche qu'une fois, et l'ancien ne fonctionne plus : transmettez-le aussitôt.",
      },
      {
        id: "desactiver",
        question: "Désactiver un membre qui quitte l'équipe",
        resume: "Il ne peut plus se connecter ; son historique est conservé.",
        etapes: [
          "Ouvrez **Équipe** et touchez le membre.",
          "Partie **Zone sensible** : touchez **Désactiver ce compte**.",
          "Tapez la phrase de sécurité demandée, puis touchez [[Désactiver]].",
        ],
        astuce: "Erreur ? Touchez **Réactiver ce compte** sur la même fiche.",
      },
      {
        id: "zones",
        question: "Qui voit quoi ?",
        resume: "Chacun ne voit que ce qui le concerne.",
        etapes: [
          "**Super-admin** : toutes les villes, l'équipe et les réglages.",
          "**Gestionnaire** : les commandes, clients et membres de sa ville.",
          "**Fournisseur** : uniquement les commandes dont il a reçu l'avance.",
          "**Livreur** : uniquement les livraisons qui lui sont confiées.",
        ],
      },
    ],
  },
];

// ─── Livreur ─────────────────────────────────────────────────────────────

const LIVREUR: Rubrique[] = [
  {
    id: "livraisons",
    titre: "Mes livraisons",
    description: "Trouver le client, livrer, valider avec le code.",
    icone: MopedIcon,
    questions: [
      {
        id: "voir-livraisons",
        question: "Où sont mes livraisons ?",
        resume: "Dans l'onglet À livrer, en bas de l'écran.",
        etapes: [
          "Touchez **À livrer** dans la barre du bas.",
          "Chaque carte = un client, avec le montant à encaisser.",
          "Touchez une carte pour voir le détail : téléphone, adresse, photo du colis.",
        ],
        lien: { label: "Voir mes livraisons", href: "/livreur" },
      },
      {
        id: "contacter-client",
        question: "Appeler le client, trouver l'adresse",
        resume: "Tout est sur la fiche de la livraison.",
        etapes: [
          "Ouvrez la livraison.",
          "Touchez le **numéro de téléphone** du client pour l'appeler directement.",
          "L'adresse, le quartier et la ville sont écrits juste en dessous.",
          "La **photo du colis** envoyée par le fournisseur vous aide à vérifier que c'est le bon.",
        ],
      },
      {
        id: "livrer",
        question: "Livrer une commande, étape par étape",
        resume: "Encaisser le solde, demander le code, valider.",
        etapes: [
          "Remettez la marmite au client et **encaissez le solde** indiqué (**À encaisser**).",
          "Demandez au client son **code à 4 chiffres**, reçu par SMS ou WhatsApp.",
          "Tapez-le dans **Code donné par le client**.",
          "Touchez [[Livrer]].",
        ],
        resultat: "« Livraison confirmée ! » : la livraison quitte votre liste. Votre commission est créditée après validation par la gestionnaire.",
        attention: "Ne validez jamais sans le bon code : c'est la preuve que le client a reçu sa marmite.",
      },
      {
        id: "code-incorrect",
        question: "Le code ne marche pas",
        resume: "Faites-le répéter, ou appelez le bureau.",
        etapes: [
          "Faites répéter le code au client, chiffre par chiffre.",
          "Le client ne l'a pas reçu ? Appelez le bureau : la gestionnaire voit le code sur la commande et le lui redonnera.",
        ],
        astuce: "Le bouton **?** de l'écran de livraison rappelle ces conseils.",
      },
    ],
  },
  {
    id: "argent-livreur",
    titre: "Mon argent",
    description: "Commissions, cash en main, paiements.",
    icone: WalletIcon,
    questions: [
      {
        id: "portefeuille",
        question: "Comprendre mon portefeuille",
        resume: "Ce que vous détenez, ce qu'on vous doit, et le calcul final.",
        etapes: [
          "**Cash en main** : l'argent des clients que vous avez encaissé.",
          "**Commissions dues** : ce que Le Foyer vous doit pour vos livraisons validées.",
          "La dernière ligne fait le calcul : **À remettre à la gestionnaire** (vous devez de l'argent) ou **À recevoir de la gestionnaire** (on vous en doit).",
        ],
        astuce: "Une seule remise au lieu de deux : vos commissions sont déjà déduites du cash.",
        lien: { label: "Ouvrir mon portefeuille", href: "/livreur/portefeuille" },
      },
      {
        id: "demander-paiement",
        question: "Demander mon paiement",
        resume: "Quand Le Foyer vous doit de l'argent.",
        etapes: [
          "Ouvrez **Portefeuille**.",
          "Si la dernière ligne indique **À recevoir de la gestionnaire**, touchez [[Demander mon paiement]].",
        ],
        resultat: "La gestionnaire vous paie et l'enregistre. En attendant, la demande s'affiche « en attente de traitement ».",
      },
      {
        id: "remettre-cash",
        question: "Remettre le cash à la gestionnaire",
        resume: "Quand vous détenez de l'argent de l'entreprise.",
        etapes: [
          "Si votre portefeuille indique **À remettre à la gestionnaire**, remettez ce montant en personne.",
          "La gestionnaire l'enregistre : votre portefeuille se remet à jour.",
        ],
      },
      {
        id: "releve",
        question: "Télécharger mon relevé",
        resume: "Le détail de vos livraisons et paiements, en PDF.",
        etapes: ["Ouvrez **Portefeuille** puis touchez **Télécharger mon relevé**."],
      },
    ],
  },
];

// ─── Fournisseur ─────────────────────────────────────────────────────────

const FOURNISSEUR: Rubrique[] = [
  {
    id: "commandes-fournisseur",
    titre: "Mes commandes",
    description: "Ce qu'il faut fondre, et comment déclarer l'expédition.",
    icone: FireIcon,
    questions: [
      {
        id: "a-fondre",
        question: "Quelles marmites dois-je fabriquer ?",
        resume: "Celles de l'onglet À fondre : leur avance vous a été envoyée.",
        etapes: [
          "Touchez **À fondre** dans la barre du bas.",
          "N'y figurent que les commandes **dont l'avance vous a été envoyée**. Pas d'avance, pas de commande ici.",
          "Touchez une commande pour voir le détail : quantité, mesures, anses, couvercle, précisions et photo de référence.",
        ],
        lien: { label: "Voir À fondre", href: "/fournisseur" },
      },
      {
        id: "expedier",
        question: "Déclarer une expédition (c'est prêt)",
        resume: "La marmite est finie : remettez-la à l'agence et prévenez Le Foyer.",
        etapes: [
          "Remettez le colis à l'agence de transport.",
          "Ouvrez la commande depuis **À fondre**.",
          "Dans **Expédition**, remplissez : **Agence de transport**, **N° de bordereau**, **Ville de départ**, **Ville d'arrivée**, **Frais de transport** et **Date d'arrivée prévue**.",
          "Prenez en photo le colis et le bordereau.",
          "Touchez [[Confirmer l'expédition]].",
        ],
        resultat: "La gestionnaire est prévenue et suit l'arrivée du colis.",
        astuce:
          "Indiquez une date d'arrivée prévue réaliste : la gestionnaire est alertée dès qu'un colis est en retard.",
      },
      {
        id: "historique",
        question: "Retrouver mes anciennes commandes",
        resume: "Tout ce que vous avez déjà expédié.",
        etapes: ["Touchez **Historique** dans la barre du bas."],
        lien: { label: "Voir mon historique", href: "/fournisseur/historique" },
      },
    ],
  },
  {
    id: "disponibilite",
    titre: "Disponibilité",
    description: "Répondre quand Le Foyer vous demande si vous avez une marmite.",
    icone: ClipboardTextIcon,
    questions: [
      {
        id: "repondre-dispo",
        question: "Répondre à une demande de disponibilité",
        resume: "Une réponse rapide aide Le Foyer à promettre un délai juste au client.",
        etapes: [
          "Touchez **Dispo** dans la barre du bas : les demandes **En attente de ta réponse** sont en haut.",
          "Vous l'avez : touchez [[Disponible]], indiquez la quantité, puis [[Confirmer]].",
          "Vous ne l'avez pas : touchez [[Indisponible]].",
        ],
        lien: { label: "Voir les demandes", href: "/fournisseur/disponibilite" },
      },
    ],
  },
  {
    id: "argent-fournisseur",
    titre: "Mon argent",
    description: "Les avances reçues de Le Foyer.",
    icone: WalletIcon,
    questions: [
      {
        id: "portefeuille-fournisseur",
        question: "Voir ce que j'ai reçu",
        resume: "Le total des avances versées par Le Foyer.",
        etapes: ["Touchez **Portefeuille** : le **Total reçu de Le Foyer** et le détail des paiements."],
        lien: { label: "Ouvrir mon portefeuille", href: "/fournisseur/portefeuille" },
      },
    ],
  },
];

export const GUIDES: Record<Guide, Rubrique[]> = {
  gestionnaire: GESTIONNAIRE,
  admin: ADMIN,
  livreur: LIVREUR,
  fournisseur: FOURNISSEUR,
  commun: COMMUN,
};

export function guidesPour(role: AppRole): Guide[] {
  if (role === "livreur") return ["livreur", "commun"];
  if (role === "fournisseur") return ["fournisseur", "commun"];
  if (role === "super_admin") return ["gestionnaire", "admin", "commun"];
  return ["gestionnaire", "commun"];
}

// ─── Le parcours d'une commande (schéma en tête de l'aide) ──────────────

export type EtapeParcours = {
  etat: string;
  couleur: string;
  icone: Icon;
  action: string;
  acteur: "gestionnaire" | "fournisseur" | "livreur";
};

// Les 7 vrais états du cycle (libellés et couleurs de lib/etats.ts), avec
// la personne qui fait avancer la commande à ce moment-là.
export const PARCOURS: EtapeParcours[] = [
  { etat: "Nouvelle", couleur: "bg-gris", icone: PlusCircleIcon, action: "Crée la vente", acteur: "gestionnaire" },
  { etat: "Validée", couleur: "bg-laiton", icone: CoinsIcon, action: "Encaisse l'acompte, envoie l'avance", acteur: "gestionnaire" },
  { etat: "En création", couleur: "bg-creation", icone: FireIcon, action: "Fond la marmite", acteur: "fournisseur" },
  { etat: "Expédiée", couleur: "bg-ocre", icone: TruckIcon, action: "Remet le colis à l'agence", acteur: "fournisseur" },
  { etat: "Reçue", couleur: "bg-ocre-fonce", icone: SealCheckIcon, action: "Réceptionne, contrôle, confie au livreur", acteur: "gestionnaire" },
  { etat: "En livraison", couleur: "bg-braise", icone: MopedIcon, action: "Livre et saisit le code du client", acteur: "livreur" },
  { etat: "Livrée & validée", couleur: "bg-vert", icone: CheckCircleIcon, action: "Valide : la commission est créditée", acteur: "gestionnaire" },
];
