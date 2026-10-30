import {defaultManifest,projectionTheme} from "../default/manifest.ts";
const theme=structuredClone(projectionTheme);
theme.colors.background="#F3F0E8";
for(const role of ["h1","h2","h3"] as const)theme.typography[role]={...theme.typography[role],familyId:"builtin:source-serif-4",weight:400};
/** Demonstration only: no client-specific business data belongs in a profile. */
export const demoGalleryManifest={...structuredClone(defaultManifest),profileId:"demo-gallery",theme:{...structuredClone(defaultManifest.theme),base:theme},presets:[{id:"editorial",label:{fr:"Éditorial",en:"Editorial"},theme}],defaultPreset:"editorial"};
