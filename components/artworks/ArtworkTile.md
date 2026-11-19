# Carte d’œuvre partagée

`ArtworkTile` est la vue commune aux sélections des sections et au catalogue masonry. `ArtworkMasonryCard` reste son export de compatibilité dans le registre client : une spécialisation de cette vue s’applique ainsi aux deux emplacements.

La carte utilise un cadre 4/5 par défaut et possède le lien localisé, le média, les textes de secours, la légende titre/artiste et les états de survol/focus. Le dégradé et la légende ont des transitions indépendantes ; le focus clavier et le mouvement réduit rendent l’information immédiatement accessible. Sur écran tactile large, la légende reste visible.

Le parent possède uniquement la disposition : colonnes, grandes cases, bande horizontale ou carrousel. `imageFit` conserve les choix cover/contain du composeur ; `fillMobile` remplit la hauteur du carrousel sur mobile et garde la légende visible. `--artwork-caption-top` et `--artwork-caption-bottom` permettent au carrousel de placer la légende sous ses repères en haut du visuel. `--artwork-shade-inset` et `--artwork-shade-direction` orientent son dégradé de lisibilité vers ces informations. Ne pas dupliquer la typographie ou les transitions dans les sections.

Vérification du 8 novembre 2026 : build de production, lint ciblé, 182 tests unitaires, quatre parcours de sélection et six parcours de grille dans Chromium/WebKit. Les captures ordinateur/mobile des sélections sont dans `test-results/`, les reçus de livraison dans `../backend/.runtime/artwork-tile-release/`.

Le média partagé `ArtworkCardMedia` gère la seconde vue au survol : chargement seulement avec un pointeur précis, mesure de sa résolution selon son propre ratio et le cadre réel, glissement horizontal de 250ms, retour réversible à la première vue. Pas de téléchargement de seconde vue sur écran tactile. Les erreurs ou une ancienne réponse ne contenant qu’un média conservent la première vue. Le mouvement réduit conserve le changement de vue sans transition. Les liens et leurs interactions clavier restent inchangés.
