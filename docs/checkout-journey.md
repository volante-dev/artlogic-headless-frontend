# Parcours de commande

Le checkout prolonge le système Projection existant. Il conserve le header complet de la galerie, le sous-header Store, la typographie et les couleurs configurables du site. `PRODUCT.md`, `DESIGN.md` et `.impeccable/design.json` restent les références globales ; le contrat de cette surface est dans [checkout.md](../.impeccable/surfaces/checkout.md).

## Trois étapes visibles

1. **Coordonnées** : contact invité et adresse d’expédition, selon le mode de réception disponible.
2. **Livraison** : choix des méthodes, frais et estimations par colis, puis facturation identique ou distincte.
3. **Paiement** : vérification des coordonnées et montants, acceptation des conditions versionnées, préparation du paiement sécurisé, puis confirmation auprès du prestataire.

La vérification et le Payment Element appartiennent à la même troisième étape. Cet adaptateur visuel conserve le protocole existant : l’API exige la preuve d’acceptation des conditions avant de préparer la session Stripe. « Afficher le paiement sécurisé » ne déclenche aucun débit. Les champs de contact, d’adresse et de suivi utilisent le véritable `FormTextControl` partagé avec Forms ; les choix, cases et actions utilisent MUI et le thème du site.

Sur desktop, le formulaire accompagne un récapitulatif photographique stable. Sous 950px, le récapitulatif repliable précède le formulaire. Les petites largeurs conservent les trois étapes et une action principale pleine largeur. Les images utilisent `ResponsivePublicImage` et les URL publiques responsives fournies, sans nouvelle transformation d’image.

## Livraison, facturation et paiement

Le plan serveur fournit modes, méthodes, frais, groupes de produits, estimations et mentions d’importation. Une commande à expéditions séparées garde un seul paiement et présente les frais et suivis par colis. Le retrait masque l’adresse d’expédition du client et impose sa propre adresse de facturation ; revenir à l’expédition restaure l’adresse saisie. Les règles de pays déterminent les champs supplémentaires requis.

L’API reste l’autorité financière et commerciale : prix, quantités validées, devis, total, conditions et état de la tentative proviennent des contrats existants. Stripe affiche son montant réel ; un écart avec le devis bloque la confirmation. Le navigateur ne déclare pas une commande payée : confirmation et suivi relisent l’état serveur, y compris attente, paiement encore possible, échec, expiration et paiement reçu mais commande inexécutable.

L’identité invitée, la reprise d’une tentative existante, les clés d’idempotence de création et d’annulation, les verrous et la preuve d’acceptation restent en place. Une création au résultat incertain conserve sa clé. Modifier une commande déjà préparée passe par le protocole d’annulation existant. Le panier est verrouillé pendant la préparation, avec un devis ou une tentative active, et lorsque le résultat de création est incertain.

## Mouvement et clavier

`CheckoutMotion` utilise des contextes `useGSAP` limités aux composants : sortie d’étape, adaptation bornée de hauteur, révélation du contenu, progression dessinée, ouverture de facturation et tracé de confirmation. Aucun mouvement ne suit chaque frappe. Le passage d’étape place le focus sur le nouveau titre et protège la transition des actions concurrentes.

Le panier utilise `Modal` et `Fade` de MUI pour l’entrée et le maintien du focus, la protection du contenu arrière, Échap et le cycle d’opacité. GSAP gère son déplacement, son dévoilement et le flou du fond. La fermeture par le fond ou Échap restitue le focus au déclencheur après la sortie. `prefers-reduced-motion` supprime les durées de transition et le flou du panier. Les contextes et écouteurs sont nettoyés au démontage.

## Compatibilité et livraison

Cette évolution reste frontend : aucune nouvelle API, migration de base, tâche worker ou modification de flag commerce. Selon `backend/docs/rolling-upgrades.md` dans le workspace, les livraisons restent indépendantes. Une API sans capacité de livraison, désactivée ou répondant 404 sur `delivery-capabilities`, conserve les requêtes historiques `quotes` et un message explicite dans le récapitulatif. Une panne de capacité ou de plan reste une erreur avec reprise ; elle ne devient pas un succès historique silencieux.

La cible de livraison est `staging` vers `lucasratton-preview-frontend`. Le frontend public sur `main` et son Store désactivé restent inchangés. La publication suit le déploiement Git de la branche configurée. Le rollback consiste à revenir au commit frontend précédent ; les contrats, sessions et données restent compatibles.

## Preuves et limites de la recette

- Les stories durables sont [CheckoutJourney.stories.tsx](../components/commerce/CheckoutJourney.stories.tsx), `Store/Checkout journey` (checkout, confirmation, suivi), et [DeliveryCheckout.stories.tsx](../components/commerce/DeliveryCheckout.stories.tsx), `Store/Delivery checkout`.
- La recette finale après intégration des dernières mises à jour de staging compte 14 cas Chromium/WebKit réussis. Les 12 cas fonctionnels initiaux Chromium/WebKit couvrent les frais séparés, le retrait et sa facturation, l’ancienne API, la restauration d’adresse, la facturation distincte avec conditions obligatoires, la reprise du paiement et son annulation. Quatre vérifications ciblées après la chorégraphie de hauteur et deux vérifications du panier modal, du clavier et du flou ont également réussi. Source : `tests/storybook/delivery-checkout.spec.ts` et recette ciblée de la session.
- Les vérifications TypeScript et lint ciblé ainsi qu’un build de production ont réussi. Le premier build avait été interrompu par l’avis de mise à jour de sécurité Next ; la relance a réussi. Le traitement des dépendances reste un travail séparé.
- Lors de la recette, 18 captures de composants réels couvrent neuf états sur desktop et mobile dans `.runtime/checkout-review/`. `metrics.json` contient `errors: []` et aucun débordement horizontal. Les API sont synthétiques, les démonstrations sont identifiées et aucune charge réelle n’a été effectuée.
- `finish-review.md` a demandé deux corrections panier, fond protégé et contexte clavier. Le `verdict.md` suivant conclut `ship` pour ces deux corrections. Cette conclusion ne constitue ni une recette Stripe réelle, ni une validation sur appareil physique, ni une revue de surfaces étrangères au checkout.

Les rapports et captures `.runtime/` sont des preuves locales facultatives. Les stories et tests versionnés permettent de reproduire la surface sans dépendre de ces fichiers.
