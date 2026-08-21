-- LFstaff — migration 0013 : localisation de la boutique (quartier/adresse)
-- À coller dans Supabase → SQL Editor → New query → Run
--
-- Même modèle que clients.quartier/adresse — utile surtout pour les
-- fournisseurs (savoir où se trouve l'atelier), mais posé sur users en
-- général comme ville l'est déjà, plutôt que juste sur le rôle fournisseur.

alter table users add column quartier text;
alter table users add column adresse text;
