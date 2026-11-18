# Catalogue et demandes d’informations

## Masonry

Les images du catalogue masonry ont un ratio largeur/hauteur de 4/5. Sur desktop, les colonnes sont séparées de 8 px et les lignes de 10 px : cette proportion maintient exactement le ratio des cartes occupant deux colonnes et deux lignes. L’ordre source reste conservé, sans remplissage dense.

Sous 951 px, les grands formats reprennent une cellule normale. Jusqu’à 767 px, les colonnes sont séparées de 8 px et les bords du catalogue passent à 8 px. Le titre est à 8 px de son image, l’artiste à 4 px du titre, et les œuvres sont séparées verticalement de 24 px. Le catalogue classique et les sélections de page conservent leur géométrie propre. `masonryImageSizes` reflète ces dimensions et le recadrage portrait dans les tailles d’images responsives.

## Défilement continu et apparition

Le catalogue numéroté reste rendu côté serveur avec ses liens de pagination, utilisables sans JavaScript et en accès direct. Après hydratation, les pages suivantes sont ajoutées à la même liste via `/api/artwork-catalog`, sans navigation ni remplacement des cartes existantes. Le chargement commence 1600 px avant la fin ; une seule page peut être en vol. Les premières images du nouveau lot sont prioritaires, les autres conservent le chargement natif différé. Les images continuent d’utiliser leurs URL directes et leurs tailles responsives.

Recherche, types, langue, taille de page et révision sont conservés. Une nouvelle recherche réinitialise la liste ; une révision différente ou des doublons ne sont jamais fusionnés avec les œuvres affichées. Une panne conserve la liste et propose une reprise explicite, sans boucle automatique ; une limitation respecte `Retry-After`. Les requêtes sont annulées en quittant le catalogue. Le chargement automatique est suspendu lorsque l’onglet ou le fond d’une modale est inactif. Le mode de prévisualisation éditoriale conserve sa pagination existante.

GSAP révèle chaque carte une seule fois, avec un fondu d’opacité de zéro à un. Sur desktop, les éléments d’une même rangée arrivent de gauche à droite avec un décalage de 120 ms, une montée depuis le bas de 24 px, sans déplacement latéral et une pose de 550 ms. Sur mobile, l’apparition est plus légère et sans décalage latéral. L’ajout d’une page n’interrompt pas les animations en cours. Les cartes restent visibles en l’absence de JavaScript et la réduction des mouvements désactive ces effets.

La nouvelle route frontend réutilise le contrat public existant de l’API. Elle valide les paramètres et les réponses et ne relaie ni cookie ni identifiant privé. Aucune migration ni livraison simultanée du backend n’est nécessaire.

## Demandes liées à une œuvre

Le contexte public de l’œuvre, vérifié par la page Contact, fournit le titre et l’artiste au formulaire. Une nouvelle demande reçoit un sujet et un message éditables, en français ou en anglais. Un brouillon existant, y compris un champ volontairement vidé, reste prioritaire. Les formulaires inconnus ou les champs ambigus ne reçoivent pas de valeur devinée : les rôles de nom/sujet/message sont reconnus par leurs libellés français/anglais explicites, et l’e-mail utilise la référence de contact du formulaire.

Après confirmation d’une demande Contact, le prénom, le nom ou nom complet et l’e-mail sont recopiés dans un profil `sessionStorage` limité à l’origine et à l’onglet. Ce profil de réutilisation ne contient ni message ni preuve d’envoi. Les brouillons et reçus conservent leur stockage de session existant et leurs règles d’idempotence. Le refus du stockage facultatif du profil ne transforme pas un envoi réussi en erreur. Le contrôleur Contact historique utilise les mêmes textes et le même profil.

## Titres et compatibilité

Le titre du catalogue utilise déjà la contribution `page.artworks.title`, y compris en français. L’admin ouvre désormais la langue de référence par défaut et propose, depuis les réglages de la page Œuvres, des accès directs au titre et au libellé du menu. Aucune contribution éditoriale n’est modifiée automatiquement.

Ces changements frontend et admin fonctionnent avec l’API existante. Aucune migration, nouvelle clé de formulaire ou nouvelle propriété envoyée à l’API n’est nécessaire.

## Recette

Resserrement et défilement continu du 18 novembre : dix contrôles unitaires (projection publique, requêtes et tailles responsives), quatorze scénarios Chromium/WebKit (dont cascade mesurée pendant l’ajout d’un lot, préchargement, reprise, changement de recherche, réduction des mouvements et espacements mobiles), lint ciblé et build frontend validés. Les médias utilisés sont locaux.

20 tests unitaires concernés, quatre scénarios de grille Chromium/WebKit avec mesures aux seuils 390, 767, 768, 950, 951 et 1440 px, et deux parcours du vrai fournisseur de session de formulaire avec API synthétique ont réussi. Les builds frontend et admin ont été vérifiés. Les captures utilisent les médias de démonstration du Storybook local, sans transformation d’images du site public ni envoi réel de demande.

Le banc de test du fournisseur de session se lance avec `node node_modules/vite/bin/vite.js --config tests/fixtures/forms-inquiry/vite.config.ts`, puis `E2E_FORMS_INQUIRY_ORIGIN=http://127.0.0.1:6011 pnpm test:e2e tests/forms-inquiry-prefill.spec.ts`. Il n’est inclus dans aucune route déployée.
