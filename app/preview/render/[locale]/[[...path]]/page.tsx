import {Suspense} from "react";
import {connection} from "next/server";
import {readPreviewPresentation,readPreviewStatus,readPreviewArtwork} from "@/lib/presentation/preview-client";
import {PageRenderer} from "@/page-composer/PageRenderer";
import {SiteThemeProvider} from "@/branding/SiteThemeProvider";
import {SiteContentProvider} from "@/components/SiteContentProvider";
import {SiteHeader} from "@/components/SiteHeader";
import {SiteFooter} from "@/components/SiteFooter";
import {SiteLogo} from "@/components/SiteLogo";
import {LanguageSelector} from "@/components/LanguageSelector";
import {loadSiteContent} from "@/lib/i18n/load-site-content";
import {classifyRoute,preservedQuery} from "@/lib/i18n/routes";
import {configuredLocalePolicy,loadConfig} from "@/lib/config/env";
import {listArtworks} from "@/lib/api/artworks";
import type {PageKey} from "@/lib/presentation/types";
import type {PageData} from "@/sections/types";
import {PreviewUnavailable} from "@/components/preview/PreviewShell";
import {ArtworkPreviewDocument} from "@/components/preview/ArtworkPreviewDocument";
async function loadRender({params,searchParams}:{params:Promise<{locale:string;path?:string[]}>;searchParams:Promise<{cursor?:string|string[]}>}){
 await connection();
 try{
  const {locale,path=[]}=await params,config=loadConfig(),policy=configuredLocalePolicy(config),route=classifyRoute("/"+locale+"/"+path.join("/"),policy);
  if(!policy.locales.some(l=>l.code===locale)||route.kind==="unknown")throw new Error();
  const status=await readPreviewStatus(),pageKey:PageKey=route.kind==="home"?"home":route.kind==="artwork"?"artworkDetail":route.section!;
  if((status.pageKey==="artworkDetail"||pageKey==="artworkDetail")&&(status.pageKey!==pageKey||status.locale!==locale))throw new Error();
  const [presentation,site]=await Promise.all([readPreviewPresentation(pageKey,locale),loadSiteContent()]),data:PageData={},query=await searchParams;
  if(Array.isArray(query.cursor))throw new Error();
  if(pageKey==="artworks")data.catalog={kind:"legacy",page:await listArtworks(query.cursor)};
  if(pageKey==="artworkDetail"){
   if(Object.keys(query).length)throw new Error();
   const experience=await readPreviewArtwork();if(experience.artwork.id!==status.artworkId||experience.locale!==locale||experience.snapshotId!==presentation.snapshotId||experience.revision!==presentation.revision||![experience.artwork.id,experience.artwork.slug].includes(route.artworkId!))throw new Error();
   data.artwork=experience.artwork;data.artworkContent=experience;
  }
  const immersive=pageKey==="home"&&(!presentation.sections.length||presentation.sections[0]?.type==="heroMedia"&&presentation.sections[0].variant==="immersive");
  return {locale,config,policy,route,presentation,site,data,query:{cursor:query.cursor},immersive};
 }catch{return null;}
}
export default function PreviewRender(props:Parameters<typeof loadRender>[0]){return <Suspense fallback={<p role="status">Chargement de l’aperçu…</p>}><PreviewDocument {...props}/></Suspense>;}
async function PreviewDocument(props:Parameters<typeof loadRender>[0]){
 const view=await loadRender(props);if(!view)return <div data-preview-unavailable><PreviewUnavailable/></div>;
 const {locale,config,policy,route,presentation,site,data,query,immersive}=view;
  return <div lang={locale}><SiteThemeProvider theme={presentation.theme} fonts={presentation.fontFiles} scope="preview"><SiteContentProvider messages={site.messages} locale={locale} defaultLocale={policy.defaultLocale} locales={policy.locales.map(l=>l.code)} scope="preview">
   {data.artworkContent?<ArtworkPreviewDocument presentation={presentation} content={data.artworkContent} siteName={site.siteName} demonstration={config.DATA_MODE==="mock"}/>:<>
   <SiteHeader immersive={immersive} siteName={site.siteName} logo={<SiteLogo logo={site.logo} siteName={site.siteName}/>} locale={locale} defaultLocale={policy.defaultLocale} messages={site.messages} section={route.section} languageControl={<LanguageSelector policy={policy} locale={locale} path={route.logicalPath} query={preservedQuery(route,new URLSearchParams(query.cursor?{cursor:query.cursor}:{}))} label={site.messages["header.languageLabel"]}/>}/>
   <main id="contenu" tabIndex={-1}><PageRenderer contactMode="inert" presentation={presentation} siteName={site.siteName} demonstration={config.DATA_MODE==="mock"} data={data}/></main><SiteFooter siteName={site.siteName} description={site.description}/></>}
  </SiteContentProvider></SiteThemeProvider></div>;
}
