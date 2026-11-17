<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Livraison et compatibilité

- Les déploiements frontend courants utilisent `staging` vers `lucasratton-preview-frontend` sur `preview.lucasratton.com`. `main` reste réservé au frontend public et à une mise en production explicitement demandée.
- Appliquer les [règles communes de mises à jour compatibles](../backend/docs/rolling-upgrades.md). Le frontend V1 doit continuer à fonctionner avec l’API V0 : négocier les capacités et prévoir un fallback explicite pour chaque module nouveau.
- L’absence d’une capacité nouvelle ne doit pas interrompre les pages, la navigation ou les parcours existants. Préserver les validations, autorisations et contrôles de paiement.
- Tester les contrats et fallbacks concernés avec des réponses de la version précédente avant de publier.
