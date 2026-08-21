-- LFstaff — migration 0012 : email client, pour les notifications de suivi
-- À coller dans Supabase → SQL Editor → New query → Run

alter table clients add column email text;
