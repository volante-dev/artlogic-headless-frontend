# Sélection d’œuvres du constructeur

Mode : Experience. Raffinement du monde Projection, sans changement des polices, couleurs ni slots des profils.

Desktop : grille ou bande existante, œuvres dominantes ; léger éclaircissement au hover avec pointeur précis. Les informations se dévoilent depuis le dessous de l’image par un fondu et une translation de 14px sur 200–250ms. Au focus clavier, révélation immédiate. Pointeur tactile sans hover : texte visible. Cover remplit le cadre ; Contain conserve le format sans fond gris.

Mobile : une œuvre conserve sa carte ; plusieurs œuvres passent en carrousel de hauteur stable `100lvh` (repli `100vh`), sans déduire le header non sticky. Textes superposés au bas des images, dégradé progressif, repères segmentés passifs et compteur. La différence `100lvh - 100svh` est réservée sous les informations et les repères pour les garder visibles lorsque les barres du navigateur sont déployées. Le média ne se redimensionne pas au masquage des barres. Défilement horizontal libre, sans snap ; aucun recentrage vertical automatique. La page peut entrer dans le carrousel et en sortir naturellement. Aucun autoplay.

Mouvement réduit : transitions supprimées et navigation clavier immédiate. Les flèches du clavier continuent à changer d’œuvre et les repères suivent l’œuvre la plus proche. Les liens restent des ancres ; ouverture d’œuvre existante et navigation modifiée conservées. Les tests navigateur ne valent pas validation tactile matérielle.

Preuves : revue et captures dans `.impeccable/review/selection-footer-refinement/`. Tests `artwork-selection.spec.ts` et `home-media-height.spec.ts` dans Chromium/WebKit, desktop et mobile.
