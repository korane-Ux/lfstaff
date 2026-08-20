-- LFstaff — Row Level Security : chaque rôle ne voit que son périmètre.
-- À coller après supabase/schema.sql, dans le même SQL Editor.
-- Voir supabase/README.md pour le mode d'emploi et le bootstrap du 1er super_admin.

-- ============================================================
-- 0. Fonctions utilitaires
-- ============================================================

-- SECURITY DEFINER : nécessaire pour éviter une récursion infinie quand une
-- policy sur `users` a besoin d'interroger... `users`. La fonction s'exécute
-- avec les droits de son propriétaire (qui contourne RLS), pas ceux de
-- l'appelant.
create function current_app_role() returns app_role as $$
  select role from public.users where id = auth.uid();
$$ language sql stable security definer set search_path = public;

create function is_staff() returns boolean as $$
  select current_app_role() in ('super_admin', 'gestionnaire');
$$ language sql stable security definer set search_path = public;

-- ============================================================
-- 1. users
-- ============================================================

alter table users enable row level security;

create policy "staff voit tout le monde" on users
  for select using (is_staff());

create policy "chacun voit sa propre fiche" on users
  for select using (id = auth.uid());

create policy "super_admin crée les comptes" on users
  for insert with check (current_app_role() = 'super_admin');

create policy "super_admin modifie tout" on users
  for update using (current_app_role() = 'super_admin');

create policy "chacun modifie sa propre fiche" on users
  for update using (id = auth.uid());

-- Empêche un utilisateur de s'auto-promouvoir via la policy ci-dessus
-- ("chacun modifie sa propre fiche" ne doit pas permettre de changer son rôle).
create function fn_prevent_self_role_change() returns trigger as $$
begin
  if new.role is distinct from old.role and current_app_role() is distinct from 'super_admin' then
    raise exception 'Seul un super-admin peut changer un rôle.';
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_users_prevent_self_role_change
  before update on users
  for each row execute function fn_prevent_self_role_change();

-- ============================================================
-- 2. clients
-- ============================================================

alter table clients enable row level security;

create policy "staff gère les clients" on clients
  for all using (is_staff()) with check (is_staff());

-- Le livreur a besoin des coordonnées du client qu'il livre aujourd'hui.
create policy "livreur voit ses clients du jour" on clients
  for select using (
    exists (
      select 1 from commandes
      where commandes.client_id = clients.id
        and commandes.livreur_id = auth.uid()
    )
  );

-- ============================================================
-- 3. produits — le catalogue est visible par tout le staff connecté,
-- seul le staff (gestionnaire/super_admin) peut le modifier.
-- ============================================================

alter table produits enable row level security;

create policy "staff connecté voit le catalogue" on produits
  for select using (auth.uid() is not null);

create policy "staff gère le catalogue" on produits
  for insert with check (is_staff());

create policy "staff modifie le catalogue" on produits
  for update using (is_staff());

create policy "staff supprime le catalogue" on produits
  for delete using (is_staff());

-- ============================================================
-- 4. commandes
-- ============================================================

alter table commandes enable row level security;

create policy "staff voit toutes les commandes" on commandes
  for select using (is_staff());

create policy "fournisseur voit ses commandes" on commandes
  for select using (fournisseur_id = auth.uid());

create policy "livreur voit ses livraisons" on commandes
  for select using (livreur_id = auth.uid());

create policy "staff crée les commandes" on commandes
  for insert with check (is_staff());

create policy "staff modifie toute commande" on commandes
  for update using (is_staff());

create policy "fournisseur modifie ses commandes" on commandes
  for update using (fournisseur_id = auth.uid());

create policy "livreur modifie ses livraisons" on commandes
  for update using (livreur_id = auth.uid());

-- Pas de policy DELETE : une commande ne se supprime jamais, elle passe à
-- l'état "annulee" (garde l'historique et les transactions cohérents).

-- ============================================================
-- 5. expeditions
-- ============================================================

alter table expeditions enable row level security;

create policy "staff voit toutes les expeditions" on expeditions
  for select using (is_staff());

create policy "fournisseur voit ses expeditions" on expeditions
  for select using (
    exists (
      select 1 from commandes
      where commandes.id = expeditions.commande_id
        and commandes.fournisseur_id = auth.uid()
    )
  );

create policy "livreur voit ses expeditions" on expeditions
  for select using (
    exists (
      select 1 from commandes
      where commandes.id = expeditions.commande_id
        and commandes.livreur_id = auth.uid()
    )
  );

create policy "staff gère les expeditions" on expeditions
  for all using (is_staff()) with check (is_staff());

create policy "fournisseur déclare l'expédition de sa commande" on expeditions
  for insert with check (
    exists (
      select 1 from commandes
      where commandes.id = expeditions.commande_id
        and commandes.fournisseur_id = auth.uid()
    )
  );

create policy "fournisseur corrige sa déclaration" on expeditions
  for update using (
    exists (
      select 1 from commandes
      where commandes.id = expeditions.commande_id
        and commandes.fournisseur_id = auth.uid()
    )
  );

-- ============================================================
-- 6. transactions — la gestionnaire (ou le super_admin) est le seul point
-- d'écriture : "rien n'est payé sans son accord" (lfstaff-systeme.md §5).
-- Aucune policy UPDATE/DELETE : une transaction est un fait comptable
-- immuable, on corrige une erreur avec une écriture inverse, pas une édition.
-- ============================================================

alter table transactions enable row level security;

create policy "staff voit toutes les transactions" on transactions
  for select using (is_staff());

create policy "chacun voit ses propres transactions" on transactions
  for select using (user_id = auth.uid());

create policy "staff seul enregistre une transaction" on transactions
  for insert with check (is_staff());

-- ============================================================
-- 7. historique_etats — lecture seule pour tout le monde, écriture
-- réservée au trigger système (SECURITY DEFINER, voir schema.sql §4.4).
-- ============================================================

alter table historique_etats enable row level security;

create policy "staff voit tout l'historique" on historique_etats
  for select using (is_staff());

create policy "chacun voit l'historique de ses commandes" on historique_etats
  for select using (
    exists (
      select 1 from commandes
      where commandes.id = historique_etats.commande_id
        and (commandes.fournisseur_id = auth.uid() or commandes.livreur_id = auth.uid())
    )
  );

-- ============================================================
-- 8. reglages — lecture pour tout le staff connecté (ex. villes_actives
-- pour les formulaires), écriture réservée au super_admin.
-- ============================================================

alter table reglages enable row level security;

create policy "staff connecté lit les réglages" on reglages
  for select using (auth.uid() is not null);

create policy "super_admin modifie les réglages" on reglages
  for update using (current_app_role() = 'super_admin');
