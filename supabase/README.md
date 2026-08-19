# Supabase — mise en place

## 1. Créer le projet

1. Sur [supabase.com](https://supabase.com), crée un nouveau projet (région proche du Cameroun si possible, ex. Europe).
2. Dans **Project Settings → API**, copie l'**URL** et la clé **anon public**.
3. Colle-les dans un fichier `.env.local` à la racine du projet (copie `.env.example`) :
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

## 2. Créer le schéma

Dans le dashboard Supabase → **SQL Editor → New query** :

1. Colle le contenu de [`schema.sql`](./schema.sql), Run.
2. Colle le contenu de [`policies.sql`](./policies.sql), Run.

(Deux fichiers séparés exprès : le premier crée les tables, le second la sécurité — plus simple à relire.)

## 3. Créer ton compte super-admin (bootstrap)

La sécurité (RLS) empêche n'importe qui de s'auto-créer un rôle — logique,
mais ça veut dire que le tout premier compte doit être créé "à la main" :

1. **Authentication → Users → Add user**, crée ton compte avec ton email.
2. Copie son `id` (uuid).
3. Dans le **SQL Editor** :
   ```sql
   insert into users (id, nom, role, ville, actif)
   values ('<uuid-copié>', 'Ton nom', 'super_admin', 'Douala', true);
   ```

Tous les comptes suivants (gestionnaire, fournisseurs, livreurs) pourront
être créés depuis l'app une fois connecté en super-admin, puisque la policy
d'insertion sur `users` autorise `super_admin`.

## 4. Régénérer les types TypeScript

Une fois le schéma en place, remplace le fichier placeholder
`src/lib/supabase/types.ts` par les vrais types générés depuis ton projet :

```bash
npx supabase login
npx supabase gen types typescript --project-id <ton-project-id> > src/lib/supabase/types.ts
```

(`<ton-project-id>` est dans l'URL du dashboard ou dans Project Settings → General.)

## 5. Storage (photos)

Pas encore dans ce premier schéma. Quand on branchera l'upload (photo produit,
photo colis, photo bordereau), on créera des buckets Supabase Storage avec
leurs propres policies — même logique que les tables.

## Notes de conception

- **Aucun solde n'est stocké** (`v_solde_fournisseur`, `v_solde_livreur` dans
  `schema.sql`) : ils se recalculent depuis `transactions` à chaque lecture.
  Un peu plus lent qu'une colonne, mais ne peut jamais diverger.
- **Les montants sont des entiers** (FCFA n'a pas de sous-unité).
- **Le champ `ville` est du texte libre partout**, pas un enum : ouvrir une
  3e ville = ajouter une ligne à `reglages.villes_actives`, aucune migration.
- **Les garde-fous métier vivent dans des triggers SQL**, pas dans le
  frontend : même si un bug côté React tente d'envoyer une avance sans
  acompte encaissé, la base de données refuse. C'est le sens de "pas de
  backend à écrire" — Postgres *est* le backend ici.
