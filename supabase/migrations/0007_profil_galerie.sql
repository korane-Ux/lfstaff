-- LFstaff — migration 0007 : galerie produits + avatar de profil
-- À coller dans Supabase → SQL Editor → New query → Run

alter table users add column avatar_url text;

-- Galerie de photos par produit (en plus de produits.photo_url, qui reste
-- la photo de couverture affichée dans le catalogue). `position` fixe
-- l'ordre d'affichage ; on l'assigne côté client à l'upload (max existant + 1).
create table produit_images (
  id uuid primary key default gen_random_uuid(),
  produit_id uuid not null references produits (id) on delete cascade,
  url text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index idx_produit_images_produit on produit_images (produit_id);

alter table produit_images enable row level security;

create policy "staff connecté voit la galerie" on produit_images
  for select using (auth.uid() is not null);

create policy "staff gère la galerie" on produit_images
  for insert with check (is_staff());

create policy "staff modifie la galerie" on produit_images
  for update using (is_staff());

create policy "staff supprime la galerie" on produit_images
  for delete using (is_staff());
