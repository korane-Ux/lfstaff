-- LFstaff — migration 0003 : confirmation de livraison par code, côté serveur
-- À coller dans Supabase → SQL Editor → New query → Run

-- Pourquoi une fonction plutôt qu'un simple update depuis l'app : la policy
-- RLS "livreur voit ses livraisons" lui donne accès à toute la ligne de sa
-- commande, y compris code_livraison. S'il pouvait le lire, il pourrait
-- "livrer" sans jamais avoir vu le client. Cette fonction compare le code
-- entièrement côté base — le vrai code n'est jamais envoyé au navigateur
-- du livreur, ni avant ni pendant la vérification. Elle renvoie juste
-- vrai/faux.
create function fn_confirmer_livraison(p_commande_id uuid, p_code text) returns boolean as $$
declare
  v_rows integer;
begin
  update commandes
  set solde_paye = true
  where id = p_commande_id
    and livreur_id = auth.uid()
    and etat = 'en_livraison'
    and code_livraison = p_code;

  get diagnostics v_rows = row_count;
  return v_rows > 0;
end;
$$ language plpgsql set search_path = public;

grant execute on function fn_confirmer_livraison(uuid, text) to authenticated;
