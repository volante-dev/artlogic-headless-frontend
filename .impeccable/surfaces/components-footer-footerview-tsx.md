# Footer générique
Mode : Read. Extension du thème Projection existant, code-led à partir de la référence utilisateur ; aucune nouvelle identité ou image.

## Direction contract
THESIS : une fin de page lisible dans un panneau clair, services en tête, colonnes utiles puis signature ; aucune inscription ajoutée.
OWN-WORLD : surface, texte, mutedText et border du thème ; typographie configurable, grands retraits, liens nets et focus visible.
STORY : retrouver une destination et reconnaître la galerie ; aucun contenu fictif en production.
FIRST VIEWPORT : panneau dans le flux sur fond gris, trois services au plus, quatre colonnes puis identité centrale et réseaux/langues répartis. Sur mobile les services s’empilent et les colonnes deviennent des panneaux indépendants.
FORM : composition assignée par la référence ; seed key assigned-footer-reference ; lecture native, sans mouvement décoratif.
FINISH : unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Implémentation documentée — 6 novembre 2026

Périmètre : `components/SiteFooter.tsx`, `components/SiteFooter.module.css`, `components/footer/{FooterView,FooterGroup,FooterService}.tsx`. Ce brief porte la composition locale du footer. PRODUCT.md et DESIGN.md restent les engagements globaux ; leur description historique du footer n'est pas réécrite par ce handoff. Le panneau légèrement arrondi est une décision de cette surface, pas une nouvelle règle de carte Projection.

## Composition et thème

Le footer reste dans le flux de la page, sur le rôle `background`. Un panneau `surface`, sans ombre, regroupe les services, la navigation puis la signature. Les retraits extérieurs sont fluides (16–32px), ceux du panneau (24–56px), avec un arrondi local (8px). Les séparateurs fins emploient `border`, le texte principal `text` et les informations secondaires `mutedText`. Aucun raster de produit, formulaire de collecte ou newsletter n'est créé.

- Services : jusqu'à trois destinations, chacune avec titre, description facultative et chevron SVG ; grille automatique avec pistes d'au moins (240px), séparateurs entre services et sous la zone.
- Colonnes : jusqu'à quatre groupes, chacun avec titre et au plus douze liens ; grille automatique avec pistes d'au moins (190px), sans cases vides ajoutées pour atteindre le maximum.
- Signature large : réseaux à gauche, identité centrée, langues à droite, en trois pistes `1fr auto 1fr`. L'identité renvoie à l'accueil ; description facultative sous le logo ou le nom.
- À (1100px) et moins : identité alignée à gauche, réseaux et langues sur la rangée suivante. À (767px) et moins : services empilés, groupes en panneaux indépendants, puis identité, réseaux et langues empilés. Chaque groupe utilise `details/summary` natif, se ferme à l'entrée dans la disposition mobile et peut ensuite s'ouvrir indépendamment. Sur grand écran il reste ouvert ; son summary sort de la tabulation. Si le focus était dans un groupe au changement vers mobile, il revient sur son summary.

Les titres de service utilisent la famille/taille body et le poids navigation ; les titres de groupe le rôle h3, ramené à body sur mobile. Les liens et descriptions utilisent caption ; la signature utilise navigation avec une taille fluide (20–36px). Les longs textes peuvent revenir à la ligne. Conserver ces rôles configurables plutôt que recopier les polices ou la palette d'une référence de composition.

## États et interactions

Les liens de groupe et de réseau s'assombrissent et se soulignent au survol. Le chevron de service se décale de (3px) avec une transition (180ms ease-out), supprimée en mouvement réduit. Les liens et summaries ont un contour de focus visible (2px), décalé de (5px), dans le rôle `text`. Le plus du summary devient une croix à l'ouverture sans nouvelle animation.

La CSS courante donne aux liens de groupe, réseau et langue des dimensions minimales (44×44px) ; les summaries mobiles ont une hauteur minimale (64px). Ce constat de source comprend l'ajustement des langues et largeurs intervenu après les captures de revue. Il ne vaut pas vérification sur appareil ni certification globale des cibles.

Les zones sans contenu résolu sont omises, sans placeholder public. Un footer résolu avec toutes les listes vides conserve l'identité ; la description et les langues suivent leurs options respectives. Pour une ancienne présentation `footer: null` ou absente, l'identité et la description non vide restent visibles ; services, groupes, réseaux et langues restent absents. Ne pas assimiler ce repli legacy à la configuration vide créée par l'éditeur, dont les deux options valent `true`.

## Langues, données et slots

`FooterView` reçoit un `ResolvedFooter`, pas le brouillon brut : disponibilité des destinations, affichage des entrées et textes sont résolus en amont pour la langue et le périmètre public ou aperçu. Un groupe sans titre ou sans lien résolu n'apparaît pas. La vue ne fabrique aucune traduction ni lien de remplacement. `SiteFooter` choisit la présentation initiale ou traduite via `selectPresentation` et calcule l'accueil localisé, y compris sous `/preview/render/{locale}`.

Le slot `Footer` du registre client remplace la vue générique sans fork du frontend ; préserver le contrat `FooterViewProps`. Le slot React `logo` remplace le nom affiché, tout en gardant le lien d'accueil et son nom accessible `siteName`. Le slot React `languageControl` est rendu seulement si le footer résolu active `showLanguageSelector` et qu'un contrôle est fourni ; le `LanguageSelector` partagé ne rend rien avec une seule langue. Il garde les règles de navigation localisée et de changement de langue existantes. Le libellé de navigation sociale est « Suivez-nous » en français et « Follow us » autrement.

## Preuves et limites

Les captures `.impeccable/review/footer/{desktop,mobile}.png` montrent la configuration de démonstration (deux services, deux colonnes, un réseau) à (1440px) et (375px). La revue `finish-review.md` conclut à `ship` pour le seul correctif matériel F1 : largeur du champ admin « Langue des textes ». Elle ne certifie pas tous les états ni les interactions. La modification CSS ultérieure des cibles de liens n'est pas couverte par ces captures. La recette reste en cours ; aucun déploiement ni test matériel n'est affirmé.

Précision fonctionnelle : la grille des services suit le nombre réel d’entrées (1–3 colonnes de largeur égale au-dessus de 767px), pour éviter un séparateur latéral orphelin à la largeur tablette. Les textes se redistribuent dans les pistes sans largeur minimale imposée par leur contenu. En dessous, l’empilement reste natif.

## Raffinement demandé après livraison

Cette décision utilisateur remplace la composition précédente : aucun sélecteur de langue dans le footer. Les réseaux deviennent une colonne de la même rangée que les groupes ; une adresse riche traduisible facultative prend aussi place dans cette rangée. Mobile : empilement, groupes repliables conservés. Signature centrée, puis copyright automatique © année et nom du site ; la largeur du paragraphe de copyright neutralise la mesure globale des paragraphes. L’éditeur d’adresse réutilise RichTextField ; annulation/rétablissement par langue, limités au document d’adresse, sans restaurer le reste du footer. Pas de mentions légales ajoutées à la demande de l’utilisateur.

Le champ historique showLanguageSelector reste accepté pour compatibilité des snapshots, mais ne produit plus de sélecteur. address est optionnel et sans migration SQL : le payload JSONB existant le conserve dans les brouillons, aperçus et releases. Aucune adresse cliente inventée ou publiée automatiquement.
