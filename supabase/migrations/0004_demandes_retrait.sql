-- LFstaff — migration 0004 : demandes de retrait livreur
-- À coller dans Supabase → SQL Editor → New query → Run

create type statut_retrait as enum ('en_attente', 'payee');

create table demandes_retrait (
  id uuid primary key default gen_random_uuid(),
  livreur_id uuid not null references users (id) default auth.uid(),
  montant integer not null check (montant > 0),
  statut statut_retrait not null default 'en_attente',
  created_at timestamptz not null default now(),
  traitee_le timestamptz
);

create index idx_demandes_retrait_livreur on demandes_retrait (livreur_id);

alter table demandes_retrait enable row level security;

create policy "livreur voit ses demandes" on demandes_retrait
  for select using (livreur_id = auth.uid());

create policy "livreur crée sa demande" on demandes_retrait
  for insert with check (livreur_id = auth.uid());

create policy "staff voit toutes les demandes" on demandes_retrait
  for select using (is_staff());

create policy "staff traite les demandes" on demandes_retrait
  for update using (is_staff());
