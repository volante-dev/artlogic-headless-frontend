# Modale œuvre Lucas Ratton

Mode: Experience. Extension du système Projection existant, à partir de la spécification 037 approuvée ; aucune nouvelle identité visuelle.

## Direction contract

THESIS: La photo et l'identité de l'objet sont accessibles ensemble, sans scène de découverte préalable.

OWN-WORLD: Reprendre les polices, couleurs et géométries carrées du thème configuré. Surface claire de galerie, texte lisible, commandes fines et explicites ; les photos fournissent la matière.

STORY: Identifier l'objet, examiner ses vues sans interrompre la lecture, puis contacter la galerie et retrouver son parcours.

FIRST VIEWPORT: Plein écran. Sur desktop, photo dominante à gauche et informations à droite. Sur mobile, identité puis photo contenues dans le premier écran, informations/contact dans la continuité. Croix et langue du cadre commun conservées.

FORM: Composition fixée par le plan validé, extension locale sans tournoi de concepts. Image entière en contain, compteur compact, balayage horizontal limité à la photo et lecture verticale native.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Pas de nouveau raster livré ; fixtures photographiques existantes réservées à la recette locale. DESIGN.md reste le système de référence, sans réparation de sa dérive préexistante dans cette tâche.

## Documentation de l'extension, 24 novembre 2026

La variante réutilise les rôles CSS de Projection pour couleurs, familles et contrôles, sans nouvelle palette, police ou famille de rayons. La composition locale utilise 64/36 sur desktop ; sous 960 px de largeur ou 640 px de hauteur, elle empile identité, photo et informations dans une lecture native, avec contact accessible dans le cadre. Les images restent en `contain`. L'entrée d'opacité du premier contenu validé dure 240 ms et respecte le mouvement réduit ; ces choix restent propres à cette fiche.

Les cinq captures `ratton-desktop.png`, `ratton-mobile.png`, `ratton-mobile-360.png`, `ratton-landscape.png` et `ratton-zoom-200.png` ont été ouvertes pour la comparaison documentaire avec le système existant. La revue de finition indépendante transmise au documenter porte la disposition **ship**, sans correction matérielle. Détail des preuves et limites : `../backend/specs/037-ratton-artwork-modal/validation/design-review.md` depuis la racine frontend. `DESIGN.md` et `.impeccable/design.json` sont conservés sans modification ; la dérive du sidecar signalée avant cette tâche reste hors périmètre.

Recontrôle final après corrections d'intégration : les cinq captures courantes ont été rouvertes, avec composition stabilisée inchangée. La superposition de la notice et le loader sont ajustés uniquement lorsque le contenu Ratton est présent ; le zoom et la restauration du scroll restent dans la logique locale de visite. Aucun nouveau token ni système visuel. Le reviewer conserve **ship** au périmètre visuel initial, sans nouvelle certification globale. Empreintes des deux fichiers de système confirmées inchangées ; recette et mesures finales restent dans les notes de validation 037.


## Cinématique du carrousel mobile, 24 novembre 2026

Le contrôle plus ouvre le même carrousel dans toute la viewport. La timeline GSAP distingue acquittement, agrandissement et retour des commandes : sortie du plus à droite (140 ms), déploiement et alignement de la lecture (600 ms), repositionnement des flèches pendant leur disparition, arrivée du rail depuis le bas (240 ms), puis entrée du moins depuis la droite (180 ms). Durée totale : 1 140 ms. Le retour utilise la même géométrie en sens inverse (880 ms), conserve la photo et restaure le scroll de lecture.

La hauteur est exceptionnellement animée pour pousser réellement le contenu dans son flux natif. Les mesures sont prises au début de chaque opération ; aucune lecture de géométrie ni mise à jour React n'est exécutée à chaque frame. Les autres déplacements utilisent les transformations et l'opacité. Le contexte `useGSAP` nettoie les animations au démontage. Rotation, passage en arrière-plan et préférence de mouvement réduit aboutissent à un état utilisable. Le mouvement réduit conserve de courts fondus sans déplacement.

Le cadre commun conserve les langues pendant le passage du chargement à la route streamée. Son fond monte progressivement en 360 ms ; le premier contenu validé possède son propre fondu de 240 ms, même s'il arrive plus tard. Une revalidation ne rejoue pas cette entrée. Les couleurs, polices, contrôles et images restent ceux du système existant ; aucun nouveau raster livré. Le rail horizontal réutilise `ViewProgress`.

Revue de finition de cet ajustement : contrôle local des captures mobile en lecture, mobile agrandi et desktop, avec les assertions navigateur sur le séquençage, le placement et la continuité des langues. Cette revue porte uniquement sur cette évolution ; la revue indépendante précédente reste celle de la composition initiale.
