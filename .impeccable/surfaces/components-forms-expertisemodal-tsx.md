---
version: 1
slug: "components-forms-expertisemodal-tsx"
primary_target: "components/forms/ExpertiseModal.tsx"
related_targets: ["components/forms/ExpertiseRenderer.tsx","components/forms/PhotoTray.tsx","components/forms/ObjectBoard.tsx","components/forms/BatchImageDropzone.tsx"]
---

# Formulaires publics et Expertise

Mode : Operate. Extension du monde Projection existant ; validation directement dans l’interface locale, sans nouvelle direction graphique.

## Direction contract

THESIS: Organiser des photographies en objets avant de demander leurs descriptions ; aucun fichier n’est renvoyé lorsqu’il change de groupe.

OWN-WORLD: Projection, fond clair teinté, texte sombre, accent vert du thème du client. MUI, contours fins et angles droits reprennent les formulaires existants.

STORY: Déposer, attribuer, décrire chaque objet, renseigner une seule fois ses coordonnées, vérifier, envoyer. La fermeture conserve la demande dans l’onglet.

FIRST VIEWPORT: Entrée par une zone de dépôt généreuse. La modale présente photos à gauche et objets à droite ; sous 600px, deux onglets Photos/Objets présentent un panneau à la fois. Titre et fermeture restent en haut, navigation en bas ; seul le contenu central défile.

FORM: Extension assignée du système Projection/MUI existant, sans nouveau tirage de monde. Photos et informations sont le contenu ; contrôles standard et actions clavier doublent le glisser-déposer.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Sortie : fermeture/reprise et rafraîchissement conservés, affectations uniques, erreurs ciblées et confirmation explicite des photos exclues. Les captures de recette sont synthétiques ; aucun nouveau raster public n’est livré.

## Grammaire réalisée — 6 novembre 2026

Le dossier est la signature locale de l’organisation : onglet portant le nombre de photos, fond dans le rôle `mutedSurface`, vues superposées, puis grille de sélection à l’ouverture. La photo principale reste au premier plan. Les angles légèrement arrondis de l’onglet et les ombres des photographies expriment ce dossier ; ils ne redéfinissent ni les cartes publiques ni les boutons du système Projection. Les actions restent rectangulaires et utilisent les couleurs et familles configurées par le thème.

Les photographies gardent leur identité de mouvement `photo-*` entre le bac, le dossier fermé et sa grille ouverte. GSAP Flip accompagne les affectations, créations, réordonnancements, changements de vue principale et suppressions (420ms, `power3.inOut`) ; l’ouverture du dossier capture uniquement les photos. Le survol déploie légèrement la pile sur les appareils capables de survol. Cette réponse reste locale au dossier.

Les étapes se chevauchent : une copie visuelle de la vue sortante reste présente pendant l’arrivée de la suivante, sans étape vide. Cette copie est inerte, masquée aux technologies d’assistance, sans identifiants ni noms de champs dupliqués. Sortie en 260ms, arrivée en 400ms (`power3.out`), avec sens avant/arrière ; une nouvelle action termine l’animation précédente avant de reprendre. Le titre de la nouvelle étape reçoit le focus si aucun de ses contrôles ne l’a déjà reçu. La modale entre en 480ms et sort en 200ms. En mouvement réduit, aucun Flip ni copie de sortie, aucun déplacement de panneau ; la courte variation d’opacité conserve le contenu accessible.

Les quatre étapes sont Photos, Objets, Coordonnées, Récapitulatif ; les deux derniers libellés deviennent Contact et Résumé sur mobile. Les libellés et les actions se redistribuent par unités entières, y compris à 320px et lors du doublement du texte. Le pied accepte plusieurs lignes ; « Continuer » et sa flèche ne sont pas cassés en lettres isolées. Sous 600px la modale occupe `100dvh` et respecte les zones sûres ; les aperçus sont réduits. Sous 500px de hauteur en paysage, chrome et aperçu se compactent sans supprimer les champs.

## Contraintes à conserver

- `hideTitle` peut masquer le seul titre visible de l’entrée Expertise, par placement `form` ou `formImage` dans une page ou un bloc éditorial ; absent ou faux, le titre reste affiché. Introduction, dépôt, nom accessible et reçu sont conservés. Le titre de la modale reste toujours visible ; voir le [brief du hero et des titres](sections-heromedia-tsx.md).
- Le glisser-déposer est doublé par sélection, création depuis la sélection et menu Déplacer la sélection. Les onglets mobiles acceptent flèches, Home et End et conservent leur focus clavier.
- Ouvrir/refermer un dossier, choisir la vue principale, décrire, réordonner et supprimer restent des commandes explicites. La suppression d’un objet est confirmée et rend ses photos au bac ; elle ne supprime pas leurs fichiers.
- Les mutations de groupe et les animations ne renvoient pas les fichiers. Le contrôleur de session conserve données et affectations ; le magasin d’upload reste au-dessus des vues démontables et partage les aperçus privés déjà chargés. Aucun fichier n’entre dans le JSON persisté.
- Chaque objet doit posséder une photo ; seule sa désignation est obligatoire dans sa description. Les coordonnées sont communes. Le récapitulatif permet la correction et exige confirmation avant d’exclure les photos non attribuées. L’envoi reste une demande unique.
- La fermeture et le rafraîchissement conservent la demande dans l’onglet. Une expiration conserve textes et objets mais demande de nouvelles photos ; elle ne promet pas de conservation illimitée des aperçus privés.

## Vérification et portée

Le rapport [documentation-check.md](../review/expertise-design/documentation-check.md) relie les sources, les 13 captures de recette et les preuves exécutées. Le [verdict final](../review/expertise-design/finish-review.md) porte `disposition: ship` pour la correction typographique revue. Le contrôle documentaire conserve `DESIGN.md` et `.impeccable/design.json` : extension étroite du monde existant, sans nouvelle autorité graphique. Aucun déploiement en production n’est attesté par cette documentation.
