# Conclusion de modale d’œuvre

Mode Experience : l’œuvre demeure centrale. La conclusion automatique ajoute une destination après les photos ; le reste du parcours de modale est conservé. Prototype desktop puis mobile explicitement validés par le demandeur le7 novembre2026.

## Composition acceptée

Desktop : panneau d’informations existant à gauche, image courante à droite. Titre, sous-titre, Année/Technique/Dimensions et leurs deux traits montent ensemble ; même DOM, même alignement horizontal, sans fade-out/fade-in. Contact existant descend ; son trait reste juste au-dessus. Description puis provenance s’insèrent depuis la gauche sur10px avec opacité et décalage80ms. Pas de séparateur entre elles.

Le premier plan reste l’élément photo monté, sans clone ni reparent. Toutes les cartes gardent le format du cadre de départ et leur crop cover dès le premier frame. Aucune rotation. Quatre vues antérieures au maximum ; retrait 3D et translations, arrière flou0,6px par couche (max2,4px), brightness réduite ; premier plan net. Le fond devient #080a09. Une timeline réversible et un pilote de progression, retarget depuis p courant ; retour au cadrage initial. Réduction de mouvement : mêmes texte et commandes, état statique.

Mobile portrait : pile élargie vers la droite, bord gauche8%, limite de largeur80%/hauteur74%, ratio conservé ; départ à40px. Titre à33% de la hauteur utile, chevauchant les images. Gradient noir avançant dès20%, opaque à43%. Lecture80% de largeur, bord gauche7%. Paysage court compact à gauche. Ne pas reprendre l’ancienne pile minuscule, les rotations, le compteur, le logo ou des boutons fléchés ajoutés.

## Lecture et contrôle

Description seule scrollable si débordement réel ; prose14–16px desktop,13px mobile,12px paysage court. Largeur complète, translation non coupée. Indicateur2px caché au repos, visible pendant contrôle ; masque inférieur uniquement quand du texte reste à lire. Provenance et contact fixes. La description garde les gestes même aux bords, sans retour de slide ; sans overflow elle ne capte aucun geste. Contacts et contrôles existants conservés, textes riches008 sans HTML brut, langue source explicite.

## Source et réglages

Description/provenance importées distinctes du texte manuel. Défauts année/provenance versionnés par publication/aperçu, surcharges locales héritage/afficher/masquer communes aux langues et conservées par sync. Provenance masquée retirée du DTO ; année masquée uniquement dans la modale.

## Validation

Builds et tests synthétiques consignés dans backend/specs/022-artwork-finale/review/validation.md.20 retours automatisés desktop/mobile et repli réduit vérifiés. L’acceptation physique trackpad/tactile et les mesures sur appareils physiques60Hz restent à consigner ; ne pas les déduire de captures ou de Playwright.

Correction du 8 novembre 2026 : la loupe ne disparaît plus via `visibility:hidden` lors du montage de la finale. Son `autoAlpha` est animé sur0,32s au début de la timeline partagée ; le reverse la fait réapparaître à la fin du retour. Desktop : boutons du média ; mobile : conteneur de commande séparé de son entrée. Leur accès clavier/pointeur est suspendu pendant la scène puis restauré au démontage, comme leurs styles. Mouvement réduit : état immédiat. Tests dédiés `tests/gallery-finale-zoom.spec.ts` : quatre cas Chromium/WebKit,390/1440px, valeurs intermédiaires mesurées dans les deux sens et parcours réduit avec sa composition statique desktop. Build, TypeScript et lint validés.

Correctif livré sur `preview.lucasratton.com` : production READY `dpl_3bTbWS6FNGDPHDLuvimNvnbP98Jz`, routage confirmé ; test de fondu aller-retour et mouvement réduit desktop réussi sur le vrai site après déploiement (`.runtime/modal-zoom-finale/live-results`).
