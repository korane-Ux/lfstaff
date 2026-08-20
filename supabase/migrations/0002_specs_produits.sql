-- LFstaff — migration 0002 : caractéristiques propres à une marmite métallique
-- À coller dans Supabase → SQL Editor → New query → Run
-- (schema.sql + policies.sql représentent l'état déjà en place ; les
-- évolutions suivantes vivent ici, numérotées, plutôt que de tout réécrire.)

alter table produits
  add column contenance_litres numeric(5, 1) check (contenance_litres > 0),
  add column diametre_cm numeric(5, 1) check (diametre_cm > 0),
  add column hauteur_cm numeric(5, 1) check (hauteur_cm > 0),
  add column poids_kg numeric(5, 1) check (poids_kg > 0),
  add column nb_anses integer not null default 2 check (nb_anses >= 0),
  add column couvercle_inclus boolean not null default true;

comment on column produits.caracteristiques is
  'Précisions libres en complément des mesures structurées (contenance, diamètre, hauteur, poids, anses, couvercle).';
