# Passage du site Lucas Ratton en production

## Bascule du 15 novembre 2026

Les DNS ont été modifiés par le propriétaire du domaine et restent chez le fournisseur tiers. L’alias `www.lucasratton.com` a été ajouté au projet frontend existant. L’origine canonique choisie est `https://www.lucasratton.com` dans le frontend, l’API et l’admin. Le frontend utilise `DEPLOYMENT_ENV=production` et `DATA_MODE=real` ; les environnements d’identité API/worker sont conservés. Les paramètres prennent effet avec les déploiements Git automatiques de `main`.

Les anciennes origines exactes de l’apex et de la preview restent admises temporairement par le frontend pour les onglets déjà ouverts. L’apex est redirigé vers `www` et l’ancienne preview vers le site public, en attendant la recréation d’une preview isolée.

## Préparé dans le code

- `lib/seo/legacy-redirects.json` reprend les anciennes adresses de pages du sitemap Squarespace relevé le 15 novembre 2026. Les 83 pages ont une destination : 81 redirections permanentes (301), `/contact` conservé et `/legal` recréé. Les 48 adresses d’œuvres et catégories retirées rejoignent `/artworks`. Les 27 anciennes expositions ont leur correspondance exacte avec une exposition publiée. Les anciennes listes `/actualit`, `/actualit-1` et `/exposition-en-cours` rejoignent `/exhibitions`.
- Les destinations sont relatives : aucun domaine de déploiement n’est figé dans les règles de redirection.
- Le sitemap parcourt toutes les pages du catalogue public d’œuvres et des trois catalogues éditoriaux, dans chaque langue publique. Les révisions de pagination sont conservées ; une erreur n’est pas transformée en sitemap partiel réussi. Les images ne sont pas téléchargées par cette génération.
- Les pages d’accueil et listes disposent de descriptions de repli, de canoniques et d’alternatives linguistiques. Les descriptions du CMS restent prioritaires. Les adresses absolues proviennent de `SITE_ORIGIN`.
- `/legal` et `/en/legal` sont accessibles depuis le footer. Les coordonnées de la galerie proviennent de l’ancien site. L’hébergement Squarespace est remplacé par Vercel, Render et Supabase.
- L’adresse et les horaires du footer sont des contenus multilingues éditables dans l’admin, publiés séparément du code.

## Point légal à confirmer

La fiche d’entreprise fournie par le propriétaire du site indique GALERIE LUCAS RATTON, EURL au capital de 1 000 €, SIREN/RCS Paris 538 767 658, 11 rue Bonaparte, 75006 Paris. Elle indique également une radiation au 14 janvier 2026. La page rend cette situation explicite et ne désigne pas arbitrairement une autre société comme éditeur.

Avant l’ouverture publique, confirmer l’entité éditrice actuelle, le directeur de publication et compléter les informations de traitement des demandes (responsable, bases légales, durées de conservation et prestataires effectifs) avec la galerie. Le nom d’un gérant relevé dans un registre ne vaut pas confirmation du directeur de publication du site.

Source fournie : https://www.pappers.fr/entreprise/galerie-lucas-ratton-538767658

## À effectuer au dernier moment

1. Garder les DNS chez leur fournisseur actuel. Les domaines ont été ajoutés au projet Vercel existant ; préparer les valeurs indiquées par Vercel sans changer de serveurs de noms. Préserver les enregistrements mail.
2. Conserver, sauf décision contraire, l’origine historique `https://www.lucasratton.com`. Rediriger l’apex vers `www` sur Vercel en préservant chemin et paramètres. Vérifier les certificats des deux domaines.
3. Mettre `SITE_ORIGIN` à cette origine dans le frontend, l’API Render et l’admin. Configurer explicitement les origines transitoires nécessaires via `SITE_ALLOWED_ORIGINS_JSON` ; ne pas retirer la protection des formulaires. `BACKEND_URL`, le domaine API, le domaine admin et le callback SSO restent les mêmes.
4. Passer **le frontend** à `DEPLOYMENT_ENV=production` avec `DATA_MODE=real`. Cela retire le `X-Robots-Tag` global de test et ouvre `robots.txt`. Ne pas changer automatiquement l’environnement API/worker : il participe aussi à l’identité des connexions MCP et des données.
5. Déclencher le déploiement par la mise à jour de `main`, après la configuration des variables. Ne pas promouvoir un ancien build contenant les valeurs de preview.
6. Basculer les enregistrements DNS web vers les valeurs fournies par Vercel, puis réaliser la recette sur le vrai domaine.

## Recette après la bascule

- Accueil, listes, œuvre et article immersif : 200, navigation et fermeture fonctionnelles, header conservé.
- Vérifier les 301 historiques, l’apex vers `www`, les canoniques/hreflang sur le domaine final, le sitemap et la page légale.
- `robots.txt` autorise les pages publiques ; aucune réponse publique normale n’a de `noindex`. Les routes privées `/preview/*` et les erreurs restent exclues de l’indexation.
- Vérifier les formulaires, pièces jointes et notifications avec un envoi de recette explicitement convenu. Contrôler que les autres origines restent refusées.
- Vérifier la diffusion CDN des médias avec un petit échantillon. Éviter un parcours automatique qui téléchargerait toute la médiathèque ou produirait de nouvelles transformations Supabase.
- Confirmer le réglage de facturation Supabase, puis soumettre le sitemap dans Search Console.
- Recréer une preview isolée après la mise en service, avec sa propre origine et l’indexation interdite.

La préparation n’effectue ni bascule DNS, ni changement des origines, ni ouverture de l’indexation.
