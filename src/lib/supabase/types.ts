// Stub partiel écrit à la main (users, clients, produits, commandes, reglages).
// Régénérer les types complets une fois `supabase login` fait :
// npx supabase gen types typescript --project-id vhzhpsvpfosmfkgeegnl > src/lib/supabase/types.ts

export type AppRole = "super_admin" | "gestionnaire" | "fournisseur" | "livreur";

export type AppEtat =
  | "nouvelle"
  | "validee"
  | "avance_envoyee"
  | "en_creation"
  | "expediee"
  | "recue"
  | "en_livraison"
  | "livree_validee"
  | "litige"
  | "annulee";

export type TransactionType =
  | "acompte_client"
  | "solde_client"
  | "avance_fournisseur"
  | "commission_livreur"
  | "retrait_livreur"
  | "remise_cash"
  | "frais_transport";

export type TransactionSens = "entree" | "sortie";

export type MoyenPaiement = "cash" | "om" | "momo";

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          nom: string;
          telephone: string | null;
          role: AppRole;
          ville: string | null;
          actif: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          nom: string;
          telephone?: string | null;
          role: AppRole;
          ville?: string | null;
          actif?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          nom?: string;
          telephone?: string | null;
          role?: AppRole;
          ville?: string | null;
          actif?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          nom: string;
          telephone: string | null;
          ville: string | null;
          quartier: string | null;
          adresse: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          nom: string;
          telephone?: string | null;
          ville?: string | null;
          quartier?: string | null;
          adresse?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          nom?: string;
          telephone?: string | null;
          ville?: string | null;
          quartier?: string | null;
          adresse?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      produits: {
        Row: {
          id: string;
          nom: string;
          photo_url: string | null;
          caracteristiques: string | null;
          contenance_litres: number | null;
          diametre_cm: number | null;
          hauteur_cm: number | null;
          poids_kg: number | null;
          nb_anses: number;
          couvercle_inclus: boolean;
          cout_matiere: number | null;
          marge_pct: number | null;
          prix_manuel: number | null;
          prix_final: number | null;
          actif: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          nom: string;
          photo_url?: string | null;
          caracteristiques?: string | null;
          contenance_litres?: number | null;
          diametre_cm?: number | null;
          hauteur_cm?: number | null;
          poids_kg?: number | null;
          nb_anses?: number;
          couvercle_inclus?: boolean;
          cout_matiere?: number | null;
          marge_pct?: number | null;
          prix_manuel?: number | null;
          prix_final?: number | null;
          actif?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          nom?: string;
          photo_url?: string | null;
          caracteristiques?: string | null;
          contenance_litres?: number | null;
          diametre_cm?: number | null;
          hauteur_cm?: number | null;
          poids_kg?: number | null;
          nb_anses?: number;
          couvercle_inclus?: boolean;
          cout_matiere?: number | null;
          marge_pct?: number | null;
          prix_manuel?: number | null;
          prix_final?: number | null;
          actif?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      commandes: {
        Row: {
          id: string;
          client_id: string;
          produit_id: string;
          quantite: number;
          specs: string | null;
          photo_ref: string | null;
          prix_total: number;
          acompte_montant: number;
          acompte_paye: boolean;
          solde_montant: number;
          solde_paye: boolean;
          fournisseur_id: string | null;
          avance_montant: number | null;
          avance_payee: boolean;
          livreur_id: string | null;
          commission_montant: number | null;
          ville_livraison: string | null;
          code_livraison: string | null;
          etat: AppEtat;
          motif_annulation: string | null;
          cree_le: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          produit_id: string;
          quantite?: number;
          specs?: string | null;
          photo_ref?: string | null;
          prix_total: number;
          acompte_montant?: number;
          acompte_paye?: boolean;
          solde_montant?: number;
          solde_paye?: boolean;
          fournisseur_id?: string | null;
          avance_montant?: number | null;
          avance_payee?: boolean;
          livreur_id?: string | null;
          commission_montant?: number | null;
          ville_livraison?: string | null;
          code_livraison?: string | null;
          etat?: AppEtat;
          motif_annulation?: string | null;
          cree_le?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          produit_id?: string;
          quantite?: number;
          specs?: string | null;
          photo_ref?: string | null;
          prix_total?: number;
          acompte_montant?: number;
          acompte_paye?: boolean;
          solde_montant?: number;
          solde_paye?: boolean;
          fournisseur_id?: string | null;
          avance_montant?: number | null;
          avance_payee?: boolean;
          livreur_id?: string | null;
          commission_montant?: number | null;
          ville_livraison?: string | null;
          code_livraison?: string | null;
          etat?: AppEtat;
          motif_annulation?: string | null;
          cree_le?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      expeditions: {
        Row: {
          id: string;
          commande_id: string;
          agence: string;
          n_bordereau: string | null;
          ville_depart: string | null;
          ville_arrivee: string | null;
          frais_transport: number | null;
          date_depart: string | null;
          date_arrivee_prevue: string | null;
          date_arrivee_reelle: string | null;
          photo_bordereau: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          commande_id: string;
          agence: string;
          n_bordereau?: string | null;
          ville_depart?: string | null;
          ville_arrivee?: string | null;
          frais_transport?: number | null;
          date_depart?: string | null;
          date_arrivee_prevue?: string | null;
          date_arrivee_reelle?: string | null;
          photo_bordereau?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          commande_id?: string;
          agence?: string;
          n_bordereau?: string | null;
          ville_depart?: string | null;
          ville_arrivee?: string | null;
          frais_transport?: number | null;
          date_depart?: string | null;
          date_arrivee_prevue?: string | null;
          date_arrivee_reelle?: string | null;
          photo_bordereau?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          type: TransactionType;
          commande_id: string | null;
          user_id: string | null;
          montant: number;
          sens: TransactionSens;
          moyen: MoyenPaiement;
          cree_par: string | null;
          date: string;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: TransactionType;
          commande_id?: string | null;
          user_id?: string | null;
          montant: number;
          sens: TransactionSens;
          moyen?: MoyenPaiement;
          cree_par?: string | null;
          date?: string;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: TransactionType;
          commande_id?: string | null;
          user_id?: string | null;
          montant?: number;
          sens?: TransactionSens;
          moyen?: MoyenPaiement;
          cree_par?: string | null;
          date?: string;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      reglages: {
        Row: {
          id: boolean;
          taux_commission_livreur: number;
          pct_avance_fournisseur: number;
          pct_acompte_client: number;
          villes_actives: string[];
        };
        Insert: {
          id?: boolean;
          taux_commission_livreur?: number;
          pct_avance_fournisseur?: number;
          pct_acompte_client?: number;
          villes_actives?: string[];
        };
        Update: {
          id?: boolean;
          taux_commission_livreur?: number;
          pct_avance_fournisseur?: number;
          pct_acompte_client?: number;
          villes_actives?: string[];
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      fn_confirmer_livraison: {
        Args: { p_commande_id: string; p_code: string };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: AppRole;
      etat_commande: AppEtat;
      transaction_type: TransactionType;
      transaction_sens: TransactionSens;
      moyen_paiement: MoyenPaiement;
    };
    CompositeTypes: Record<string, never>;
  };
};
