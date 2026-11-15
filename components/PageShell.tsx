import {loadPublicPresentation} from "@/lib/presentation/load-public";
import {loadSiteContent} from "@/lib/i18n/load-site-content";
import type {Section} from "@/lib/i18n/routes";
import {PublicPage} from "@/lib/presentation/load-page";
import {pageAlternates,sectionDescription} from "@/lib/seo/metadata";
export type BasicSection=Exclude<Section,"artworks">;
export async function PageShell({section}:{section:BasicSection}){void section;return <PublicPage/>;}
export async function sectionMetadata(section:BasicSection|"artworks"|"home"){const [site,presentation]=await Promise.all([loadSiteContent(),loadPublicPresentation().catch(()=>null)]);const title=site.messages[`page.${section}.title`]+" — "+site.siteName,description=presentation?.metaDescription?.trim()||site.description.trim()||sectionDescription(section,site.locale,site.siteName),alternates=pageAlternates(section==="home"?"/":"/"+section,site.locale,site.policy,site.siteOrigin);return {title,description,alternates,openGraph:{title,description,url:alternates.canonical}};}
