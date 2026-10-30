import {headers} from "next/headers";
import {loadSiteContent} from "@/lib/i18n/load-site-content";
import {sections,type Section} from "@/lib/i18n/routes";
import {SiteLogo} from "./SiteLogo";
import {LanguageSelector} from "./LanguageSelector";
import {SiteHeader} from "./SiteHeader";
import {SiteLocaleBoundary} from "./SiteLocaleBoundary";
import {SiteThemeProvider} from "@/branding/SiteThemeProvider";
import {loadPublicPresentation} from "@/lib/presentation/load-public";
import fallbackTheme from "@/clients/default/projection.json";
import type {PresentationTheme} from "@/lib/presentation/types";
import {SiteFooter} from "./SiteFooter";
import {ArtworkNavigationBoundary} from "./artworks/ArtworkNavigationBoundary";
export async function SiteShell({children,artwork}:{children:React.ReactNode;artwork?:React.ReactNode}){
  const site=await loadSiteContent(),context=await headers(),active=context.get("x-site-section");
  let presentation;try{presentation=await loadPublicPresentation();}catch{/* The page reports the error; navigation remains usable. */}
  return <SiteThemeProvider theme={presentation?.theme??fallbackTheme as PresentationTheme} fonts={presentation?.fontFiles??[]}><SiteLocaleBoundary key={site.locale+context.get("x-site-path")} messages={site.messages} locale={site.locale} policy={site.policy} profileId={presentation?.profileId??"default"} siteName={site.siteName}><ArtworkNavigationBoundary artwork={artwork} canonical={children}>
    <SiteHeader immersive={presentation?.pageKey==="home"&&(!presentation.sections.length||presentation.sections[0]?.type==="heroMedia"&&presentation.sections[0].variant==="immersive")} logo={<SiteLogo key={site.logo?.id??"none"} logo={site.logo} siteName={site.siteName}/>} siteName={site.siteName} locale={site.locale} defaultLocale={site.policy.defaultLocale} messages={site.messages} section={sections.includes(active as Section)?active as Section:null} languageControl={<LanguageSelector policy={site.policy} locale={site.locale} path={context.get("x-site-path")??"/"} query={context.get("x-site-query")??""} label={site.messages["header.languageLabel"]}/>}/>
    <main id="contenu" data-page-key={presentation?.pageKey??"unknown"} tabIndex={-1}>{children}</main>
    <SiteFooter siteName={site.siteName} description={site.description}/>
  </ArtworkNavigationBoundary></SiteLocaleBoundary></SiteThemeProvider>;
}
