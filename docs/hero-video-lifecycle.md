# Reprise du film d’accueil

Le navigateur mobile peut suspendre une vidéo après avoir annoncé le retour de la page au premier plan. Une vérification unique sur `visibilitychange` laisse alors le film en pause. Une intersection devenue fausse en arrière-plan ou une ancienne promesse `play()` non terminée peuvent également bloquer sa reprise.

Le lecteur réconcilie son état sur `visibilitychange`, `pageshow` et le retour du focus, puis à la prochaine frame, après 250 ms et après 1 s. Les vérifications sont annulées quand la page est masquée ou le lecteur démonté. Il n’y a pas de polling permanent. La visibilité réelle est remesurée ; une tentative suspendue ne bloque plus la reprise. Le retour ne recharge pas la source et ne remet pas la lecture au début.

Une pause demandée avec le bouton reste prioritaire. Un film hors écran ne reprend pas. La préférence de réduction des animations reste respectée ; un refus du navigateur conserve le bouton de lecture explicite. Aucun contrat API ni schéma de données ne change.

`tests/hero-media.spec.ts` couvre la suspension après le retour, la reprise sans changement de source, une promesse suspendue, les pauses volontaires et le film hors écran, ainsi que les contrôles existants. Les scénarios de suspension échouent sur l’ancien code. Chromium et WebKit automatisés vérifient le comportement applicatif ; le changement d’application sur un téléphone physique reste une vérification distincte.

Recette du 17 novembre 2026 : 34 scénarios réussis sur le build de production (17 Chromium, 17 WebKit), lint ciblé, TypeScript et build validés. Les sélecteurs ciblent le contenu visible pour ignorer les copies HTML masquées pendant le streaming ; le test clavier utilise Option-Tab dans WebKit pour inclure les liens.
