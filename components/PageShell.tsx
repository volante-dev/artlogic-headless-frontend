import {loadSiteContent} from "@/lib/i18n/load-site-content";
import type {Section} from "@/lib/i18n/routes";
import {PublicPage} from "@/lib/presentation/load-page";
export type BasicSection=Exclude<Section,"artworks">;
export async function PageShell({section}:{section:BasicSection}){void section;return <PublicPage/>;}
export async function sectionMetadata(section:BasicSection|"artworks"|"home"){const site=await loadSiteContent();return {title:site.messages[`page.${section}.title`]+" — "+site.siteName};}
