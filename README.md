# Frontend Artlogic

Boilerplate public Next.js 16.4 / React 19.3, TypeScript, CSS standard/Modules et Webpack. Il affiche uniquement les œuvres disponibles publiées depuis le web-admin, avec les images copiées localement. Aucune connexion visiteur n’est requise.

## Installation

`nvm install && nvm use`, puis `pnpm install --frozen-lockfile`. Ce dépôt utilise Node 24.22.0 et pnpm 12.14.0 ; conserver pnpm pour les installations et le lockfile. Cloner le backend à côté sous `../backend` pour les mocks, les contrats et les tests d’intégration. Voir les [trois dépôts](../backend/README.md).

## Démarrer

Suivre le [quickstart](../backend/specs/001-artlogic-site-boilerplate/quickstart.md). `backend setup:local` génère `.env.local`. Puis `pnpm dev --port 3000`, ou `pnpm build` et `pnpm start --port 3000`. Aucun Tailwind ni Turbopack.

Les variables serveur sont SITE_ID, SITE_NAME, SITE_DESCRIPTION, SITE_ORIGIN, BACKEND_URL, REQUEST_TIMEOUT_MS et les modes d’exécution (scope F). Aucun credential backend privilégié/Supabase/Artlogic/SSO, ni variable `NEXT_PUBLIC_`. Le build n’a besoin d’aucun service ; la configuration de galerie est lue au runtime et peut changer sans rebuild.

## Développer un site

La liste est `app/page.tsx`, la fiche à UUID stable `app/artworks/[artworkId]/page.tsx`, les éléments réutilisables dans `components/Artwork*`, les styles globaux dans `app/globals.css`. Ajouter ici la présentation et les nouvelles pages ; ne pas introduire de règles propres à une galerie dans le backend.

`lib/api/` utilise seulement les routes publiques typées, avec no-store et timeout. Le relais `app/media/[mediaId]/route.ts` transmet le média courant après vérification backend ; Next Image est unoptimized. `proxy.ts` contrôle la visibilité avant le streaming pour conserver un vrai 404. Les pages et métadonnées relisent aussi l’état courant.

Conserver Suspense/connection avec cacheComponents. Pas de `use cache`, ISR, stale-on-error ou copie de catalogue en navigateur. Les liens d’œuvre `FreshLink` désactivent le prefetch et effectuent une navigation document ; les restaurations bfcache rechargent. Ces choix garantissent une nouvelle lecture après masquage. Le navigateur peut toujours posséder une copie déjà téléchargée.

Les états vide, chargement, erreur réessayable, 404 uniforme, image absente et texte manquant sont inclus. Le texte Artlogic reste échappé ; ne pas l’injecter avec dangerouslySetInnerHTML. Préserver titres/alt, focus visible, lien d’évitement et responsive 375/1440 px.

Vérification : `pnpm typecheck`, `pnpm lint`, `pnpm build`. Après build backend et frontend, `pnpm --dir backend test:public:browser` depuis la racine provisionne une destination isolée et exerce publication/masquage/retrait ainsi que les pannes amont/backend. `pnpm test:e2e` seul attend le harness. Résultats dans [validation.md](../backend/specs/001-artlogic-site-boilerplate/validation.md).
