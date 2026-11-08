# Sélection d’œuvres du constructeur

Mode : Experience. Raffinement du monde Projection, sans changement des polices, couleurs ni slots des profils.

Desktop : grille ou bande existante, œuvres dominantes ; léger éclaircissement au hover avec pointeur précis. Les informations se dévoilent depuis le dessous de l’image par un fondu et une translation de 14px sur 200–250ms. Au focus clavier, révélation immédiate. Pointeur tactile sans hover : texte visible. Cover remplit le cadre ; Contain conserve le format sans fond gris.

Mobile : une œuvre conserve sa carte ; plusieurs œuvres passent en carrousel plein écran 100svh, sans déduire le header non sticky. Textes superposés au bas des images, dégradé progressif, repères segmentés passifs et boutons précédent/suivant 44px. Balayage et snap horizontal natifs. Quand le viewport du carrousel devient visible à 60%, alignement vertical une fois par entrée ; réarmement seulement après quasi-sortie (<10%), sans bloquer le défilement de la page. Aucun autoplay.

Mouvement réduit : transitions supprimées et alignements immédiats. Les liens restent des ancres ; ouverture d’œuvre existante et navigation modifiée conservées. Les tests navigateur ne valent pas validation tactile matérielle.

Preuves : revue et captures dans `.impeccable/review/selection-footer-refinement/`. Tests `artwork-selection.spec.ts` dans Chromium/WebKit, desktop et mobile.
