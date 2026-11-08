# Carte d’œuvre partagée

`ArtworkTile` est la vue commune aux sélections des sections et au catalogue masonry. `ArtworkMasonryCard` reste son export de compatibilité dans le registre client : une spécialisation de cette vue s’applique ainsi aux deux emplacements.

La carte possède le lien localisé, le média, les textes de secours, la légende titre/artiste et les états de survol/focus. Le dégradé et la légende ont des transitions indépendantes ; le focus clavier et le mouvement réduit rendent l’information immédiatement accessible. Sur écran tactile large, la légende reste visible.

Le parent possède uniquement la disposition : colonnes, grandes cases, bande horizontale ou carrousel. `imageFit` conserve les choix cover/contain du composeur ; `fillMobile` remplit la hauteur du carrousel sur mobile et garde la légende visible. `--artwork-caption-bottom` permet au carrousel de réserver la place de ses contrôles. Ne pas dupliquer la typographie ou les transitions dans les sections.

Vérification du 8 novembre 2026 : build de production, lint ciblé, 182 tests unitaires, quatre parcours de sélection et six parcours de grille dans Chromium/WebKit. Les captures ordinateur/mobile des sélections sont dans `test-results/`, les reçus de livraison dans `../backend/.runtime/artwork-tile-release/`.
