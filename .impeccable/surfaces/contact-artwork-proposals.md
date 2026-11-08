# Contact — œuvre concernée

Mode Operate. Extension du monde Projection, sans nouvelle identité. L’utilisateur a retenu « Grande photographie » le7 novembre2026, puis demandé une section dédiée associant cartel d’œuvre et formulaire configurable à droite, avec padding sur les quatre côtés du cartel.

## Composition retenue

Desktop : grande photographie à gauche, cartel blanc plat en chevauchement au bas de l’image, formulaire publié à droite. Cartel :32px de padding sur les quatre côtés. Mobile : photographie bord à bord, cartel en chevauchement avec24px de padding sur les quatre côtés, formulaire à la suite. Largeur totale bornée1440px et box-sizing explicite. Typographie, couleurs et contrôles issus du thème configuré ; aucune marque ni attribution codée en dur.

Le cadrage réutilise le point de focus publié lorsqu’il concerne la photo primaire ; sinon cadrage haut, conforme à la proposition validée. L’image publique est déjà optimisée et reste servie par /media/id pour revérifier sa publication à chaque lecture, sans cache public ni URL Storage dans le navigateur. Repli localisé si photo absente ou en échec ; un échec survenu avant l’hydratation est détecté lors du montage du composant.

## Architecture

ContactArtworkSection est un rendu contextuel dédié, placé à l’emplacement de l’unique section form ou formImage déjà sélectionnée sur la page Contact. Ce n’est pas un nouveau type de bloc à enregistrer : aucun changement de manifeste, contrat de stockage, migration ni nouvelle configuration admin nécessaire.

Le composant réutilise PublicForm et conserve exactement formId, blockId, hideTitle et l’owner page/contact + artworkId. Champs, conditions, étapes, validation React Hook Form, session, messages, notifications et accusés de réception restent ceux du formulaire configuré. Les champs statiques du prototype ne sont pas repris.

Les métadonnées viennent de la projection publique de la modale : titre, sous-titre, année effective, technique, dimensions, photo primaire et focus. Une année masquée reste absente. Description et provenance ne sont pas dupliquées dans ce résumé. Changement de langue : projection publique de la même œuvre et publication, mise à jour atomique du cartel et du formulaire, réponses conservées. Le titre du document reste celui de Contact.

Le contact général conserve son rendu antérieur. Contexte d’œuvre invalide/inaccessible : avertissement explicite, pas de formulaire réaffecté silencieusement. Références multiples ambiguës : échec fermé existant conservé.

## Preuves

-11 tests unitaires ciblés : projection publique, année absente, focus/localisation, échappement, formulaire form/formImage original, hideTitle/owner et ambiguïté.
-10 scénarios Chromium/WebKit sur l’API/BFF Forms synthétiques réels : mise en page, padding32/24, aucune duplication du formulaire, absence de débordement desktop/mobile, changement FR/EN sans perte de saisie, envoi local avec contexte d’œuvre, photo en échec, séparation des brouillons contact général/œuvre et contexte invalide.
- Le test historique d’accusé au rechargement est aligné sur le comportement déjà en place : nouvelle demande vierge et preuve antérieure archivée, sans second envoi automatique.
- TypeScript source, ESLint ciblé et build Next de production dans le miroir isolé conformes. Images natives justifiées par la route privée déjà optimisée.
- Captures : .impeccable/review/contact-integrated-desktop.png et contact-integrated-mobile.png. Revue indépendante : ship au périmètre de l’intégration et du dernier retour padding ; aucun correctif matériel restant.

Les anciennes propositions et leur photo publique d’exemple restent isolées sur http://127.0.0.1:54130/contact.html. L’intégration réelle se teste sur la recette Forms locale, http://127.0.0.1:3010/contact?artwork=c9b295e6-6925-4202-8e00-67b3df11e84b. Après autorisation « deploy », frontend promu sur preview.lucasratton.com : dpl_4XgGniP4tJdJeyzUyefxgT5UuALa. Contrôles réels desktop/mobile, formulaire configuré unique, padding32/24, contact général et projection anglaise conformes, sans envoi de demande. Aucun changement de contenu client ; API/admin/worker inchangés. Voir backend/specs/017-forms-expertise-library/review/contact-artwork-layout-deployment.md. PRODUCT.md, DESIGN.md et design.json conservés ; aucune réparation de leur dérive historique dans ce travail.

## Ajustements — débord du cartel et titre des formulaires

Le cartel dépasse désormais de32px à gauche de la photographie sur desktop. Sur mobile, son décalage de12px conserve un retrait sûr à l’intérieur du viewport et le padding24px ; le padding desktop reste32px.

Le document de formulaire reçoit hideTitle, booléen optionnel et versionné (absent : titre visible), sans migration du stockage JSON. Le toggle « Afficher le titre du formulaire » se trouve sous le champ du titre, dans les formulaires classiques comme Expertise. Il agit sur l’aperçu puis, après publication, tous les nouveaux parcours. Un emplacement peut aussi masquer le titre ; il ne peut pas forcer l’affichage d’un titre globalement masqué. Les sessions existantes gardent leur document figé. Le titre reste obligatoire pour identifier le formulaire dans l’admin ; introduction, champs, libellé accessible et confirmation restent conservés. La structure Expertise reste protégée en dehors du titre et de sa visibilité.

Vérifications ciblées conformes :5 tests unitaires backend,10 tests contrat/intégration,8 tests unitaires frontend,2 tests de contributions éditeur,2 recettes Chromium/WebKit de mise en page desktop/mobile et2 recettes Chromium du toggle Contact/Expertise (aperçu, sauvegarde, rechargement). TypeScript dans les trois dépôts, ESLint ciblé, absence de dérive des contrats et builds de production frontend/admin conformes. Le service d’identité synthétique arrêté a été relancé avant la recette admin réussie. Captures Contact actualisées et web-admin/.impeccable/review/forms-title-toggle.png inspectées. Revue indépendante ciblée : ship, aucun défaut bloquant.

Après demande « déploie », ces ajustements sont promus sur preview.lucasratton.com et l’admin de production. Les quatre builds (API, worker, admin, frontend) sont READY, les contrôles de santé et SSO conformes. Contrôle navigateur public : débord desktop32px, marge mobile12px, padding32/24, un formulaire, aucun débordement ni erreur JavaScript, sans envoi de demande. Voir backend/specs/017-forms-expertise-library/review/contact-title-deployment.md. L’historique de l’intégration précédente ci-dessus reste conservé.
