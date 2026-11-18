# Catalogue et demandes d’informations

## Masonry

Les images du catalogue masonry ont un ratio largeur/hauteur de 4/5. Sur desktop, les colonnes sont séparées de 16 px et les lignes de 20 px : cette proportion maintient exactement le ratio des cartes occupant deux colonnes et deux lignes. L’ordre source reste conservé, sans remplissage dense.

Sous 951 px, les grands formats reprennent une cellule normale. Jusqu’à 767 px, les espaces passent à 8 px et les bords du catalogue à 12 px. Le catalogue classique et les sélections de page conservent leur géométrie propre. `masonryImageSizes` reflète ces dimensions et le recadrage portrait dans les tailles d’images responsives.

## Demandes liées à une œuvre

Le contexte public de l’œuvre, vérifié par la page Contact, fournit le titre et l’artiste au formulaire. Une nouvelle demande reçoit un sujet et un message éditables, en français ou en anglais. Un brouillon existant, y compris un champ volontairement vidé, reste prioritaire. Les formulaires inconnus ou les champs ambigus ne reçoivent pas de valeur devinée : les rôles de nom/sujet/message sont reconnus par leurs libellés français/anglais explicites, et l’e-mail utilise la référence de contact du formulaire.

Après confirmation d’une demande Contact, le prénom, le nom ou nom complet et l’e-mail sont recopiés dans un profil `sessionStorage` limité à l’origine et à l’onglet. Ce profil de réutilisation ne contient ni message ni preuve d’envoi. Les brouillons et reçus conservent leur stockage de session existant et leurs règles d’idempotence. Le refus du stockage facultatif du profil ne transforme pas un envoi réussi en erreur. Le contrôleur Contact historique utilise les mêmes textes et le même profil.

## Titres et compatibilité

Le titre du catalogue utilise déjà la contribution `page.artworks.title`, y compris en français. L’admin ouvre désormais la langue de référence par défaut et propose, depuis les réglages de la page Œuvres, des accès directs au titre et au libellé du menu. Aucune contribution éditoriale n’est modifiée automatiquement.

Ces changements frontend et admin fonctionnent avec l’API existante. Aucune migration, nouvelle clé de formulaire ou nouvelle propriété envoyée à l’API n’est nécessaire.

## Recette

20 tests unitaires concernés, quatre scénarios de grille Chromium/WebKit avec mesures aux seuils 390, 767, 768, 950, 951 et 1440 px, et deux parcours du vrai fournisseur de session de formulaire avec API synthétique ont réussi. Les builds frontend et admin ont été vérifiés. Les captures utilisent les médias de démonstration du Storybook local, sans transformation d’images du site public ni envoi réel de demande.

Le banc de test du fournisseur de session se lance avec `node node_modules/vite/bin/vite.js --config tests/fixtures/forms-inquiry/vite.config.ts`, puis `E2E_FORMS_INQUIRY_ORIGIN=http://127.0.0.1:6011 pnpm test:e2e tests/forms-inquiry-prefill.spec.ts`. Il n’est inclus dans aucune route déployée.
