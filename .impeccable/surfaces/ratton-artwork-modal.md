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

La variante réutilise les rôles CSS de Projection pour couleurs, familles et contrôles, sans nouvelle palette, police ou famille de rayons. La composition locale utilise 64/36 sur desktop ; sous 960 px de largeur ou 640 px de hauteur, elle empile identité, photo et informations dans une lecture native, avec contact accessible dans le cadre. Les images restent en `contain`. L'entrée d'opacité dure 180 ms et respecte le mouvement réduit ; ces choix restent propres à cette fiche.

Les cinq captures `ratton-desktop.png`, `ratton-mobile.png`, `ratton-mobile-360.png`, `ratton-landscape.png` et `ratton-zoom-200.png` ont été ouvertes pour la comparaison documentaire avec le système existant. La revue de finition indépendante transmise au documenter porte la disposition **ship**, sans correction matérielle. Détail des preuves et limites : `../backend/specs/037-ratton-artwork-modal/validation/design-review.md` depuis la racine frontend. `DESIGN.md` et `.impeccable/design.json` sont conservés sans modification ; la dérive du sidecar signalée avant cette tâche reste hors périmètre.

Recontrôle final après corrections d'intégration : les cinq captures courantes ont été rouvertes, avec composition stabilisée inchangée. La superposition de la notice et le loader sont ajustés uniquement lorsque le contenu Ratton est présent ; le zoom et la restauration du scroll restent dans la logique locale de visite. Aucun nouveau token ni système visuel. Le reviewer conserve **ship** au périmètre visuel initial, sans nouvelle certification globale. Empreintes des deux fichiers de système confirmées inchangées ; recette et mesures finales restent dans les notes de validation 037.
