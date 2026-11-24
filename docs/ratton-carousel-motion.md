# Carrousel mobile de la fiche Lucas Ratton

La variante `PRESENTATION_ARTWORK_VIEW=lucas-ratton` conserve la lecture native et
agrandit son carrousel existant sur mobile. Le desktop garde son zoom ×2. Aucun
nouveau contrat, endpoint ou déploiement API n'est nécessaire.

## Séquence GSAP

| Ouverture | Début | Durée |
| --- | --- | --- |
| Le plus sort à droite ; les flèches disparaissent | 0 ms | 140 ms |
| Le carrousel s'étend, pousse la lecture et s'aligne par scroll natif | 140 ms | 600 ms |
| Les flèches réapparaissent sur les côtés | 660 ms | 140 ms |
| La timeline monte depuis le bas | 720 ms | 240 ms |
| Le moins entre depuis la droite | 960 ms | 180 ms |

Le retour dure 880 ms, conserve la photo sélectionnée et restaure le scroll de
lecture. Les clics répétés et le changement de photo sont bloqués pendant ces
transitions. Échap réduit d'abord le carrousel avant de fermer la fiche.

`useGSAP`, ses callbacks `contextSafe` et les labels de timeline possèdent la
cinématique. Une animation de hauteur est nécessaire pour pousser le contenu
dans son flux ; la géométrie est mesurée en début d'opération. Aucun rendu React
ni relevé de géométrie n'est effectué à chaque frame. Les photos restent entières
en `contain`, avec les sources responsives habituelles et trois photos montées au
maximum. L'agrandissement ne force pas le fichier HD de référence.

Un redimensionnement, un passage en arrière-plan ou l'activation du mouvement
réduit termine l'opération en cours. Le mouvement réduit conserve seulement de
courts fondus. Le contexte GSAP et les écouteurs sont nettoyés au démontage.

## Continuité de l'ouverture

Le fond du cadre simple apparaît en 360 ms. Le premier contenu validé apparaît
en 240 ms, même s'il arrive après le cadre ; une revalidation ne rejoue pas cette
entrée. Les langues gardent leur place et leur référence pendant le chargement.
Le cadre provisoire reste présent jusqu'au montage du cadre streamé définitif.
Les contrôles de fraîcheur et de visibilité du contenu restent appliqués.

## Qualification locale du 24 novembre 2026

- Build Next de production, TypeScript, lint des fichiers modifiés et 33 tests
  unitaires validés.
- 10 scénarios WebKit mobile : séquence observée image par image, géométrie plein
  écran, restauration de lecture, rotation, mouvement réduit, revalidation,
  séries de 0/1/2/12 photos et continuité des langues avec une réponse retardée.
- 16 scénarios Chromium : navigation, lecture, erreurs locales d'image, rendu
  sans JavaScript et compatibilité API N-1.
- 4 scénarios Chromium mobile : même séquence, interruption par Échap, photo
  unique, rotation et continuité du cadre.
- Captures locales relues en lecture mobile, carrousel agrandi et lecture desktop.

Le contrôle historique `gallery-opening-polish.spec.ts` passe sur la largeur
390 px. Son assertion finale d'alignement à 1 440 px échoue avec le même écart de
80 px sur le code courant et sur le commit précédent `99e0350`, vérifié dans le
même checkout avec restauration des changements. Ce défaut préexistant de la
variante générique est hors du périmètre de cette cinématique Ratton.

Les données et images de ces scénarios sont locales. La recette ne constitue pas
un essai sur un iPhone physique.
