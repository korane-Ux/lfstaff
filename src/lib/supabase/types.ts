// Stub partiel écrit à la main (seulement `users`, pour l'écran de connexion).
// Régénérer les types complets une fois `supabase login` fait :
// npx supabase gen types typescript --project-id vhzhpsvpfosmfkgeegnl > src/lib/supabase/types.ts

export type AppRole = "super_admin" | "gestionnaire" | "fournisseur" | "livreur";

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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      app_role: AppRole;
    };
    CompositeTypes: Record<string, never>;
  };
};
