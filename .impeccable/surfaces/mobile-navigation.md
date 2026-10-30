# Navigation mobile — papier et lignes

Mode : Experience. Raffinement du header Projection, demandé le 30 octobre 2026. Le système global de DESIGN.md conserve l’autorité sur les couleurs et les familles typographiques.

Cible : `components/SiteHeader.tsx`, `components/SiteHeader.module.css`, `components/SiteHeader.stories.tsx`.

THESIS: Passer des deux traits à la croix au même emplacement, puis ouvrir une page de navigation calme, lisible et spacieuse.
CONTINUITY: Un seul bouton reste monté pendant l’ouverture, la fermeture et leur interruption. Le panneau couvre le viewport sans déplacer le contenu de la page. Le logo reste à gauche, le contrôle à droite ; les langues terminent la composition.
MOTION: Surface papier révélée du haut vers le bas en 540ms ; liens masqués puis dévoilés en 600ms avec 35ms de décalage borné entre les six destinations. Sortie en 360ms avant navigation vers un nouveau document. Les deux traits pivotent en 360ms. Aucun flou de fond ni dépendance d’animation supplémentaire.
BUDGET: CSS clip-path, transform et opacity ; pas de boucle JavaScript de rendu. Aucun changement du header desktop au-delà de 1099px.
ACCESSIBILITY: Cible de 48px, nom accessible localisé, aria-expanded et aria-controls ; dialogue nommé pendant l’ouverture, contenu de fond inert et défilement verrouillé. Échap et sortie rendent le focus au bouton ; Tab et Maj+Tab restent dans le panneau. Les états longs et paysage défilent sous la bande du logo. Mouvement réduit : transitions d’opacité de 120ms, sans translation ni décalage.

Recette : `tests/storybook/header-menu.spec.ts` couvre les vrais composants sur Chromium/WebKit, les captures à 320/390/768/844/1440px, le thème éditorial, l’en-tête immersif, l’interruption, le clavier et axe WCAG AA. `tests/gallery-mobile-menu.spec.ts` vérifie la navigation documentaire et le changement de langue avec le runtime réel. Captures locales exclues de Git dans `.impeccable/review/mobile-menu/`.
