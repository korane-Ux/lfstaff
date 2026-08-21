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

export type StatutRetrait = "en_attente" | "payee";

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
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          nom: string;
          telephone?: string | null;
          role: AppRole;
          ville?: string | null;
          actif?: boolean;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          nom?: string;
          telephone?: string | null;
          role?: AppRole;
          ville?: string | null;
          actif?: boolean;
          avatar_url?: string | null;
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
          categorie: string | null;
          fournisseur_id: string | null;
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
          categorie?: string | null;
          fournisseur_id?: string | null;
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
          categorie?: string | null;
          fournisseur_id?: string | null;
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
          lot_fournisseur_id: string | null;
          lot_livreur_id: string | null;
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
          lot_fournisseur_id?: string | null;
          lot_livreur_id?: string | null;
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
          lot_fournisseur_id?: string | null;
          lot_livreur_id?: string | null;
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
      produit_images: {
        Row: {
          id: string;
          produit_id: string;
          url: string;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          produit_id: string;
          url: string;
          position?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          produit_id?: string;
          url?: string;
          position?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      historique_etats: {
        Row: {
          id: string;
          commande_id: string;
          etat: AppEtat;
          user_id: string | null;
          horodatage: string;
        };
        Insert: {
          id?: string;
          commande_id: string;
          etat: AppEtat;
          user_id?: string | null;
          horodatage?: string;
        };
        Update: {
          id?: string;
          commande_id?: string;
          etat?: AppEtat;
          user_id?: string | null;
          horodatage?: string;
        };
        Relationships: [];
      };
      lots: {
        Row: {
          id: string;
          type: "fournisseur" | "livreur";
          destinataire_id: string;
          cree_par: string | null;
          cree_le: string;
        };
        Insert: {
          id?: string;
          type: "fournisseur" | "livreur";
          destinataire_id: string;
          cree_par?: string | null;
          cree_le?: string;
        };
        Update: {
          id?: string;
          type?: "fournisseur" | "livreur";
          destinataire_id?: string;
          cree_par?: string | null;
          cree_le?: string;
        };
        Relationships: [];
      };
      alertes_disponibilite: {
        Row: {
          id: string;
          produit_id: string;
          message: string | null;
          cree_par: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          produit_id: string;
          message?: string | null;
          cree_par?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          produit_id?: string;
          message?: string | null;
          cree_par?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      alerte_reponses: {
        Row: {
          id: string;
          alerte_id: string;
          fournisseur_id: string;
          disponible: boolean | null;
          quantite_disponible: number | null;
          repondu_le: string | null;
        };
        Insert: {
          id?: string;
          alerte_id: string;
          fournisseur_id: string;
          disponible?: boolean | null;
          quantite_disponible?: number | null;
          repondu_le?: string | null;
        };
        Update: {
          id?: string;
          alerte_id?: string;
          fournisseur_id?: string;
          disponible?: boolean | null;
          quantite_disponible?: number | null;
          repondu_le?: string | null;
        };
        Relationships: [];
      };
      demandes_retrait: {
        Row: {
          id: string;
          livreur_id: string;
          montant: number;
          statut: StatutRetrait;
          created_at: string;
          traitee_le: string | null;
        };
        Insert: {
          id?: string;
          livreur_id?: string;
          montant: number;
          statut?: StatutRetrait;
          created_at?: string;
          traitee_le?: string | null;
        };
        Update: {
          id?: string;
          livreur_id?: string;
          montant?: number;
          statut?: StatutRetrait;
          created_at?: string;
          traitee_le?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      v_solde_livreur: {
        Row: {
          livreur_id: string;
          commissions_dues: number;
          cash_en_main: number;
          net_a_remettre: number;
        };
        Relationships: [];
      };
      v_solde_fournisseur: {
        Row: {
          fournisseur_id: string;
          total_recu: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      fn_confirmer_livraison: {
        Args: { p_commande_id: string; p_code: string };
        Returns: boolean;
      };
      fn_valider_commande: {
        Args: { p_commande_id: string; p_acompte_montant: number; p_moyen: MoyenPaiement };
        Returns: void;
      };
      fn_envoyer_avance: {
        Args: {
          p_commande_id: string;
          p_fournisseur_id: string;
          p_montant: number;
          p_moyen: MoyenPaiement;
        };
        Returns: void;
      };
      fn_expedier_commande: {
        Args: {
          p_commande_id: string;
          p_agence: string;
          p_n_bordereau: string | null;
          p_ville_depart: string | null;
          p_ville_arrivee: string | null;
          p_date_arrivee_prevue: string | null;
          p_frais_transport: number | null;
          p_photo_bordereau: string | null;
        };
        Returns: void;
      };
      fn_receptionner_commande: {
        Args: { p_commande_id: string };
        Returns: void;
      };
      fn_valider_livraison: {
        Args: {
          p_commande_id: string;
          p_livreur_id: string;
          p_solde_montant: number;
          p_commission_montant: number;
        };
        Returns: void;
      };
      fn_marquer_retrait_paye: {
        Args: { p_demande_id: string };
        Returns: void;
      };
      fn_envoyer_avance_groupee: {
        Args: {
          p_fournisseur_id: string;
          p_moyen: MoyenPaiement;
          p_lignes: { commande_id: string; montant: number }[];
        };
        Returns: string;
      };
      fn_assigner_livreur_groupe: {
        Args: { p_livreur_id: string; p_commande_ids: string[] };
        Returns: string;
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
