-- LFstaff — migration 0011 : produit ↔ fournisseur assigné + alertes de disponibilité
-- À coller dans Supabase → SQL Editor → New query → Run
--
-- 1) Corrige un effet de bord de la migration 0010 : les fournisseurs
--    (comme le catalogue) doivent rester visibles par TOUS les
--    gestionnaires, pas seulement ceux de leur ville — un fournisseur
--    peut fabriquer pour plusieurs zones. Seuls livreurs/gestionnaires
--    restent cantonnés à la ville.
-- 2) Chaque produit peut être associé à un fournisseur par défaut : à
--    l'étape "envoyer l'avance", ce fournisseur est pré-sélectionné au
--    lieu de devoir le choisir à chaque fois.
-- 3) Alertes de disponibilité : le gestionnaire demande à tout ou partie
--    de ses fournisseurs si un produit est disponible ; chacun répond.

drop policy "staff voit son perimetre" on users;

create policy "staff voit son perimetre" on users
  for select using (
    current_app_role() = 'super_admin'
    or (is_staff() and role = 'fournisseur')
    or (current_app_role() = 'gestionnaire' and (ville = current_user_ville() or ville is null))
  );

alter table produits add column fournisseur_id uuid references users (id);

create table alertes_disponibilite (
  id uuid primary key default gen_random_uuid(),
  produit_id uuid not null references produits (id) on delete cascade,
  message text,
  cree_par uuid references users (id) default auth.uid(),
  created_at timestamptz not null default now()
);

create table alerte_reponses (
  id uuid primary key default gen_random_uuid(),
  alerte_id uuid not null references alertes_disponibilite (id) on delete cascade,
  fournisseur_id uuid not null references users (id),
  disponible boolean,
  quantite_disponible integer,
  repondu_le timestamptz,
  unique (alerte_id, fournisseur_id)
);

create index idx_alerte_reponses_alerte on alerte_reponses (alerte_id);
create index idx_alerte_reponses_fournisseur on alerte_reponses (fournisseur_id);

alter table alertes_disponibilite enable row level security;
alter table alerte_reponses enable row level security;

create policy "staff gère les alertes" on alertes_disponibilite
  for all using (is_staff()) with check (is_staff());

create policy "fournisseur voit les alertes qui le concernent" on alertes_disponibilite
  for select using (
    exists (
      select 1 from alerte_reponses
      where alerte_reponses.alerte_id = alertes_disponibilite.id
        and alerte_reponses.fournisseur_id = auth.uid()
    )
  );

create policy "staff voit les reponses" on alerte_reponses
  for select using (is_staff());

create policy "staff crée les destinataires" on alerte_reponses
  for insert with check (is_staff());

create policy "fournisseur voit ses reponses" on alerte_reponses
  for select using (fournisseur_id = auth.uid());

create policy "fournisseur répond" on alerte_reponses
  for update using (fournisseur_id = auth.uid());
