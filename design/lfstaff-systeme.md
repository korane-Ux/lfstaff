# LFstaff — Le système financier & logistique

*Conception du cœur de l'application : qui paie qui, quand, et comment la marmite voyage de Douala à Yaoundé (ou l'inverse).*

---

## 1 · Les trois flux d'argent

C'est le point clé : **l'argent circule dans deux sens**, pas un seul. LFstaff doit tenir les trois.

| Flux | Sens | Déclencheur |
|---|---|---|
| **Client → Entreprise** | entrant | Acompte 60–70 % à la commande, puis solde à la livraison |
| **Entreprise → Fournisseur** | sortant | Avance versée pour lancer la fonte (matière + travail) |
| **Entreprise → Livreur** | sortant | Commission par livraison validée, cumulée puis retirée |

### La règle d'or de trésorerie
> **L'acompte client entre AVANT que l'avance fournisseur ne sorte.**
> L'app doit interdire (ou au minimum alerter) l'envoi d'une avance sur une commande dont l'acompte n'est pas encaissé. C'est la règle qui protège l'entreprise : on n'avance jamais un argent qu'on n'a pas.

---

## 2 · Le cycle de commande — 8 états, 4 phases

Les 6 états précédents ne suffisent plus : il manquait **le paiement du fournisseur** et surtout **le transit entre villes**. Voici le cycle réel.

### Phase A — Engagement
**1. Nouvelle** *(gris)* — la commande est créée, rien n'est engagé.
**2. Validée** *(laiton)* — la gestionnaire confirme, fixe le prix, **encaisse l'acompte client**.

### Phase B — Fabrication
**3. Avance envoyée** *(laiton foncé)* — l'argent est parti chez le fournisseur. **C'est cet état qui déclenche la fonte**, pas la validation. Tant que l'avance n'est pas versée, le fournisseur ne commence pas.
**4. En création** *(métal en fusion)* — le fournisseur fond la marmite.

### Phase C — Transit inter-villes
**5. Expédiée** *(ocre)* — le fournisseur remet le colis à une agence de transport et **déclare** : agence, n° de bordereau, ville de départ → ville d'arrivée, date de départ, **date d'arrivée prévue**.
**6. Reçue** *(ocre foncé)* — la gestionnaire récupère le colis, fait le **contrôle qualité**. Si conforme → la commande passe en livraison. Sinon → retour fournisseur (état "Litige").

### Phase D — Livraison
**7. En livraison** *(braise)* — assignée à un livreur, avec l'adresse et le montant du solde à encaisser.
**8. Livrée & validée** *(vert)* — le client confirme la réception avec son **code de livraison**, le solde est encaissé, la commission du livreur est créditée.

*(+ deux états d'exception : **Litige** et **Annulée**, avec motif obligatoire.)*

---

## 3 · Le transit inter-villes (Douala ↔ Yaoundé)

Le fournisseur n'est pas dans la ville de la gestionnaire. C'est un vrai maillon, il lui faut son propre suivi.

**Ce que le fournisseur déclare à l'expédition :**
- L'agence de transport (les agences de bus font le fret entre Douala et Yaoundé)
- Le n° de bordereau / reçu
- Ville de départ → ville d'arrivée
- Date de départ + **date d'arrivée prévue**
- Une photo du colis et du bordereau

**Ce que ça donne côté gestionnaire :**
- Un **compte à rebours** sur la carte commande : « Arrivée prévue demain »
- Une **alerte automatique** si la date prévue est dépassée sans réception → elle sait qu'il faut appeler l'agence
- La **date réelle d'arrivée** est enregistrée → on mesure les délais moyens par agence, et on sait à qui faire confiance

**Le bonus** : avec ces données, l'app calcule au fil du temps le **délai moyen réel** (commande → livraison). Tu peux alors annoncer un délai honnête au client, au lieu de deviner.

---

## 4 · Le portefeuille du livreur

C'est la réponse à « accumuler pour prendre en fin de journée ou de semaine ».

Chaque livreur a un **solde** dans l'app, alimenté automatiquement :
- Chaque livraison validée → **+ commission** créditée
- Il voit à tout moment : « Vous avez gagné X sur 7 livraisons cette semaine »
- Quand il veut, il demande un **retrait** → la gestionnaire valide et marque « payé »

### La subtilité à ne pas rater — la compensation
Le livreur **encaisse le solde client en espèces** : il détient donc de l'argent qui appartient à l'entreprise. Et en parallèle, l'entreprise lui doit ses commissions.

> **Au moment du règlement, on compense :**
> `À remettre par le livreur = (cash encaissé chez les clients) − (commissions dues)`
> Un seul mouvement d'argent au lieu de deux. Plus simple, moins d'erreurs, et ça évite au livreur de sortir de l'argent de sa poche.

L'écran de règlement affiche donc trois lignes : cash collecté, commissions dues, **net à remettre (ou à recevoir)**.

---

## 5 · Le code de livraison — la validation client

Pour que « validation du client » soit fiable et sans discussion :

1. Quand la commande passe en livraison, le client reçoit un **code à 4 chiffres** (SMS / WhatsApp).
2. À la remise, le client **donne son code** au livreur, qui le saisit dans l'app.
3. Code correct → livraison confirmée, solde encaissé, commission créditée.

C'est simple pour tout le monde, ça prouve la remise, et ça supprime les litiges du type « je n'ai jamais reçu ». En secours : photo du colis remis + validation manuelle par la gestionnaire.

**Où intervient la gestionnaire ?** Elle valide les livraisons du jour (un écran « À valider »), ce qui **débloque le crédit des commissions**. C'est son point de contrôle : rien n'est payé sans son accord.

---

## 6 · Ce que chaque rôle voit (zéro charge mentale)

**Fournisseur** — trois écrans, jamais plus :
1. « À fondre » — les commandes **dont l'avance est reçue** (il ne voit que celles-là, pas d'ambiguïté)
2. Bouton **« C'est prêt »** → puis le formulaire d'expédition (agence, bordereau, date prévue, photo)
3. Son **solde** : ce qu'il a reçu, ce qui reste dû

**Livreur** — deux écrans :
1. « À livrer » — adresse, client, **solde à encaisser**, bouton d'appel direct
2. **« Livrer »** → saisie du code client → confirmé
3. Son **portefeuille** : gains cumulés + bouton « Demander mon paiement »

**Gestionnaire** — son tableau de bord kanban, plus trois files d'action :
- « Avances à envoyer » (commandes validées, acompte encaissé)
- « Colis à réceptionner » (avec les dates d'arrivée prévues et les retards en rouge)
- « Livraisons à valider » (débloque les commissions)

**Toi (super-admin)** — tout ça + les finances globales, les utilisateurs, les réglages (taux de commission, % d'avance, % d'acompte).

---

## 7 · Les bilans

Chaque commande porte désormais sa **rentabilité réelle** :

> `Marge = Prix client − Avance fournisseur − Commission livreur − Frais de transport`

Les bilans (jour / semaine / mois) affichent :
- Encaissé, en attente d'encaissement
- Sorties : avances fournisseurs, commissions livreurs, transport
- **Marge nette réelle**
- Ce qui est dû à qui (soldes fournisseurs et livreurs en attente)

Exportable en PDF : bon de commande, reçu client, **relevé de compte livreur/fournisseur**, rapport de période.

---

## 8 · Le modèle de données (tables Supabase)

```
users            id, nom, téléphone, rôle, ville, actif
clients          id, nom, téléphone, ville, quartier, adresse, notes
produits         id, nom, photo, caractéristiques, cout_matiere,
                 marge_pct, prix_manuel, prix_final

commandes        id, client_id, produit_id, quantité, specs, photo_ref,
                 prix_total, acompte_montant, acompte_payé,
                 solde_montant, solde_payé,
                 fournisseur_id, avance_montant, avance_payée,
                 livreur_id, commission_montant,
                 ville_livraison, code_livraison,
                 état, créée_le

expeditions      id, commande_id, agence, n_bordereau,
                 ville_depart, ville_arrivee, frais_transport,
                 date_depart, date_arrivee_prevue, date_arrivee_reelle,
                 photo_bordereau

transactions     id, type, commande_id, user_id, montant, sens,
                 moyen (cash / OM / MoMo), date, note
                 → types : acompte_client, solde_client,
                   avance_fournisseur, commission_livreur,
                   retrait_livreur, remise_cash, frais_transport

historique_etats id, commande_id, état, user_id, horodatage

reglages         taux_commission_livreur, pct_avance_fournisseur,
                 pct_acompte_client, villes_actives
```

Les **soldes** (livreur, fournisseur) ne sont pas stockés : ils se **calculent** à partir de la table `transactions`. C'est plus fiable — un solde stocké finit toujours par diverger.

---

## 9 · Les garde-fous à coder

- ❌ Pas d'avance fournisseur si l'acompte client n'est pas encaissé
- ❌ Pas de passage en « En création » si l'avance n'est pas versée
- ❌ Pas de commission créditée sans validation de la gestionnaire
- ⚠️ Alerte si une date d'arrivée prévue est dépassée
- ⚠️ Alerte si un livreur détient du cash au-delà d'un seuil (à régler)
- 🔒 Toute transaction est tracée : qui, quoi, quand, combien

---

*Phase 1 : Douala et Yaoundé uniquement. Le champ `ville` est déjà prévu partout pour ouvrir d'autres villes sans rien réécrire.*
