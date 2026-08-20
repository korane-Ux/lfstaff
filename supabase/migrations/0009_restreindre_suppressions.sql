-- LFstaff — migration 0009 : la suppression de fiches (produits, clients)
-- est réservée au super-admin, pas au gestionnaire.
-- À coller dans Supabase → SQL Editor → New query → Run
--
-- Le gestionnaire garde tout le reste (créer/modifier produits et clients,
-- traiter les commandes, générer les PDF, envoyer avances/assigner
-- livreurs...) — seule la suppression définitive de fiches change de
-- niveau, pour ne pas casser le suivi des entrées par erreur.

drop policy "staff supprime le catalogue" on produits;

create policy "super_admin supprime le catalogue" on produits
  for delete using (current_app_role() = 'super_admin');

drop policy "staff gère les clients" on clients;

create policy "staff voit les clients" on clients
  for select using (is_staff());

create policy "staff crée des clients" on clients
  for insert with check (is_staff());

create policy "staff modifie les clients" on clients
  for update using (is_staff());

create policy "super_admin supprime des clients" on clients
  for delete using (current_app_role() = 'super_admin');
