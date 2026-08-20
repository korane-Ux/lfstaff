-- LFstaff — migration 0008 : catégories produits + "grande commande" (lots)
-- À coller dans Supabase → SQL Editor → New query → Run
--
-- "Grande commande" = regrouper plusieurs commandes clients déjà
-- existantes pour les envoyer en une seule fois à un fournisseur (avance
-- groupée) ou à un livreur (assignation groupée). Chaque commande garde
-- son cycle de vie individuel (état, transactions) — le lot ne sert qu'à
-- les traiter ensemble et à garder une trace du regroupement.

alter table produits add column categorie text;

create table lots (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('fournisseur', 'livreur')),
  destinataire_id uuid not null references users (id),
  cree_par uuid references users (id) default auth.uid(),
  cree_le timestamptz not null default now()
);

alter table commandes
  add column lot_fournisseur_id uuid references lots (id),
  add column lot_livreur_id uuid references lots (id);

alter table lots enable row level security;

create policy "staff gère les lots" on lots
  for all using (is_staff()) with check (is_staff());

-- Avance groupée : une ligne par commande (montant propre à chacune, comme
-- fn_envoyer_avance) mais un seul lot + une seule action côté UI.
-- p_lignes : [{"commande_id": "...", "montant": 12345}, ...]
create function fn_envoyer_avance_groupee(
  p_fournisseur_id uuid,
  p_moyen moyen_paiement,
  p_lignes jsonb
) returns uuid as $$
declare
  v_lot_id uuid;
  v_ligne jsonb;
begin
  insert into lots (type, destinataire_id) values ('fournisseur', p_fournisseur_id)
  returning id into v_lot_id;

  for v_ligne in select * from jsonb_array_elements(p_lignes)
  loop
    update commandes
    set fournisseur_id = p_fournisseur_id,
        avance_montant = (v_ligne ->> 'montant')::integer,
        avance_payee = true,
        etat = 'en_creation',
        lot_fournisseur_id = v_lot_id
    where id = (v_ligne ->> 'commande_id')::uuid;

    insert into transactions (type, commande_id, user_id, montant, sens, moyen)
    values (
      'avance_fournisseur',
      (v_ligne ->> 'commande_id')::uuid,
      p_fournisseur_id,
      (v_ligne ->> 'montant')::integer,
      'sortie',
      p_moyen
    );
  end loop;

  return v_lot_id;
end;
$$ language plpgsql;

-- Assignation groupée à un livreur : équivalent du "conforme" du contrôle
-- qualité, mais pour plusieurs commandes "reçue" à la fois.
create function fn_assigner_livreur_groupe(
  p_livreur_id uuid,
  p_commande_ids uuid[]
) returns uuid as $$
declare
  v_lot_id uuid;
begin
  insert into lots (type, destinataire_id) values ('livreur', p_livreur_id)
  returning id into v_lot_id;

  update commandes
  set livreur_id = p_livreur_id,
      etat = 'en_livraison',
      lot_livreur_id = v_lot_id
  where id = any(p_commande_ids);

  return v_lot_id;
end;
$$ language plpgsql;
