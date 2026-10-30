# Frontend Artlogic

Boilerplate public Next.js 16.4 / React 19.3, TypeScript, MUI9, CSS Modules, Storybook10 et Webpack. Il affiche uniquement les œuvres disponibles publiées depuis le web-admin, avec les images copiées localement. Aucune connexion visiteur n’est requise.

## Installation

`nvm install && nvm use`, puis `pnpm install --frozen-lockfile`. Ce dépôt utilise Node 24.22.0 et pnpm 12.14.0 ; conserver pnpm pour les installations et le lockfile. Cloner le backend à côté sous `../backend` pour les mocks, les contrats et les tests d’intégration. Voir les [trois dépôts](../backend/README.md).

## Démarrer

Suivre le [quickstart](../backend/specs/001-artlogic-site-boilerplate/quickstart.md). `backend setup:local` génère `.env.local`. Puis `pnpm dev --port 3000`, ou `pnpm build` et `pnpm start --port 3000`. Aucun Tailwind ni Turbopack.

Les variables serveur sont SITE_ID, SITE_NAME, SITE_DESCRIPTION, SITE_ORIGIN, SITE_LOCALES_JSON, SITE_DEFAULT_LOCALE, SITE_PROFILE, PREVIEW_SERVICE_KEY, ADMIN_ORIGIN, BACKEND_URL, REQUEST_TIMEOUT_MS et les modes d’exécution (scope F). La clé PREVIEW_SERVICE_KEY est serveur uniquement et n’autorise que les opérations d’aperçu ; elle est distincte de la clé BFF de l’admin. Aucun credential Supabase/Artlogic/SSO, ni variable `NEXT_PUBLIC_`. Le build n’a besoin d’aucun service ; la configuration de galerie est lue au runtime et peut changer sans rebuild.

## Développer un site

Les huit compositions passent par `PublicPage` dans `lib/presentation/load-page.tsx` et `page-composer/PageRenderer.tsx`. Les neuf vues de `sections/` réutilisent les primitives `components/ui/`, puis les composants métier `components/Artwork*`. La fiche reste à UUID stable ; les sections, textes traduits, médias et rôles de thème proviennent du backend. Les routes du boilerplate restent fermées ; les sections ajoutées dans l’admin ne créent pas de routes libres.

`lib/api/` utilise seulement les routes publiques typées, avec no-store et timeout. Le relais `app/media/[mediaId]/route.ts` transmet le média courant après vérification backend ; Next Image est unoptimized. `proxy.ts` contrôle la visibilité avant le streaming pour conserver un vrai 404. Les pages et métadonnées relisent aussi l’état courant.

Conserver Suspense/connection avec cacheComponents. Pas de `use cache`, ISR, stale-on-error ou copie de catalogue en navigateur. Les liens d’œuvre `FreshLink` désactivent le prefetch et effectuent une navigation document ; les restaurations bfcache rechargent. Ces choix garantissent une nouvelle lecture après masquage. Le navigateur peut toujours posséder une copie déjà téléchargée.

Les états vide, chargement, erreur réessayable, 404 uniforme, image absente et texte manquant sont inclus. Le texte Artlogic reste échappé ; ne pas l’injecter avec dangerouslySetInnerHTML. Préserver titres/alt, focus visible, lien d’évitement et responsive 375/1440 px.

Vérification : `pnpm typecheck`, `pnpm lint`, `pnpm build`. Après build backend et frontend, `pnpm --dir backend test:public:browser` depuis la racine provisionne une destination isolée et exerce publication/masquage/retrait ainsi que les pannes amont/backend. `pnpm test:e2e` seul attend le harness. Résultats dans [validation.md](../backend/specs/001-artlogic-site-boilerplate/validation.md).

## Navigation et langues

Le header place le nom/logo à gauche et six liens + les langues à droite. Rubriques : news, artworks, exhibitions, publications, expertise, contact. Les cinq pages hors catalogue sont des écrans de base traduits à enrichir ; aucun formulaire d’expertise/contact ni CMS métier n’est simulé. La direction Projection associe un hero immersif à une invitation compacte et des pages sobres, personnalisables via les rôles MUI/CSS.

La référence est sans préfixe (`/news`) ; les autres langues utilisent leur code (`/en/news`). Un préfixe explicite de référence redirige en 308 avec sa query. Le sélecteur conserve la destination, l’œuvre, le curseur valide et l’ancre ; le backend invalide un curseur obsolète et la liste explique son redémarrage. Aucune préférence de navigateur/cookie ne remplace la langue de l’URL. Une seule langue masque le sélecteur.

`lib/i18n/load-site-content.ts` lit l’édition courante sous connection et ne déduplique que pendant la requête. En panne/mismatch, chaque clé utilise le seed embarqué disponible (langue → référence → FR) et le logo est absent. Les textes Artlogic restent inchangés et les œuvres gardent leurs propres contrôles d’accès. `app/global-not-found.tsx` utilise le routeur global Next (`globalNotFound`, `instant=false`) pour conserver le vrai 404 avant streaming avec html lang et header runtime ; les requêtes RSC inconnues sont arrêtées par le proxy.

Le logo courant est relayé via `/site-logos/{id}`, sans optimisation ni cache ; l’image défaillante laisse le nom du site visible. Modifier les traductions/logo dans le web-admin. Pour ajouter une clé, modifier le registre backend et générer les contrats/messages, avec un seed explicite pour la référence du site (notamment `initial.de` après promotion de de), puis reconstruire. Voir [recette 002](../backend/specs/002-header-navigation-i18n/quickstart.md) et [preuves](../backend/specs/002-header-navigation-i18n/validation.md).

### Profils clients, un seul dépôt

`SITE_PROFILE=default` utilise les composants génériques. `SITE_PROFILE=demo-gallery` démontre une carte d’œuvre différente et une identité éditoriale. Les deux profils sont inclus dans le même build ; les valeurs du thème et les pages restent modifiables dans l’admin sans reconstruction. Aucun profil n’embarque d’œuvre ou d’information commerciale réelle.

La résolution est MUI → primitives et sections génériques → slots typés de `clients/registry.ts`. Le slot `ArtworkCard` reçoit seulement `ArtworkCardProps`, après filtrage public côté backend. Un remplacement emploie les rôles CSS/MUI, les messages et les liens localisés existants ; il ne charge pas de données, ne vérifie pas de session et ne décide pas de la visibilité. Une variante existante suffit pour une composition déjà couverte ; un remplacement de slot sert à une présentation propre au client. Un nouveau comportement, type ou variante exige une évolution versionnée du code et du contrat, puis un rebuild coordonné.

Pour ajouter un profil : créer `clients/<id>/manifest.ts`, enregistrer les remplacements statiques, ajouter le manifeste à l’exporteur, puis lancer `pnpm presentation:manifest` et `pnpm presentation:check`. Exporter les artefacts vers le dépôt backend avec `pnpm presentation:manifest --output=../backend/config/presentation`. Le frontend installé et le manifeste backend doivent provenir de la même révision ; une ancienne empreinte est refusée explicitement. Les tests unitaires vérifient le contrat des composants et les neuf renderers. Les imports entre dépôts sont limités aux commandes de développement ; chaque application se compile et s’exécute seule.

### Catalogue Storybook autonome

Avec Node24/pnpm, `pnpm storybook` ouvre le serveur de développement sur `http://localhost:6006`. `pnpm build-storybook` produit `storybook-static/`, puis `pnpm test:storybook` le sert sur un port libre, exécute Playwright et arrête le serveur. Aucun `.env`, backend, Artlogic ou SSO n’est nécessaire. Les binaires synthétiques et polices sont inclus dans ce dépôt.

Les toolbars choisissent Projection/Éditorial, profil générique/demo-gallery, français/anglais et largeur375/1440. Les neuf sections et leurs variantes, header, carte d’œuvre, palette et primitives MUI utilisent les vues de production et les mêmes providers. Les exemples couvrent textes longs, contenu absent, erreur média et lecture/pause ; la préférence système de mouvement réduit reste respectée. Les données illustratives ne représentent aucune galerie réelle.

`pnpm test:unit` inclut la couverture du registre ; le runner navigateur principal exclut `tests/storybook`, réservé à `playwright.storybook.config.ts`. Les contrôles Storybook ne remplacent pas les recettes Next, les autorisations ou la validation serveur. Configuration fondée sur [Next.js avec Vite](https://storybook.js.org/docs/get-started/frameworks/nextjs-vite) et les [globals/toolbars](https://storybook.js.org/docs/essentials/toolbars-and-globals), sans rendu serveur expérimental. Les avertissements Vite sur `use client` concernent ce catalogue purement navigateur ; les limites des bundles de documentation ne sont pas celles du site public.


### Brouillon et aperçu privé

L’admin enregistre le thème et les compositions sans toucher au site publié. Une publication active un instantané cohérent ; toute nouvelle consultation le relit sans reconstruire le frontend. Les textes globaux de navigation et le logo002 conservent leur effet immédiat.

Le bouton Prévisualiser ouvre un nouvel onglet du vrai frontend par POST, sans code en URL. Une session HttpOnly spécifique au site et un CSRF distinct protègent le canvas, ses médias et sa fermeture. Les droits du parent sont revérifiés ; un lien copié ne donne aucun accès. Ne pas appliquer de cache CDN, ISR ou optimisation d’image aux routes `/preview`, `/presentation-assets` et aux données d’œuvres. Les polices intégrées statiques restent cacheables ; les fichiers administrés passent par le relais autorisé.

Appliquer les migrations011/012 et provisionner le profil avant de démarrer les nouveaux builds. Pour les commandes, les limites média/police et les preuves locales : [quickstart003](../backend/specs/003-configurable-frontend-template/quickstart.md) et [validation003](../backend/specs/003-configurable-frontend-template/validation.md). Les fichiers de démonstration ne remplacent pas les médias d’une galerie.


## Contact et notifications (004)

Le formulaire public général fonctionne sans catalogue ni release de présentation. Une demande liée à une œuvre n’est acceptée que si celle-ci est encore disponible et publiée au commit. Les messages sont privés ; la consultation et les relances passent par les droits SSO courants du web-admin.

Contact désactivé par défaut. `CONTACT_SERVICE_KEY` doit être identique sur API/frontend, distinct des clés BFF, preview et ingress, et reste obligatoire pour retrouver les reçus après désactivation. L’API requiert aussi `CONTACT_NETWORK_HMAC_KEY` (base64,32octets). Aucun de ces secrets n’utilise de préfixe NEXT_PUBLIC_. Garder la clé/version précédente dans `CONTACT_NETWORK_HMAC_PREVIOUS_KEYS_JSON` au moins jusqu’à extinction des fenêtres de quotas ; conserver les anciennes clés AES-GCM tant que des demandes les utilisent.

Pour activer : `CONTACT_ENABLED=true` sur API/worker/frontend ; `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, `CONTACT_SMTP_HOST`, `CONTACT_SMTP_PORT`, `CONTACT_SMTP_TLS_MODE` sur API/worker, et `CONTACT_PRIVACY_URL` sur API. Une seule adresse destinataire, From configuré et Reply-To visiteur validé. En réel, port465/implicit ou587/starttls, certificat CA vérifié, authentification SMTP requise. En mock : SMTP loopback/plain, adresses .test uniquement. Les mots de passe restent dans les fichiers privés ou le gestionnaire de secrets du déploiement.

En réel, le frontal de confiance doit **écraser** un en-tête IP dédié configuré par `CONTACT_TRUSTED_INGRESS_HEADER` et `X-Contact-Ingress-Key`, avec la valeur de `CONTACT_INGRESS_KEY`. Il retire les valeurs envoyées par le visiteur ; le serveur Next vérifie cette clé avant d’utiliser l’IP canonique. Pas de fallback vers X-Forwarded-For ou X-Real-IP. Cette chaîne reste obligatoire quand le contact est désactivé, car le reçu reste récupérable. Les trois relais sont fixes : `/api/contact/config`, `/api/contact/inquiries`, `/api/contact/receipt` ; aucun proxy libre et preuve uniquement dans le corps POST.

Admission : champs nom120, e-mail254, sujet160, message5000 points de code ; corps JSON98304octets. Une preuve aléatoire de32octets retrouve la même référence pendant24h, même après retrait de l’œuvre ou désactivation ; le réemploi avec un contenu différent est refusé. Le navigateur ne persiste que preuve/expiration/référence en sessionStorage. Un reçu confirme l’enregistrement durable, pas la livraison d’un e-mail.

Quotas par défaut :5acceptations/900s par visiteur et100/3600s par site, atomiques ; transport distinct600/site/min et60/visiteur/min cumulé entre endpoints. Les IP brutes ne sont pas conservées : aliases HMAC seulement. Les erreurs et jobs contiennent des codes/IDs, jamais le texte du message, la preuve ou la réponse SMTP brute.

Les notifications sont asynchrones :3tentatives initiales maximum, délais60/300s sur24h. Seuls les refus temporaires certains sont réessayés. Après DATA sans acceptation finale, crash armé ou échec SQL après SMTP, l’état devient **incertain**, sans renvoi automatique. Le worker fige timeout SMTP et marge de lease à l’armement (10s+30s par défaut), puis fence chaque finalisation. Le web-admin demande une confirmation explicite pour une tentative manuelle ; en état incertain, un doublon reste possible. Un SMTP déjà engagé ne peut pas être rappelé.

Conservation capturée à réception :90jours par défaut (`CONTACT_RETENTION_DAYS`,1..365), sans prolongation par lecture/relance/config. Le worker réconcilie et purge toutes les30s, y compris lorsque le nouveau contact est désactivé ; demandes/preuves/tentatives/intentions expirées sont supprimées par cascade, jobs annulés et budgets périmés nettoyés. Pour tenir le délai de purge≤24h, maintenir un worker et surveiller sa disponibilité. Les anciennes preuves expirées restent des tombstones jusqu’à purge de leur demande.

Mise à niveau coordonnée : générer contrats/config/messages, appliquer `pnpm db:migrate` et `pnpm jobs:migrate` avec le rôle migration, puis `pnpm site:provision` pour les nouvelles clés de traduction ; déployer API/worker/admin/frontend ensemble. Le provisionnement préserve les contributions existantes et les valeurs NULL secondaires. Le démarrage ne crée aucune table. Aucune base pilote ni boîte réelle n’est modifiée par les harnesses.

Recette autonome depuis backend : `pnpm test:contact:delivery`, `pnpm test:contact:browser`, `pnpm test:contact:browser --admin`, `pnpm test:contact:performance`. Ces outils créent des destinations temporaires sur le Supabase de test55321/55322 et un SMTP synthétique loopback avec capture privée en mémoire. `--serve` garde les interfaces de recette ouvertes jusqu’à Ctrl-C ; aucun contenu client réel, aucune sortie SMTP réelle. Si le CLI tsx ne peut pas créer son socket IPC dans une sandbox, utiliser `node --import tsx scripts/test-contact-<delivery|browser|performance>.ts`.

Les aperçus authentifiés et Storybook sont explicitement **inert** ; le public mock utilise **captured** et le public réel **live**. Le slot client ContactForm remplace la vue typée seulement : preuves, I/O et autorisation restent dans le contrôleur commun. Couleurs et polices suivent les thèmes existants.

## Galerie, modale et spécialisation (005)

`/artworks` propose recherche globale et pagination numérotée partageables. Les anciens liens `?cursor=…` restent utilisables seuls. Les liens internes d’œuvre, y compris les ancres d’un composant client, ouvrent la même fiche plein écran et son slug canonique. Un clic modifié conserve le nouvel onglet natif. Fermeture/Échap restaurent l’origine réelle (query, hash, scroll, focus) ; après accès direct/reload, la fermeture rejoint la liste dans la langue active. Aucune URL `returnTo` ne fournit d’autorité.

Le contrôleur conserve les origines atteignables dans la mémoire du document ; seuls32états visuels auxiliaires sont conservés. Forward/Activity/retour de visibilité revalident sans cache avant de révéler la fiche. Le document direct indisponible est une vraie404. Le transport Flight fournit un arbre d’erreur200 pour conserver la navigation interne ; le relais JSON retourne404/503 réels. Le bouton Réessayer de la route utilise `retry` de Next16, qui relit le serveur.

La composition C utilise une entrée de 480 ms commune. Sur grand écran, un geste déclenche une séquence complète de 600 ms : les deux bords de l’image se resserrent vers la moitié droite, puis les gestes suivants changent de vue. On ne peut pas laisser la transition à mi-course. La capture de molette reste opérationnelle sous un pointeur immobile. `wheel-gestures` 2.3.0 distingue geste et inertie : finir une animation ne réarme pas la queue du geste précédent et un nouveau geste peut interrompre cette inertie. Les longs textes conservent un intervalle de défilement libre. Aucun rebond ni module inférieur flèches/compteur. Sur écran ≤767px, hauteur <640px ou mouvement réduit, la lecture reste native et empilée.

Le titre et l’artiste gardent les mêmes coordonnées et métriques entre l’arrivée et la lecture ; le fond frosté et l’introduction s’effacent autour d’eux. Les images ne sont pas des liens. Chaque vue chargée propose un bouton ×2/×1 ; le zoom se déplace à la souris, au toucher ou avec les flèches lorsque la zone d’image a le focus. Échap quitte d’abord le zoom. Le zoom est réinitialisé lors d’un changement de vue.

Les sélecteurs de langue chargent une projection publique via `GET /api/site-locale` puis mettent à jour les composants montés et l’URL sans navigation de document. Messages contribués, sections éditoriales et description d’œuvre sont validés et appliqués ensemble. La vidéo, la slide active, le zoom et le scroll restent en place. En cas d’échec, la langue courante reste affichée et la commande peut être retentée. Les visites normales, les retours et les changements de visibilité conservent leurs contrôles de fraîcheur.

Les vues `ArtworkCatalog`, `ArtworkCard`, `ArtworkExperience`, `ArtworkInformation`, `ArtworkProgress` se spécialisent par `clients/registry.ts`. Le contrôle de navigation, les lecteurs validés, les règles de visibilité et le contact restent communs. Couleurs/polices viennent du thème publié. Exemple : `clients/demo-gallery/ArtworkExperience.tsx`. Les sections supplémentaires restent rendues après la scène métier.

Les descriptions sont publiées avec le thème/pages. L’aperçu utilise le snapshot privé lié à l’œuvre/langue du grant ; sa fiche ne change ni d’UUID ni de langue depuis une URL. Contact et Storybook y sont inertes. Les exemples galerie Storybook couvrent arrivée/transition/lecture/fin, textes longs/absents, médias cassés, thèmes et mobile ; `build-storybook` prépare les médias locaux depuis leurs PNG avec provenance.

Pour la recette isolée : construire avec `E2E_GALLERY_BUILD=1 pnpm build` (sortie `.runtime/next-gallery-production`), puis lancer le harnais depuis backend. `E2E_GALLERY_CAPTURE=1` active les captures explicites. `pnpm build-storybook` puis `pnpm test:storybook` testent le catalogue hors ligne. Voir [les preuves005](../backend/specs/005-artwork-gallery-experience/validation-execution.md).

Les cartes de la liste utilisent `cover`, y compris dans le profil client de démonstration. La fermeture de la fiche est une croix seule, avec libellé accessible conservé. La proposition mobile immersive de la spécification006 reste en phase de maquettes.
