# Œuvres005 — Cartel suspendu

> **Portée historique 005.** Le relevé ci-dessous, ses mesures et ses gates sont conservés. Pour le comportement mobile livré, l’ouverture commune et les transitions médias au 29 octobre 2026, la section [Œuvres006 — Cartel flottant](#œuvres006--cartel-flottant) fait désormais autorité. Elle remplace les anciennes affirmations de flux mobile natif et d’entrée à 480ms ; elle ne clôt aucun gate 005 ni 006. `../../DESIGN.md` et `../design.json` gardent l’autorité sur le système global, inchangé.

Mode : Operate. Extension locale de Projection ; `../../DESIGN.md` conserve l’autorité sur les rôles de couleur, de typographie et les composants partagés. Relevé documentaire du 29 octobre 2026, après correction de la protection du texte pendant la réduction de l’image. Ce document décrit la surface livrée et ses preuves ; il ne vaut pas verdict de recette globale.

THESIS: Passer d’un catalogue calme à la présence plein écran d’une œuvre, puis rendre son contexte lisible par un défilement natif et réversible.
OWN-WORLD: Projection existant : Hanken Grotesk par défaut, papier/encre/forêt du thème publié, images et contrôles carrés, cartes ouvertes sans relief. Le cartel dépoli et les ombres du rail protègent localement la lecture sur photographie ; ils ne créent pas une nouvelle matière pour toutes les surfaces.
STORY: Rechercher par titre ou artiste, parcourir les pages, ouvrir une œuvre par son slug, lire les informations disponibles, parcourir ses médias publics dans leur ordre puis demander des informations ou revenir au catalogue.
FIRST VIEWPORT: Catalogue aéré avec recherche ; à l’ouverture de la fiche, photographie plein écran, cartel suspendu à gauche, langues/fermeture en haut à droite et rail vertical déjà visible. Aucun module inférieur de flèches et compteur.
FORM: Direction C explicitement approuvée le 28 octobre 2026, précisée par le retrait du module inférieur et la réduction des deux bords de l’image. Le storyboard compose quatre vues : ses coordonnées ne définissent pas une grille CSS unique.
FINISH: Captures réelles à 1440 et 375 px, mesure des deux bords et comparaison avec le système existant ; preuve complémentaire à contenu C fixe avec les vrais composants Storybook. Le premier défaut de protection du texte est résolu indépendamment. Le second verdict confirme le correctif de transition résolu et la fidélité/clôture partielle. La décision utilisateur sur les adaptations actuelles reste attendue.

## Autorité et comparaison avec l’existant

La décision utilisateur et ses corrections figurent dans `../../../backend/specs/005-artwork-gallery-experience/visual-review.md` ; le contrat local est `../mocks/gallery/direction-contract.md`.

| Existant Projection | Expression locale Œuvres005 |
| --- | --- |
| Cartes plates, image complète, titre puis artiste discret | Cadres médias carrés uniformes, image entière dans chaque cadre ; recherche et pagination ajoutent des actions nommées sans enveloppe décorative |
| Rôles CSS/MUI configurables et hiérarchie sans-serif | Même source de thème pour le catalogue, la fiche, le rail et le focus ; aucune nouvelle couleur primitive ni famille typographique |
| Média immersif et zones de lecture protégées | Fiche plein écran avec cartel dépoli ; les informations foncées apparaissent seulement dans le papier libéré par l’image |
| Détail historique en colonnes `1.6fr / .7fr`, images limitées à 75vh | Scène de fiche publique requise en tête, avec cadre sticky sur grand écran ; le détail historique reste un composant distinct, pas la mesure de cette scène |
| Registre fini de composants client | Vues de catalogue, scène, informations et rail spécialisables ; contrôleurs de lecture publique et navigation conservés hors de ce remplacement |

Les fondations de `DESIGN.md` et le sidecar `../design.json` sont conservés. Le dépoli, la géométrie de scène et les seuils de cette fiche restent documentés ici : ils ne deviennent pas des tokens globaux. Les affirmations historiques de DESIGN.md décrivent sa précédente inspection ; cette fiche donne la portée actuelle de l’expérience Œuvres005.

## Catalogue et états

Le catalogue utilise un conteneur de 1440px maximum et des marges fluides. Le titre et la recherche se partagent l’en-tête large ; ils s’empilent à 950px. Le champ et son bouton s’empilent à 600px. La grille reprend les colonnes configurées, trois par défaut, puis deux à 950px et une à 600px. Chaque cadre média générique a un rapport carré (`aspect-ratio:1`) ; son image positionnée dans le cadre utilise `contain`. Les cadres gardent ainsi une hauteur cohérente malgré les proportions natives différentes des photographies, sans les étirer. Évolution utilisateur : dans le catalogue, les images remplissent désormais leur cadre avec recadrage couvrant. Cette régularité locale conserve les cartes ouvertes et plates de Projection.

La recherche garde une étiquette visible et une action explicite. Les pages sont des liens de 44px minimum, avec la page courante en accent/texte associé, des ellipses seulement pour les intervalles omis et un libellé de position. Sur mobile, ce libellé revient à la ligne. L’absence de résultats, le catalogue vide et les erreurs utilisent des messages localisés ; reprise ou nouvelle tentative restent des actions textuelles identifiables. Ne pas présenter une page d’erreur comme une grille sans œuvres.

## Scène, mouvement et protection du texte

L’arrivée interne et l’accès direct utilisent la même entrée native Web Animations, achevée en 480ms : image d’opacité .35 à 1 et d’échelle 1.012 à 1 ; cartel de 400ms après 80ms de délai. Évolution utilisateur du 29 octobre 2026 : sur grand écran, le geste déclenche une séquence autonome de 600 ms, sans arrêt intermédiaire. La capture est bornée à la scène et fonctionne sans déplacement du pointeur ; les longues informations restent librement défilables. Les animations sont annulées lorsque le document devient invisible ou que la préférence de réduction des mouvements change.

Le conteneur de défilement de la modale utilise `overscroll-behavior:none` : aucun rebond élastique aux limites et aucune transmission du geste à la page derrière. Les déplacements entre vues sont des séquences complètes ; mobile, écran bas et mouvement réduit conservent le flux natif.

Sur écran large éligible, le cadre devient sticky et se réduit par les deux côtés. Le bord gauche avance de 0 à 50% de la scène ; le bord droit rentre de 0 à 80px pour réserver le rail. La photographie emploie `cover`, un point de cadrage à 65% horizontal et aucun étirement. Les images ne sont plus cliquables. Un contrôle explicite ×2/×1 agrandit la vue ; souris, glissement tactile et flèches permettent de la parcourir. Échap quitte le zoom avant de fermer la fiche. Les vues statiques suivantes utilisent `contain` ; la première image passe également à `contain` en réduction des mouvements. L’arrivée compacte conserve son cadrage de scène.

Mesures enregistrées dans `../review/gallery/geometry.json`, scène de 1440 × 900px :

| État | Progression | Bord gauche | Bord droit | Largeur du cadre |
| --- | --- | --- | --- | --- |
| Arrivée | 0 | 0px | 1440px | 1440px |
| Transition | .5 | 360px | 1400px | 1040px |
| Lecture, média intermédiaire et final | 1 | 720px | 1360px | 640px |

Sur grand écran, titre et artiste du cartel sont alignés en position, largeur et typographie sur les mêmes textes de lecture. Le fond inverse mélangé à 62%, flouté à 22px, et l’introduction s’effacent pendant la réduction ; le titre et l’artiste restent à leur place jusqu’au relais par les informations. Ce doublon d’introduction est masqué aux technologies d’assistance ; le titre et le contenu de lecture restent sémantiques.

**Protection locale du texte.** La colonne d’informations occupe la moitié gauche. Son masque suit exactement l’espace déjà dégagé : à la progression `p`, sa limite visible est `p × 50%` de la scène. Son opacité reste nulle jusqu’à .8, puis atteint 1 à la fin de la réduction. Ne pas supprimer le masque au profit du seul fondu : du texte sombre pourrait alors recouvrir la photographie avant que le cadre l’ait libéré. Les captures historiques à .5 précèdent l’évolution de position du 29 octobre : le titre et l’artiste sont désormais visibles et immobiles pendant cette transition. Les informations détaillées restent masquées jusqu’à la fin de la réduction.

Le rail est visible dès l’arrivée, première étape active, blanc avec une ombre légère sur photographie ; il devient foncé sur papier à partir de la progression .7. Il décrit les vrais médias ordonnés, conserve un état unique pour une seule vue et nomme chaque étape. Le compteur compact est supprimé à la demande utilisateur du 29 octobre ; seule la timeline demeure ; le module horizontal inférieur flèches/compteur est supprimé sur desktop et mobile. Le rail n’invente pas une vue supplémentaire pour simuler une progression.

## Adaptation et accès

À 767px ou moins, sous 640px de hauteur, ou avec réduction des mouvements, la lecture utilise le flux natif : arrivée, informations puis vues suivantes dans leur ordre. Le rail demeure visible et suit les positions statiques. Le mode compact réserve 56px à droite ; le cartel revient en bas à gauche. Les longues informations déterminent la distance de lecture ; les champs absents ne sont pas remplacés par des faits inventés.

La fiche est une boîte de dialogue MUI plein écran avec confinement du focus, fermeture nommée, Escape et langues toujours disponibles. L’arrière-plan devient `inert` et est masqué aux technologies d’assistance pendant son activité. Le contrôle de fermeture reçoit le focus ; le parcours de retour relève du contrôleur de navigation. Les contrôles de langue, de fermeture et de progression ont une cible d’au moins 44px. Les traitements de focus sur photographie utilisent un contraste inverse ; sur papier ils reprennent le rôle de focus publié.

Le slug public, la fraîcheur de l’œuvre, les droits de publication, les transitions d’historique et le retour au point d’origine relèvent des contrôleurs, pas de la vue spécialisée. La scène requise précède toujours les éventuelles sections éditoriales supplémentaires. L’action de contact associe l’œuvre et reste inactive dans un contexte de prévisualisation inerte.

## Sources et preuves disponibles

Sources publiques inspectées : `components/artworks/ArtworkCatalog`, `ArtworkExperience`, `ArtworkInformation`, `ArtworkProgress`, `ArtworkDialogShell`, `ArtworkNavigationBoundary`, `useArtworkScroll`, `useArtworkEntrance`, leurs feuilles de style, `sections/ArtworkCatalog`, `sections/ArtworkDetailsSection`, `page-composer/ArtworkDocumentRenderer` et `clients/registry.ts`. Les sources sont relatives à la racine `artlogic-frontend/` ; les liens de remplacement client passent par ce registre fini.

Captures disponibles dans `../review/gallery/` : `list`, `empty`, `arrival`, `reading`, `intermediate` et `final`, chacune aux largeurs 1440 et 375, plus `transition-1440.png` et `geometry.json`. La comparaison documentaire a inspecté les captures catalogue large, arrivée mobile, transition large et lecture aux deux largeurs. Elles montrent le catalogue ouvert, le rail dès l’arrivée, la réserve progressive des deux bords et la lecture sur papier. Elles ne démontrent pas seules tous les parcours clavier, toutes les langues, toutes les erreurs ou toutes les configurations client.

Une seconde preuve stabilise le contenu pour comparer C : `../review/gallery/comp/{list,arrival,reading,mobile,mobile-reading}.png`, issues des vrais composants Storybook, et l’atlas `../review/gallery/gallery-comp-atlas.png`. Le catalogue et la lecture de cette série ont aussi été inspectés pour ce relevé. Le fichier `../review/hero-repro.png` contient désormais cet atlas Œuvres005 ; l’ancien fichier003 est archivé. Les captures API de la première série restent une preuve distincte, avec leurs données variables.

La chaîne d’assets est explicite dans `scripts/prepare-gallery-storybook.ts` : les six PNG sources de `public/demo/gallery/` sont référencés puis copiés vers treize routes médias UUID locales sous `.storybook/public/media/`. La copie conserve les PNG et leur provenance native. Le scanner peut désormais retracer ces sources ; l’ancien blocage par l’indirection Storage n’est plus la cause d’arrêt du gate.

L’éditeur `web-admin/components/presentation/ArtworkEditorialEditor` et ses captures `../../../web-admin/.impeccable/review/gallery/editorial-conflict-{1440,375}.png` appartiennent au monde admin séparé, avec Futura PT/Gill Sans et relief bleu. Aucun écart durable de son identité n’est introduit ni documenté comme règle publique ici.

## Limites du relevé

- Le premier contrôle de finition a demandé de protéger le texte sombre pendant la réduction. Le masque/fondu a été corrigé et ce défaut a été jugé résolu indépendamment. Le second verdict portant sur la nouvelle preuve à contenu fixe confirme le référencement résolu, mais la fidélité/clôture encore partielle.
- `../build/state.json` conserve une phase `hero` ouverte. Après résolution du traçage des assets, les rapports courants `../review/diff/{hero,final}/report.json` mesurent 71,1% (valeur brute .7107), verdict **drift** : le seuil de 72% n’est pas atteint et des vetoes structurels persistent. `../review/gallery/gate-final.txt` donne les régions concernées, dont l’action de contact, les contrôles de lecture et le texte d’introduction. Le gate n’est pas forcé ; ce résultat n’est pas un PASS numérique.
- Les rapports antérieurs `../review/gallery/diff/{hero,final}/report.json` sont conservés avec les captures API à contenu variable : 64,34% pour hero et 64,18% pour final, verdict **drift**. Ils ne sont pas remplacés par les rapports de la preuve C fixe. Les deux séries comparent un atlas au storyboard composite ; aucune ne mesure un seul viewport de navigateur.
- La décision utilisateur entre la conservation des adaptations actuelles et un alignement plus strict sur C est en attente. La recette finale rapportée (26 scénarios publics et deux admin en production, Storybook entièrement hors ligne et 36 contrôles axe réussis) reste une preuve de sa portée propre ; elle ne ferme ni le gate de fidélité ni cette décision visuelle.
- Les photographies, artistes, descriptions et données d’œuvre sont synthétiques. Les contrôles de fidélité des cinq régions photographiques concernent ces assets de démonstration ; ils ne valident ni un contenu de galerie réelle ni l’ensemble du produit.
- Ce document conserve les décisions locales approuvées et les observations accessibles ; il n’ajoute pas de validation fonctionnelle, de performance ou d’accessibilité exhaustive.

## Traductions dynamiques — 29 octobre 2026

Les langues actualisent la projection publique dans les composants montés, sans écran d’attente ni redémarrage de l’entrée. URL et langue du document suivent la traduction appliquée. La vidéo, le scroll, la slide et le zoom sont conservés ; une erreur de traduction laisse la vue courante utilisable.

### Geste physique et inertie du trackpad — correctif suivant

Le reset systématique à la fin des 600 ms était insuffisant : il laissait la queue d’inertie déclencher un deuxième déplacement. Le contrôleur utilise désormais `wheel-gestures` 2.3.0 pour identifier le geste et sa phase d’inertie, avec le signal natif lorsqu’il est disponible. Un geste physique consomme au maximum une transition ; terminer l’animation ne réarme pas le geste. Un geste neuf, y compris interrompant l’inertie, peut reprendre au même endroit. Les événements pendant une animation restent consommés et ne sont pas mis en file.

La fermeture n’affiche plus de texte : croix seule avec nom accessible et cible de 44px. Dans le catalogue, les cartes génériques et spécialisées utilisent désormais `cover`, à la demande utilisateur ; cette règle ne décide pas du cadrage d’examen d’une fiche.

État historique avant 006 : la nouvelle galerie mobile immersive était spécifiée séparément et les maquettes ne remplaçaient pas encore le flux mobile livré. Cet état est supersédé par le relevé 006 ci-dessous.

## Œuvres006 — Cartel flottant

Relevé du 29 octobre 2026, après revue indépendante de finition. Extension locale de Projection, en mode Operate. Le [contrat de direction 006](../../../backend/specs/006-mobile-artwork-experience/design/direction-contract.md) porte l’intention approuvée ; les composants décrits ici portent le comportement observé. Le [verdict de finition](../../../backend/specs/006-mobile-artwork-experience/design/review/finish-review.md) dit **ship pour la composition, les contrôles, le texte et les interactions démontrées**, sans valider la fidélité globale au comp.

### Direction contract

THESIS: L’œuvre remplit le téléphone ; les gestes verticaux contrôlés changent de photographie sans déplacer la page. Lecture et examen reviennent explicitement à la même vue sélectionnée.

OWN-WORLD: Projection existant : rôles papier/encre/forêt publiés, Hanken Grotesk auto-hébergé par défaut ou famille configurée par la galerie, contrôles plats et carrés. Le cartel inverse dépoli et la timeline blanche ombrée protègent localement la lecture sur photographie. Aucun remplacement de palette, de typographie globale ou du monde admin ; PT Sans reste un rapprochement consultatif, pas une police livrée.

STORY: Entrer dans l’objet, l’identifier une fois, changer de vue, ouvrir son contexte ou examiner l’image complète et ses détails, puis revenir aux images ou à la page d’origine.

FIRST VIEWPORT: Photographie portrait en cover, foyer horizontal à 65%, cartel unique en bas à gauche avec action d’informations, langues et croix en haut à droite, image entière et ×2 en bas à droite, timeline sur le bord droit sans bloc numérique. La grille sépare le cartel des commandes ; les actions d’examen s’empilent sous 360px et gardent une cible de 44px minimum et les réserves de sécurité.

FORM: Option A « Cartel flottant », approuvée le 29 octobre 2026, seed `mobile-artwork-immersive`. Trois modes explicites : galerie, informations sur papier et examen sur papier. Ouverture commune ordonnée de 740ms hors attente de disponibilité ; transitions médias complètes de 600ms, avec fondu et réduction 1.035→1 de l’image entrante entre vues secondaires. Les mouvements réduits se stabilisent immédiatement.

FINISH: Revue indépendante réalisée, captures valides et aucun défaut matériel supplémentaire relevé dans le périmètre craft/UX capturé. Ce relevé documente l’implémentation et la provenance des rasters. La comparaison finale reste **66,66%, drift**, sous le seuil de 72% ; le gate plates 006 demeure ouvert sans forçage ni dérogation. Les gates et décisions historiques 005 restent distincts. Aucune preuve sur téléphone physique, VoiceOver, TalkBack ou 60fps soutenus n’est fournie.

### Layout

La galerie mobile occupe le viewport dynamique complet (100dvh) et contient ses débordements. Le cadrage cover n’est pas une promesse d’image entière : celle-ci dispose d’une action explicite. Le cartel utilise les rôles inverses, un fond inverse mélangé à 80% et un flou local de 22px. Son identité est une zone de lecture indépendante, défilable jusqu’à 27dvh ; un titre long se replie et défile sans emporter l’action d’informations. Le cartel et les actions d’examen occupent deux colonnes, séparées de 12px. La timeline possède son propre débordement et ses étapes accessibles ; elle décrit uniquement les médias disponibles, avec une étape unique non interactive pour un seul média.

Le panneau d’informations commence sous les commandes supérieures (76px et réserve haute de sécurité). Son retour reste hors de la zone de lecture ; description, métadonnées, contact et sections supplémentaires défilent à l’intérieur. Le titre et l’artiste n’y apparaissent qu’une fois : la vue d’informations reçoit `showIdentity=false`. Les champs manquants ne créent pas de contenu. Les captures de texte agrandi à 200% montrent le repli et le panneau défilable, pas une recette complète de toutes les préférences typographiques.

L’examen réserve une fenêtre entre les contrôles supérieurs et la barre basse. À ×1, la géométrie contient toute la photographie sélectionnée dans cette fenêtre, sans l’étirer. Une photographie secondaire dont la source est un détail reste ce détail complet ; ce n’est pas une restauration du sujet hors cadre. À ×2, la taille est deux fois l’échelle cover de cette fenêtre, avec déplacement relatif borné sur chaque axe. Le titre/artiste unique et les actions ×1/×2 et retour restent dans la barre basse. Le pointeur et les flèches déplacent l’image ; le zoom système conserve son comportement natif.

La composition mobile s’applique jusqu’à 767px de largeur, ainsi qu’aux écrans à pointeur grossier de moins de 640px de hauteur. Une rotation restant dans cette composition conserve le mode. Un vrai changement desktop/mobile termine la transition, retourne à la galerie et réinitialise zoom/pan, tout en conservant média sélectionné et position de lecture. Si le focus devient invalide, il rejoint le titre focalisable. Les adaptations d’écran bas réduisent les réserves ; elles ne rétablissent pas l’ancien flux mobile « arrivée, informations, vues suivantes » de 005.

### Components

`ArtworkExperience` choisit la composition ; `DesktopArtworkExperience` conserve la scène large et son dégagement progressif des deux bords décrits en 005. La lecture desktop reste sous le contrôleur existant et ses séquences de 600ms. Les changements 006 partagés sont l’ouverture commune et le fondu des médias ; les anciennes valeurs d’entrée (480ms, cartel 400ms après 80ms) et de fondu CSS secondaire (420ms) présentes dans le relevé/sidecar historique ne décrivent plus ces comportements. Cette section les supersède localement sans modifier les fondations globales.

`ArtworkMobileController` porte les entrées et délègue la présentation à `MobileArtworkExperience` ou à sa spécialisation client. Un geste vertical accepté consomme au plus un déplacement, sans file d’attente pendant la transition ; premier et dernier médias bornent le parcours. Les gestes sur contrôles, lecture indépendante et zoom système ne déclenchent pas une navigation de galerie. La timeline et le clavier restent des moyens explicites de sélectionner une vue. Le contrôleur et les couches animées règlent leurs interruptions ; le correctif de nettoyage d’examen annule le glissement et libère la capture du pointeur lors du masquage, du blur ou du redimensionnement de son cadre. Ce dernier point est constaté en source, sans nouvelle capture de présentation.

`ArtworkMobileInformationPanel` restaure une position de lecture bornée au contenu disponible. `ArtworkMobileExamination` réserve son viewport et calcule contain/2×cover et les limites de pan. L’ouverture d’un mode déplace le focus vers son titre ou groupe d’examen ; le retour le rend à son déclencheur. Échap quitte d’abord le mode secondaire puis peut fermer l’œuvre. Les vues de galerie masquées sont inertes et retirées de l’arbre d’accessibilité. `ArtworkDialogShell` reste l’unique Dialog MUI extérieur : confinement du focus, fermeture nommée, langues et retour à l’origine relèvent de cette enveloppe et de la navigation publique.

`ArtworkIdentity` assure une seule identité visible et le titre focalisable dans chaque mode. Les traductions dynamiques mettent à jour les composants montés sans relancer l’ouverture ; sélection, mode, zoom/pan et lecture sont conservés dans leur périmètre d’œuvre. Le store réconcilie les identifiants des médias après fraîcheur : une vue disparue ne reste pas sélectionnée et un examen devenu invalide retourne à la galerie. Les états de prévisualisation et publics ont des portées distinctes.

`ArtworkOpeningBoundary` possède une ouverture par visite, commune à l’accès direct, la navigation interne, le desktop et le mobile. Ses couches se succèdent : flou du fond 120ms, média de droite à gauche 300ms, commandes 140ms, timeline/cartel 180ms. L’attente de disponibilité du média ne compte pas dans les 740ms de mouvement ; fermer, masquer le document, redimensionner ou activer le mouvement réduit termine proprement la séquence. Le retour d’un mode et le changement de langue ne créent pas une nouvelle visite.

`ArtworkMediaTransition` anime uniquement l’image : fondu sortant/entrant de 600ms, échelle entrante de 1.035 à 1 entre médias secondaires. Identité, timeline, langues et fermeture restent hors de cette transformation. Ces animations médias sont annulées quand le document est masqué. Le panneau de lecture a sa propre entrée de 240ms ; elle est supprimée en mouvement réduit.

Le registre client fini est conservé : le profil demo-gallery remplace la vue mobile en réutilisant le même contrôleur, sans fork du comportement. `PageRenderer` et `ArtworkDocumentRenderer` rendent la scène requise puis ses sections supplémentaires ; le contexte d’exécution contact traverse ce chemin. `ArtworkPreviewDocument` utilise cette même chaîne avec le contact inerte, un Dialog unique, une portée preview et une réouverture explicite. Le périmètre 006 n’ajoute ni dépendance runtime, ni variable d’environnement, ni endpoint, ni migration SQL. Les cinq messages d’informations, retour, image entière et aides gestuelles sont dans le registre version 5.

### Sources et preuves 006

Sources inspectées : les composants et feuilles de style `ArtworkExperience`, `DesktopArtworkExperience`, `MobileArtworkExperience`, `ArtworkMobileController`, `ArtworkMobileInformationPanel`, `ArtworkMobileExamination`, `ArtworkOpeningBoundary`, `artwork-opening`, `ArtworkMediaTransition`, `ArtworkIdentity`, `ArtworkDialogShell`, `ArtworkProgress` ; les helpers de viewport, entrée, état et géométrie ; `components/preview/ArtworkPreviewDocument`, `page-composer/{PageRenderer,ArtworkDocumentRenderer}`, `clients/registry.ts` et les spécialisations demo-gallery. Ces noms sont relatifs à la racine frontend.

La série actuelle est dans [design/review](../../../backend/specs/006-mobile-artwork-experience/design/review/). Les six planches [confirmation/overview-1.jpg](../../../backend/specs/006-mobile-artwork-experience/design/review/confirmation/overview-1.jpg) à [overview-6.jpg](../../../backend/specs/006-mobile-artwork-experience/design/review/confirmation/overview-6.jpg) ont été inspectées pour ce relevé ; elles couvrent les 64 PNG courants : arrivées, langues/client, titre long, deuxième vue, informations, image entière, zoom aux largeurs 320 et 390, paysage 844×390, texte 200%/mouvement réduit, média secondaire intermédiaire/achevé et desktop 1440×900. Les captures de production sont celles des 29 octobre 12:56/12:57, BUILD_ID `6EPRFUbzDA1-P6LOZclZB` ; les cas titre long et thème client sont Storybook. Les répertoires `round-1` et 005 ne servent pas de preuve courante 006.

Les relevés [geometry-mobile-chromium.json](../../../backend/specs/006-mobile-artwork-experience/design/review/geometry-mobile-chromium.json) et [geometry-mobile-webkit.json](../../../backend/specs/006-mobile-artwork-experience/design/review/geometry-mobile-webkit.json) ne signalent aucune erreur et enregistrent les modes attendus, ouverture achevée. Ils confirment les cadres mobiles complets et, pour la lecture large, le cadre de 640px de x=720 à x=1360 dans la scène 1440px. Le titre de lecture desktop peut se trouver hors viewport après défilement ; cette capture est une lecture avancée, pas une arrivée. Les deux fichiers `motion-mobile-*.json` consignent l’ordre des couches et les deux animations de 600ms, dont le transform entrant 1.035→1. Les captures intermédiaires/achevées gardent les superpositions. Ce relevé n’a lancé ni navigateur ni nouveau détecteur.

Les résultats fournis annoncent 44 tests mobiles de production, trois tests de prévisualisation admin et 30 tests desktop réussis. Après le seul nettoyage non visuel du glissement, le [journal complémentaire](../../../backend/.runtime/006-release-additional.log) inspecté en documentation confirme 12/12 cas sur Chromium et WebKit : positions des médias/identité, remplacement client de la vue, sections supplémentaires uniques, passages secondaires 2↔3↔4 dans les deux sens, examen et rotation restant mobile. Cette exécution utilise le build isolé `UmBrPNh2R8W6Py2F6o5yG` ; elle ne remplace pas les captures du build précédent. Le Storybook final reconstruit rapporte 30 réussites et deux cas de capture explicitement ignorés, dont 20 régressions 005 et dix cas mobiles/grille. Ces résultats restent à leur portée ; le présent travail documentaire ne les réexécute pas et ne les convertit pas en nouvelle preuve de fidélité.

[performance.json](../../../backend/specs/006-mobile-artwork-experience/design/review/performance.json) mesure 20 visiteurs concurrents par composition, 10 internes et 10 directs, sur Apple M5 Pro/darwin arm64, Chromium 156, boucle locale et routes/médias chauds. Les p95 mobiles sont d’environ 1921ms (interne) et 1834ms (direct) ; l’entrée seule atteint au maximum 743,3ms. L’inactivité mesurée ne produit ni frame ni requête supplémentaire. Ces mesures synthétiques locales ne prédisent pas les délais réseau réels et ne démontrent pas des animations à 60fps.

### Provenance et limites de finition

Les trois WebP `public/demo/gallery-mobile/{main,view-2,view-3}.webp` proviennent des médias existants de l’œuvre synthétique 0817 du catalogue dynamique, copiés localement pour Storybook autonome. [public/demo/gallery-mobile/provenance.json](../../public/demo/gallery-mobile/provenance.json) conserve leur origine image_gen, leurs prompts et leur caractère fictif. `scripts/prepare-gallery-storybook.ts` copie les WebP natifs dans les routes médias UUID locales sans conversion. Aucun nouveau raster de catalogue n’a été généré pour 006. La conversion PNG du plate est réservée à l’analyse et ne constitue pas un média livré.

La [comparaison finale](../../../backend/specs/006-mobile-artwork-experience/design/review/comp-diff-final.json) porte sur deux canevas de 853×1844 et donne 0,6666, verdict **drift**. La photographie paysage existante et son recadrage diffèrent de l’objet portrait généré du comp approuvé ; le cartel est plus sombre/haut, le titre prend deux lignes et la géométrie des commandes/timeline diffère. Les contrôles existent dans les captures complètes malgré certains libellés régionaux « missing/contradicted » du comparateur. Les trois études d’états n’ont pas été approuvées comme contrats de remplacement ; leurs compositions de lecture/examen diffèrent des panneaux papier réalisés. La revue expose ces écarts et ne les transforme pas en validation de fidélité.

**Règle de portée de finition.** Le verdict craft/UX **ship** n’est ni un PASS numérique, ni une clôture du gate plates, ni une autorisation de modifier l’œuvre ou d’expédier le crop du comp pour améliorer le score. Les preuves sont des captures Chromium/WebKit avec émulation et entrées synthétiques ; téléphone physique, VoiceOver/TalkBack, qualité gestuelle matérielle et cadence soutenue restent non établis. Les limites et résultats 005 ci-dessus restent historiques et inchangés dans leur sens. La section 006 est une autorité locale documentaire ; aucun de ces contrats, métriques ou états de gate n’est ajouté aux métadonnées délivrées au navigateur.

## Retours de recette — chargement, rythme et zoom mobile

Les retours utilisateur suivants remplacent les règles locales antérieures concernées. Les états transitoires n’affichent plus les messages de vérification/ouverture : une fine boucle de chargement, sans texte visible, accompagne le fond flouté de la fiche. Les erreurs/indisponibilités affichent leur message et la reprise applicable. L’image principale est décodée avant révélation, ou remplacée par son vrai repli après échec/expiration10s ; les médias secondaires ne retardent pas l’entrée. Le code conserve la validation de disponibilité. La PLP désigne la liste des œuvres : ses données chargent dans main, son header réel reste en place pendant ce chargement, et le fallback global ne produit plus le paragraphe/lien de chargement.

Le rythme ajusté le 30 octobre est de 500ms de flou, 700ms pour le déroulement de l’image depuis la droite avec une décélération plus progressive, 220ms pour les commandes puis 300ms pour timeline/cartel : 1720ms au total, hors préparation des données et de l’image. Les durées740/800/1400ms et mesures précédentes décrivent l’état historique. La croix reste immédiatement disponible ; réduction des mouvements, interruption et non-rejeu sont conservés.

Sur mobile, ×2 transforme **l’image existante dans la galerie plein écran**, sans autre panneau ou sous-dialogue. Cartel, rail et commandes restent montés. Le pan tactile est relatif et borné ; un pointeur fin peut explorer au survol. ×1 ou Échap revient à la galerie et au déclencheur ; choisir explicitement une vue via le rail quitte le zoom, contrairement à un glissement de pan. « Image entière » reste une action distincte avec cadrage contain. Le mode interne examine/zoom2 n’implique plus une composition de sous-modale. Les données de langue/média/zoom/pan demeurent gérées par le même contrôleur générique.

Ces ajustements ne redéfinissent pas les fondations Projection et ne closent pas les réserves historiques de fidélité ou de recette matérielle. Les preuves du chargement sont dans `.impeccable/review/loading/` et celles du zoom dans `.impeccable/review/inline-zoom/` ; résultats exacts dans le registre de recette006.
