---
version: 1
slug: "sections-heromedia-tsx"
primary_target: "sections/HeroMedia.tsx"
related_targets: ["sections/HeroMedia.module.css", "sections/Form.tsx", "sections/FormImage.tsx", "components/editorial/FormBlock.tsx", "components/forms/FormView.tsx", "components/forms/FormRenderer.tsx", "components/forms/ExpertiseRenderer.tsx"]
---

# Hero média et titre des formulaires

Mode : Operate. Affinage local du monde Projection existant, sans nouvelle direction graphique ni nouveaux tokens.

## Direction contract

THESIS: Laisser le média et l’invitation occuper exactement le premier écran ; permettre à chaque placement de formulaire de supprimer son titre redondant.

OWN-WORLD: Projection conserve ses rôles de thème, sa typographie régulière, son média sombre et ses actions rectangulaires. Les formulaires gardent leur fond clair et leurs contrôles existants.

STORY: Lire l’invitation, utiliser le lien de découverte ou poursuivre le défilement normal de la page. Le contrôle de lecture reste disponible. Un formulaire placé sous un titre éditorial peut commencer directement par son introduction et ses champs.

FIRST VIEWPORT: Média en couverture avec point focal configuré, invitation en bas à gauche et lecture en bas à droite. Le hero tient dans la hauteur dynamique de la fenêtre, y compris en paysage ; Explorer, son séparateur, le filet inférieur et la ligne de démonstration sont supprimés.

FORM: Extension du système existant. Le paramètre `hideTitle` appartient au placement `form` ou `formImage`, dans une page ou un bloc éditorial ; il est désactivé par défaut.

FINISH: La revue finale et les preuves locales sont liées ci-dessous ; aucun déploiement n’est attesté par ce brief.

## Grammaire réalisée — 6 novembre 2026

Le hero utilise une hauteur de `100dvh` avec repli `100svh`, sans hauteur minimale additionnelle. Son contenu est contenu par la boîte ; les marges réservent une place au contrôle de lecture. Le média garde `object-fit: cover`, son point focal et les gradients de lisibilité. L’invitation conserve sa mesure de 13 caractères, portée à 14 sur mobile, son introduction et son lien souligné avec flèche SVG. Un retrait local unique (`--hero-edge-inset: clamp(24px, 3.4vw, 64px)`) règle les bords gauche et droit. Sur bureau (à partir de 768px), il règle aussi le bas de l’invitation et du bouton de lecture : les deux blocs sont abaissés, leurs marges latérales et inférieure sont égales et le bord inférieur du lien de découverte rejoint celui du bouton de lecture. Jusqu’à 767px, l’invitation occupe la largeur disponible ; son retrait inférieur vaut le retrait commun augmenté de 112px. Le contrôle utilise le même retrait à droite et en bas (24px à 375px de largeur). L’invitation est une colonne flex, sans espace de ligne anonyme sous le lien. Le contour de focus reste extérieur et ne définit pas ce bord. La variante centrée conserve son alignement propre ; sur mobile, l’invitation et la lecture restent volontairement étagées.

Le texte long peut défiler dans l’invitation. Le chaînage du défilement reste natif : la zone ne doit pas retenir la molette au détriment de la suite de la page. La lecture conserve son icône carrée, son libellé localisé et son contour de focus visible. Aucun comportement de lecture supplémentaire n’est introduit.

La case d’administration « Masquer le titre du formulaire » est propre à chaque section ou bloc ; elle ne modifie pas le document de formulaire partagé. `hideTitle` est transmis aux formulaires ordinaires et à l’entrée Expertise. La suppression ne concerne que le titre visible de cette entrée : introduction, champs, dépôt de photos, navigation et confirmation de réception restent présents. Le formulaire conserve son nom accessible issu du titre. Le titre `h2` de la modale Expertise reste toujours affiché et continue de nommer le dialogue.

## Contraintes à conserver

- Garder le média, l’invitation et la lecture visibles à 1440×900, 375×812 et 812×375 ; ne pas réintroduire une hauteur minimale qui déborde de la fenêtre.
- À partir de 768px, conserver des retraits gauche, droit et inférieur égaux ainsi que les bords inférieurs du lien de découverte et du bouton de lecture alignés à 1px près ; sous ce seuil, conserver leur disposition étagée.
- Garder le titre visible quand `hideTitle` est absent ou faux ; réafficher le titre lorsque la case est décochée.
- Conserver introduction, saisie et reçu indépendamment de cette option. Ne pas appliquer l’option au titre de la modale Expertise.
- La case brute visible au-dessus des captures de formulaire est un contrôle privé du banc de recette, pas un élément de l’interface publique livrée.
- Aucun nouveau raster public n’est livré. Le média de démonstration préexistant reste une fixture synthétique, identifiée dans sa source ; les captures ne l’établissent pas comme film de production.

## Vérification et portée

Le [contrôle documentaire](../review/hero-video-fix/documentation-check.md) distingue les preuves lues des validations transmises. Le [verdict final](../review/hero-video-fix/finish-review.md) porte `disposition: ship`. Les quatre captures de revue montrent les deux formats du hero et les deux formats du formulaire sans titre. Le système global et son sidecar restent inchangés ; les candidats de build en staging ne constituent pas une publication.

### Affinage de l’alignement et des retraits inférieurs

Le [contrôle documentaire de l’alignement](../review/hero-alignment/documentation-check.md) et le [verdict associé](../review/hero-alignment/finish-review.md) (`disposition: ship`, aucune correction demandée) couvrent l’alignement et les retraits égaux qui abaissent les blocs. La [référence utilisateur](../review/hero-alignment/user-reference.png) sert à diagnostiquer les bords inférieurs ; elle ne fournit aucun nouvel actif public. Les captures [bureau](../review/hero-alignment/desktop.png) et [mobile](../review/hero-alignment/mobile.png), ainsi que les [six relevés géométriques](../review/hero-alignment/geometry.json), documentent le candidat. Les assertions d’alignement et d’égalité des retraits à 1px près sur bureau sont transmises par le banc `check-hero-insets.mjs` pour Chromium/WebKit ; le JSON conserve les hauteurs et la visibilité, pas ces coordonnées. Le candidat `dpl_Eq4FjJbiB8u6UmRkVM67ZmkiTQPz` est READY et reste en attente de promotion. La correction fonctionnelle de lecture livrée séparément ne vaut pas publication de cet alignement.
