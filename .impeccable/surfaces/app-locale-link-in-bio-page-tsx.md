---
version: 1
slug: "app-locale-link-in-bio-page-tsx"
primary_target: "app/[locale]/link-in-bio/page.tsx"
related_targets: ["components/link-in-bio/LinkInBioFeed.tsx","components/link-in-bio/LinkInBioGrid.tsx","components/link-in-bio/PostThumbnail.tsx","components/link-in-bio/LinkInBio.module.css"]
---

# Link in bio public

Mode : Experience. Route `/link-in-bio`, déclinaisons locales et composants `components/link-in-bio/`. Extension de Projection, sans changement du header, du footer ni de l'identité générale.

## Direction contract

THESIS : retrouver un contenu du site depuis une photographie Instagram reconnue. Les cases sans destination restent des photographies, sans contrôle ni lien de repli.

OWN-WORLD : couleurs et typographies publiées du site, géométrie carrée, bandeaux fins encadrés et actions lisibles. Le contenu photographique fournit la couleur ; aucune nouvelle palette.

STORY : lire le titre et les liens mis en avant, reconnaître une couverture, ouvrir sa destination et retrouver sa grille au retour. Le navigateur reste utilisable sans JavaScript.

FIRST VIEWPORT : header habituel, titre centré et description, bandeaux configurés puis grille de trois colonnes. Portrait 3/4, gap 2 px, six premières images prioritaires, douze cases par lot. Mobile : marges extérieures de 6 px ; desktop : composition centrée limitée à 1120 px. L'action de continuation suit les cases, sans loader plein écran.

FORM : structure précisément imposée par le contrat 035 validé avant implement ; pas de tournoi de concepts ni de seed de nouveau monde. Implémentation du contrat existant, sans nouvelle maquette raster. La navigation et la continuité des lots constituent l'interaction principale. Aucun mouvement d'entrée imposé, focus visible seulement au clavier.

FINISH : unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Preuves et limites

Recette locale avec 50 posts synthétiques, 20 destinations (dont une publication), 30 cases sans lien. Les petits fichiers et grants sont injectés ; les images de test réemploient un poster de démonstration existant, réduit à 160x200. Aucun compte ni contenu Instagram réel n'est encore qualifié.

La première capture a révélé une bordure héritée du sélecteur header global sur l'introduction. Le wrapper local est devenu un div, sans modifier les styles du header du site. La confirmation visuelle capture la grille après acquittement normal de la bannière de confidentialité et masque uniquement l'indicateur de développement Next dans le test.

Les composants réemploient les liens internes Next et le protocole HeaderRouteCommit/OriginFreshnessBeacon. Pas de router.refresh ajouté au retour de modale. La grille conserve ses cases sur panne et propose une reprise explicite après conflit de release.

Finition US1 : revue indépendante `ship`, sans correctif matériel, dans `../backend/specs/035-link-in-bio/review/us1-visual-review.md`. Captures finales ouvertes : `.impeccable/review/link-in-bio/desktop.png` (1440 x 2798) et `mobile.png` (375 x 1390). Le handoff `../backend/specs/035-link-in-bio/review/us1-design-documentation.md` confronte les sources au système Projection et conserve `DESIGN.md` ainsi que `.impeccable/design.json`. La dérive préexistante du sidecar reste hors scope. Aucun nouveau raster de production ; le poster existant conserve son prompt de provenance. Cette clôture concerne la page publique examinée, sans qualifier les médias Meta réels ni annoncer l'achèvement de l'admin ou de la feature complète.
