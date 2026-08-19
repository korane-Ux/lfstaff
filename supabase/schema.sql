-- LFstaff — schéma de base (tables, types, triggers, vues de solde)
-- À coller dans Supabase → SQL Editor → New query → Run.
-- Voir supabase/policies.sql pour la sécurité (RLS) et supabase/README.md pour le mode d'emploi.

create extension if not exists pgcrypto;

-- ============================================================
-- 1. Types
-- ============================================================

create type app_role as enum ('super_admin', 'gestionnaire', 'fournisseur', 'livreur');

create type etat_commande as enum (
  'nouvelle',
  'validee',
  'avance_envoyee',
  'en_creation',
  'expediee',
  'recue',
  'en_livraison',
  'livree_validee',
  'litige',
  'annulee'
);

create type moyen_paiement as enum ('cash', 'om', 'momo');

create type transaction_type as enum (
  'acompte_client',
  'solde_client',
  'avance_fournisseur',
  'commission_livreur',
  'retrait_livreur',
  'remise_cash',
  'frais_transport'
);

create type transaction_sens as enum ('entree', 'sortie');

-- ============================================================
-- 2. Tables
-- ============================================================

-- Le champ `ville` est en texte libre partout (pas un enum) : ouvrir une
-- ville en Phase 2 se fait en l'ajoutant à reglages.villes_actives, sans
-- migration de schéma.

create table users (
  id uuid primary key references auth.users (id) on delete cascade,
  nom text not null,
  telephone text,
  role app_role not null,
  ville text,
  actif boolean not null default true,
  created_at timestamptz not null default now()
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  telephone text,
  ville text,
  quartier text,
  adresse text,
  notes text,
  created_at timestamptz not null default now()
);

create table produits (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  photo_url text,
  caracteristiques text,
  cout_matiere integer check (cout_matiere >= 0),
  marge_pct numeric(5, 2) check (marge_pct >= 0),
  prix_manuel integer check (prix_manuel >= 0),
  prix_final integer,
  actif boolean not null default true,
  created_at timestamptz not null default now()
);

create table commandes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id),
  produit_id uuid not null references produits (id),
  quantite integer not null default 1 check (quantite > 0),
  specs text,
  photo_ref text,
  prix_total integer not null check (prix_total >= 0),
  acompte_montant integer not null default 0 check (acompte_montant >= 0),
  acompte_paye boolean not null default false,
  solde_montant integer not null default 0 check (solde_montant >= 0),
  solde_paye boolean not null default false,
  fournisseur_id uuid references users (id),
  avance_montant integer default 0 check (avance_montant >= 0),
  avance_payee boolean not null default false,
  livreur_id uuid references users (id),
  commission_montant integer default 0 check (commission_montant >= 0),
  ville_livraison text,
  code_livraison text,
  etat etat_commande not null default 'nouvelle',
  motif_annulation text,
  cree_le timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table expeditions (
  id uuid primary key default gen_random_uuid(),
  commande_id uuid not null references commandes (id) on delete cascade,
  agence text not null,
  n_bordereau text,
  ville_depart text,
  ville_arrivee text,
  frais_transport integer default 0 check (frais_transport >= 0),
  date_depart date,
  date_arrivee_prevue date,
  date_arrivee_reelle date,
  photo_bordereau text,
  created_at timestamptz not null default now()
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  type transaction_type not null,
  commande_id uuid references commandes (id),
  user_id uuid references users (id),
  montant integer not null check (montant > 0),
  sens transaction_sens not null,
  moyen moyen_paiement not null default 'cash',
  cree_par uuid references users (id) default auth.uid(),
  date date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create table historique_etats (
  id uuid primary key default gen_random_uuid(),
  commande_id uuid not null references commandes (id) on delete cascade,
  etat etat_commande not null,
  user_id uuid references users (id),
  horodatage timestamptz not null default now()
);

-- Ligne unique de réglages globaux (astuce : id booléen à valeur forcée
-- `true`, la contrainte de clé primaire empêche d'avoir une 2e ligne).
create table reglages (
  id boolean primary key default true check (id),
  taux_commission_livreur numeric(5, 2) not null default 10,
  pct_avance_fournisseur numeric(5, 2) not null default 50,
  pct_acompte_client numeric(5, 2) not null default 60,
  villes_actives text[] not null default array['Douala', 'Yaoundé']
);

insert into reglages (id) values (true);

-- ============================================================
-- 3. Index
-- ============================================================

create index idx_commandes_fournisseur on commandes (fournisseur_id);
create index idx_commandes_livreur on commandes (livreur_id);
create index idx_commandes_etat on commandes (etat);
create index idx_transactions_user on transactions (user_id);
create index idx_transactions_commande on transactions (commande_id);
create index idx_historique_commande on historique_etats (commande_id);
create index idx_expeditions_commande on expeditions (commande_id);

-- ============================================================
-- 4. Triggers — les garde-fous métier (voir lfstaff-systeme.md §9)
-- ============================================================

-- 4.1 — prix_final : le prix manuel écrase toujours le calcul automatique.
create function fn_produits_prix_final() returns trigger as $$
begin
  if new.prix_manuel is not null then
    new.prix_final := new.prix_manuel;
  elsif new.cout_matiere is not null and new.marge_pct is not null then
    new.prix_final := round(new.cout_matiere * (1 + new.marge_pct / 100));
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_produits_prix_final
  before insert or update on produits
  for each row execute function fn_produits_prix_final();

-- 4.2 — updated_at auto sur commandes.
create function fn_touch_updated_at() returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger trg_commandes_touch
  before update on commandes
  for each row execute function fn_touch_updated_at();

-- 4.3 — la règle d'or : pas d'avance sans acompte, pas de fonte sans avance ;
-- code de livraison auto-généré ; motif obligatoire pour litige/annulée.
create function fn_check_commande_transition() returns trigger as $$
begin
  if new.etat = 'avance_envoyee' and not new.acompte_paye then
    raise exception 'Impossible d''envoyer l''avance fournisseur : l''acompte client n''est pas encore encaissé.';
  end if;

  if new.etat = 'en_creation' and not new.avance_payee then
    raise exception 'Impossible de passer en création : l''avance fournisseur n''est pas encore versée.';
  end if;

  if new.etat in ('litige', 'annulee') and coalesce(new.motif_annulation, '') = '' then
    raise exception 'Un motif est obligatoire pour passer une commande en % .', new.etat;
  end if;

  if new.etat = 'en_livraison' and new.code_livraison is null then
    new.code_livraison := lpad(floor(random() * 10000)::text, 4, '0');
  end if;

  return new;
end;
$$ language plpgsql;

create trigger trg_commandes_check_transition
  before update on commandes
  for each row
  when (old.etat is distinct from new.etat)
  execute function fn_check_commande_transition();

-- 4.4 — historique automatique : chaque changement d'état est tracé, avec
-- l'auteur (auth.uid()) et l'horodatage. SECURITY DEFINER pour pouvoir
-- écrire dans historique_etats même si l'appelant (fournisseur, livreur...)
-- n'a pas de droit d'écriture direct sur cette table (voir policies.sql).
create function fn_log_etat_change() returns trigger as $$
begin
  insert into historique_etats (commande_id, etat, user_id)
  values (new.id, new.etat, auth.uid());
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_commandes_log_insert
  after insert on commandes
  for each row execute function fn_log_etat_change();

create trigger trg_commandes_log_update
  after update on commandes
  for each row
  when (old.etat is distinct from new.etat)
  execute function fn_log_etat_change();

-- 4.5 — une commission ne peut être créditée (transaction insérée) que si
-- la commande correspondante est déjà "livree_validee" — c'est-à-dire
-- validée par la gestionnaire. Complète la policy RLS de transactions.
create function fn_check_commission_insert() returns trigger as $$
declare
  etat_commande_actuel etat_commande;
begin
  if new.type = 'commission_livreur' then
    select etat into etat_commande_actuel from commandes where id = new.commande_id;
    if etat_commande_actuel is distinct from 'livree_validee' then
      raise exception 'Une commission ne peut être créditée que sur une commande livrée et validée.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_transactions_check_commission
  before insert on transactions
  for each row execute function fn_check_commission_insert();

-- ============================================================
-- 5. Vues — soldes calculés (jamais stockés, voir lfstaff-systeme.md §8)
-- ============================================================

-- Ce que l'entreprise a versé à chaque fournisseur à ce jour.
create view v_solde_fournisseur as
select
  user_id as fournisseur_id,
  coalesce(sum(montant), 0) as total_recu
from transactions
where type = 'avance_fournisseur'
group by user_id;

-- Portefeuille livreur avec compensation (lfstaff-systeme.md §4) :
--   net à remettre = cash encaissé chez les clients − commissions dues
-- où "dues" et "encaissé" s'entendent déjà nets de ce qui a été réglé
-- (retrait_livreur = commissions déjà payées, remise_cash = cash déjà remis).
create view v_solde_livreur as
select
  u.id as livreur_id,
  coalesce(sum(t.montant) filter (where t.type = 'commission_livreur'), 0)
    - coalesce(sum(t.montant) filter (where t.type = 'retrait_livreur'), 0)
    as commissions_dues,
  coalesce(sum(t.montant) filter (where t.type = 'solde_client'), 0)
    - coalesce(sum(t.montant) filter (where t.type = 'remise_cash'), 0)
    as cash_en_main,
  (
    coalesce(sum(t.montant) filter (where t.type = 'solde_client'), 0)
    - coalesce(sum(t.montant) filter (where t.type = 'remise_cash'), 0)
  ) - (
    coalesce(sum(t.montant) filter (where t.type = 'commission_livreur'), 0)
    - coalesce(sum(t.montant) filter (where t.type = 'retrait_livreur'), 0)
  ) as net_a_remettre
from users u
left join transactions t on t.user_id = u.id
where u.role = 'livreur'
group by u.id;
