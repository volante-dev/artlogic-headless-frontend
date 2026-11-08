# Contrôles sur surface claire

L’élévation discrète des contrôles est définie dans `control-surface.ts`, puis exposée par `--site-control-shadow-light` dans le thème de chaque client. La teinte suit la couleur texte du thème : aucune couleur client codée en dur.

- Bouton générique MUI : `<Button surface="light">…</Button>` ; `variant="contained" color="inherit"` utilise aussi la surface claire du thème.
- Bouton icône générique MUI : `<IconButton surface="light" aria-label="Fermer">…</IconButton>`.
- Contrôle natif ou groupe de contrôles : `data-control-surface="light"` réutilise l’élévation commune via MuiCssBaseline. Son fond et ses autres styles restent gérés par le composant. Un composant qui change de ton peut supprimer l’ombre dans son état sombre.

L’ombre est légère (0 2px 10px à 12 %), les transitions durent 360 ms et respectent la réduction des animations. Les contrôles désactivés n’ont pas d’ombre. Les boutons accentués, transparents et textuels conservent leur style tant qu’ils n’optent pas pour une surface claire.

La modale œuvre et les contrôles de zoom des médias éditoriaux réutilisent cette règle. Les stories des primitives Button et IconButton montrent la variante claire.
