-- LFstaff — migration 0005 : bucket Storage pour les photos
-- À coller dans Supabase → SQL Editor → New query → Run

-- Bucket unique "photos", organisé par dossier (produits/, commandes/,
-- expeditions/) plutôt que 3 buckets séparés — plus simple à gérer, la
-- RLS ci-dessous ne distingue pas les dossiers : n'importe quel membre du
-- staff connecté peut uploader et voir les photos. Simplification
-- délibérée pour une petite équipe interne de confiance ; à revoir si
-- l'app s'ouvre un jour à plus de monde.
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

create policy "staff connecte uploade des photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'photos');

create policy "staff connecte voit les photos" on storage.objects
  for select to authenticated
  using (bucket_id = 'photos');

create policy "staff connecte met a jour les photos" on storage.objects
  for update to authenticated
  using (bucket_id = 'photos');

create policy "staff connecte supprime des photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'photos');
