# LFstaff

PWA interne du staff **Le Foyer** — commandes, fonte, transit inter-villes et
livraison des marmites. Voir [design/lfstaff-systeme.md](design/lfstaff-systeme.md)
pour le fonctionnement métier complet.

## Démarrer

```bash
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

Avant de connecter Supabase : copie `.env.example` en `.env.local` et suis
[supabase/README.md](supabase/README.md) (création du projet, schéma, RLS,
premier compte super-admin).

## Structure

- `src/app/` — routes (App Router)
- `src/components/` — composants React
- `src/lib/supabase/` — clients Supabase (navigateur + serveur)
- `public/manifest.webmanifest`, `public/sw.js` — PWA (installation, mode hors-ligne minimal)
- `supabase/` — schéma SQL + politiques RLS
- `design/` — charte graphique de référence et spec métier

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Supabase · PWA
