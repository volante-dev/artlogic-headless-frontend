import {builtinFonts} from "../../branding/font-catalog.ts";
import {sectionDefinitions,themeContrastPairs,type Theme} from "../../page-composer/definitions.ts";
import projection from "./projection.json" with {type:"json"};

export const projectionTheme=projection as Theme;
export const defaultManifest={
  schemaVersion:1,profileId:"default",componentContractVersion:1,
  sections:sectionDefinitions,fonts:builtinFonts,
  theme:{colorRoles:Object.keys(projectionTheme.colors),typographyRoles:Object.keys(projectionTheme.typography),base:projectionTheme,contrastPairs:themeContrastPairs},
  presets:[{id:"projection",label:{fr:"Projection",en:"Projection"},theme:projectionTheme}],defaultPreset:"projection",
};
