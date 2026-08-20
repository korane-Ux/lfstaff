-- LFstaff — migration 0006 : actions atomiques
-- À coller dans Supabase → SQL Editor → New query → Run
--
-- Jusqu'ici, des actions comme "valider l'acompte" faisaient 2 appels
-- séparés depuis le navigateur (un update, puis un insert). Sur une
-- connexion 3G qui coupe entre les deux, la commande peut avancer d'état
-- sans que la transaction correspondante soit enregistrée — ou l'inverse.
-- Ces fonctions font tout en un seul appel : soit tout réussit, soit rien
-- n'est appliqué (une fonction SQL s'exécute dans une seule transaction).
--
-- SECURITY INVOKER (par défaut, pas SECURITY DEFINER) : la fonction
-- s'exécute avec les droits de l'appelant, donc les policies RLS
-- existantes sur commandes/transactions/expeditions continuent de
-- s'appliquer normalement à l'intérieur — la sécurité ne change pas,
-- seule l'atomicité s'ajoute.

create function fn_valider_commande(
  p_commande_id uuid,
  p_acompte_montant integer,
  p_moyen moyen_paiement
) returns void as $$
begin
  update commandes
  set acompte_montant = p_acompte_montant,
      acompte_paye = true,
      solde_montant = prix_total - p_acompte_montant,
      etat = 'validee'
  where id = p_commande_id;

  insert into transactions (type, commande_id, montant, sens, moyen)
  values ('acompte_client', p_commande_id, p_acompte_montant, 'entree', p_moyen);
end;
$$ language plpgsql;

create function fn_envoyer_avance(
  p_commande_id uuid,
  p_fournisseur_id uuid,
  p_montant integer,
  p_moyen moyen_paiement
) returns void as $$
begin
  update commandes
  set fournisseur_id = p_fournisseur_id,
      avance_montant = p_montant,
      avance_payee = true,
      etat = 'en_creation'
  where id = p_commande_id;

  insert into transactions (type, commande_id, user_id, montant, sens, moyen)
  values ('avance_fournisseur', p_commande_id, p_fournisseur_id, p_montant, 'sortie', p_moyen);
end;
$$ language plpgsql;

create function fn_expedier_commande(
  p_commande_id uuid,
  p_agence text,
  p_n_bordereau text,
  p_ville_depart text,
  p_ville_arrivee text,
  p_date_arrivee_prevue date,
  p_frais_transport integer,
  p_photo_bordereau text
) returns void as $$
begin
  insert into expeditions (
    commande_id, agence, n_bordereau, ville_depart, ville_arrivee,
    date_depart, date_arrivee_prevue, frais_transport, photo_bordereau
  )
  values (
    p_commande_id, p_agence, p_n_bordereau, p_ville_depart, p_ville_arrivee,
    current_date, p_date_arrivee_prevue, p_frais_transport, p_photo_bordereau
  );

  update commandes set etat = 'expediee' where id = p_commande_id;
end;
$$ language plpgsql;

create function fn_receptionner_commande(p_commande_id uuid) returns void as $$
begin
  update commandes set etat = 'recue' where id = p_commande_id;

  update expeditions
  set date_arrivee_reelle = current_date
  where commande_id = p_commande_id;
end;
$$ language plpgsql;

create function fn_valider_livraison(
  p_commande_id uuid,
  p_livreur_id uuid,
  p_solde_montant integer,
  p_commission_montant integer
) returns void as $$
begin
  update commandes
  set etat = 'livree_validee',
      commission_montant = p_commission_montant
  where id = p_commande_id;

  insert into transactions (type, commande_id, user_id, montant, sens, moyen)
  values
    ('solde_client', p_commande_id, p_livreur_id, p_solde_montant, 'entree', 'cash'),
    ('commission_livreur', p_commande_id, p_livreur_id, p_commission_montant, 'sortie', 'cash');
end;
$$ language plpgsql;

create function fn_marquer_retrait_paye(p_demande_id uuid) returns void as $$
declare
  v_livreur_id uuid;
  v_montant integer;
begin
  select livreur_id, montant into v_livreur_id, v_montant
  from demandes_retrait
  where id = p_demande_id;

  if v_livreur_id is null then
    raise exception 'Demande de retrait introuvable.';
  end if;

  insert into transactions (type, user_id, montant, sens, moyen)
  values ('retrait_livreur', v_livreur_id, v_montant, 'sortie', 'cash');

  update demandes_retrait
  set statut = 'payee', traitee_le = now()
  where id = p_demande_id;
end;
$$ language plpgsql;
