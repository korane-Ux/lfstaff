-- LFstaff — migration 0010 : chaque gestionnaire est cantonné à sa ville
-- À coller dans Supabase → SQL Editor → New query → Run
--
-- Le super_admin garde une vue complète, sans filtre. Un gestionnaire ne
-- voit/gère que les clients, commandes, transactions, expéditions et
-- demandes de retrait de SA ville (users.ville, déjà renseigné à la
-- création du compte). Le catalogue produits reste partagé entre toutes
-- les zones (décision explicite : un seul catalogue, mêmes prix partout).
--
-- Règle NULL : une fiche sans ville renseignée reste visible par tous les
-- gestionnaires plutôt que de devenir invisible pour tout le monde — évite
-- qu'une ancienne fiche sans ville ne disparaisse silencieusement.

create function current_user_ville() returns text as $$
  select ville from public.users where id = auth.uid();
$$ language sql stable security definer set search_path = public;

-- ============================================================
-- users — un gestionnaire ne voit que le staff/livreurs/fournisseurs de
-- sa ville (en plus de lui-même, déjà couvert par "chacun voit sa propre
-- fiche"). Le super_admin voit tout le monde.
-- ============================================================

drop policy "staff voit tout le monde" on users;

create policy "staff voit son perimetre" on users
  for select using (
    current_app_role() = 'super_admin'
    or (current_app_role() = 'gestionnaire' and (ville = current_user_ville() or ville is null))
  );

-- ============================================================
-- clients
-- ============================================================

-- La migration 0009 avait déjà séparé "staff gère les clients" (for all)
-- en policies par commande : seule celle du select change ici, insert/
-- update/delete de 0009 restent telles quelles.
drop policy "staff voit les clients" on clients;

create policy "staff voit les clients de sa zone" on clients
  for select using (
    current_app_role() = 'super_admin'
    or (current_app_role() = 'gestionnaire' and (ville = current_user_ville() or ville is null))
  );

-- ============================================================
-- commandes
-- ============================================================

drop policy "staff voit toutes les commandes" on commandes;

create policy "staff voit les commandes de sa zone" on commandes
  for select using (
    current_app_role() = 'super_admin'
    or (
      current_app_role() = 'gestionnaire'
      and (ville_livraison = current_user_ville() or ville_livraison is null)
    )
  );

drop policy "staff modifie toute commande" on commandes;

create policy "staff modifie les commandes de sa zone" on commandes
  for update using (
    current_app_role() = 'super_admin'
    or (
      current_app_role() = 'gestionnaire'
      and (ville_livraison = current_user_ville() or ville_livraison is null)
    )
  );

-- ============================================================
-- expeditions — pas de colonne ville propre, on remonte à la commande liée.
-- ============================================================

drop policy "staff voit toutes les expeditions" on expeditions;

create policy "staff voit les expeditions de sa zone" on expeditions
  for select using (
    current_app_role() = 'super_admin'
    or (
      current_app_role() = 'gestionnaire'
      and exists (
        select 1 from commandes
        where commandes.id = expeditions.commande_id
          and (commandes.ville_livraison = current_user_ville() or commandes.ville_livraison is null)
      )
    )
  );

-- ============================================================
-- transactions — liées à une commande (avances, acomptes, soldes...) ou
-- directement à un utilisateur (retraits/remises livreur, sans commande).
-- ============================================================

drop policy "staff voit toutes les transactions" on transactions;

create policy "staff voit les transactions de sa zone" on transactions
  for select using (
    current_app_role() = 'super_admin'
    or (
      current_app_role() = 'gestionnaire'
      and (
        (
          commande_id is not null
          and exists (
            select 1 from commandes
            where commandes.id = transactions.commande_id
              and (commandes.ville_livraison = current_user_ville() or commandes.ville_livraison is null)
          )
        )
        or (
          commande_id is null
          and exists (
            select 1 from users
            where users.id = transactions.user_id
              and (users.ville = current_user_ville() or users.ville is null)
          )
        )
      )
    )
  );

-- ============================================================
-- demandes_retrait — rattachées à un livreur, donc à sa ville.
-- ============================================================

drop policy "staff voit toutes les demandes" on demandes_retrait;

create policy "staff voit les demandes de sa zone" on demandes_retrait
  for select using (
    current_app_role() = 'super_admin'
    or (
      current_app_role() = 'gestionnaire'
      and exists (
        select 1 from users
        where users.id = demandes_retrait.livreur_id
          and (users.ville = current_user_ville() or users.ville is null)
      )
    )
  );

drop policy "staff traite les demandes" on demandes_retrait;

create policy "staff traite les demandes de sa zone" on demandes_retrait
  for update using (
    current_app_role() = 'super_admin'
    or (
      current_app_role() = 'gestionnaire'
      and exists (
        select 1 from users
        where users.id = demandes_retrait.livreur_id
          and (users.ville = current_user_ville() or users.ville is null)
      )
    )
  );
