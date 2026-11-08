"use client";
import {validateNavigation} from "../lib/navigation/validate";
import type {NavigationPublicProjection} from "../lib/navigation/types";
import type {PublicPresentation} from "../lib/presentation/types";
import{isEditorialSection}from"../lib/editorial/article-kind";
import {createContext,useContext,useMemo,useEffect,useEffectEvent,useRef,useState,type ReactNode} from "react";
import {SiteContentProvider} from "./SiteContentProvider";
import {classifyRoute,localizedPath,preservedQuery,type RoutingPolicy} from "../lib/i18n/routes";
import {messageRegistry,type SiteMessages} from "../lib/i18n/messages.generated";
import type {LocalePayload} from "../lib/i18n/locale-payload";
import {validatePublicPresentation} from "../lib/presentation/validate-response";
import {parseGalleryExperience} from "../lib/artworks/validate";
import {isContactArtworkId} from "../lib/contact/artwork";
import {parsePublicArticle,parseArticlePage,parseArticleFilters} from "../lib/editorial/validate";
import {parseEditorialQuery,editorialQueryString} from "../lib/editorial/query";
const Context=createContext<{changeLocale:(locale:string)=>void;pending:boolean;error:boolean;translation:LocalePayload|null;articlePaths:Record<string,string>|null;pagePaths:Record<string,string>|null}|null>(null);
export function useSiteLocale(){return useContext(Context);}
/** A locale change updates the mounted views atomically; normal visits stay fresh. */
export function SiteLocaleBoundary({locale,messages,policy,profileId,siteName,children,article,pageIdentity,presentationReleaseId,contextIdentity}:{locale:string;messages:SiteMessages;policy:RoutingPolicy;profileId:string;siteName:string;children:ReactNode;article?:{id:string;alternatePaths:Record<string,string>};pageIdentity?:PublicPresentation["pageIdentity"];presentationReleaseId?:string;contextIdentity?:string}){
 const localeCodes=useMemo(()=>policy.locales.map(l=>l.code),[policy.locales]);
 const [translation,setTranslation]=useState<LocalePayload|null>(null),[pending,setPending]=useState(false),[error,setError]=useState(false),request=useRef<AbortController|null>(null);
 const [previousContext,setPreviousContext]=useState(contextIdentity);
 if(previousContext!==contextIdentity){setPreviousContext(contextIdentity);setTranslation(null);setPending(false);setError(false);}
 useEffect(()=>{request.current?.abort();request.current=null;},[contextIdentity]);
 useEffect(()=>()=>request.current?.abort(),[]);
 const restoreLocale=useEffectEvent(()=>{
  const route=classifyRoute(location.pathname,policy);
  if(route.locale===locale){request.current?.abort();request.current=null;setTranslation(null);setPending(false);setError(false);document.documentElement.lang=locale;}
  else changeLocale(route.locale,true);
 });
 useEffect(()=>{const restore=()=>restoreLocale();window.addEventListener("popstate",restore);return()=>window.removeEventListener("popstate",restore);},[]);
 function changeLocale(next:string,restoring=false){
  if(!policy.locales.some(l=>l.code===next))return;
  request.current?.abort();request.current=null;
  if(!restoring&&next===(translation?.locale??locale)){setPending(false);setError(false);return;}
  const controller=new AbortController();request.current=controller;
  const route=classifyRoute(location.pathname,policy),path=route.logicalPath,source=location.pathname+location.search+location.hash;
  const galerist=route.kind==="unknown"&&Boolean(pageIdentity);
  if(route.kind==="unknown"&&!galerist)return;
  const pageKey=galerist?"galerist":route.kind==="home"?"home":route.kind==="artwork"?"artworkDetail":route.section!;
  const query=new URLSearchParams({locale:next,pageKey});if(route.artworkId)query.set("artwork",route.artworkId);if(presentationReleaseId)query.set("expectedReleaseId",translation?.presentation.releaseId??presentationReleaseId);
  let nextQuery=preservedQuery(route,new URLSearchParams(location.search));
  const contactArtwork=route.kind==="section"&&route.section==="contact"?new URLSearchParams(nextQuery).get("artwork"):null;
  if(isContactArtworkId(contactArtwork))query.set("artwork",contactArtwork);
  if(route.kind==="article"){if(!article){window.location.assign(localizedPath("/"+route.section,next,policy.defaultLocale));return;}query.set("article",article.id);}
  else if(route.kind==="section"&&isEditorialSection(route.section??"")){
   try{const criteria=parseEditorialQuery(new URLSearchParams(location.search)),clean=editorialQueryString({...criteria,page:1,catalogRevision:undefined});for(const [key,value]of new URLSearchParams(clean))query.append(key,value);nextQuery=clean?"?"+clean:"";}catch{nextQuery="";}
  }
  setPending(true);setError(false);
  void(async()=>{
   try{
    const response=await fetch("/api/site-locale?"+query,{cache:"no-store",credentials:"omit",redirect:"error",signal:AbortSignal.any([controller.signal,AbortSignal.timeout(10000)])});
    if(!response.ok){if(response.status===404&&route.kind==="artwork")window.dispatchEvent(new Event("artwork-revalidate"));throw new Error("locale_unavailable");}
    const reader=response.body?.getReader();if(!reader)throw new Error("locale_unavailable");
    let bytes=0,text="";const decoder=new TextDecoder();
    try{for(;;){const part=await reader.read();if(part.done)break;bytes+=part.value.byteLength;if(bytes>10485760)throw new Error("locale_too_large");text+=decoder.decode(part.value,{stream:true});}text+=decoder.decode();}finally{await reader.cancel().catch(()=>undefined);reader.releaseLock();}
    const value=JSON.parse(text) as LocalePayload;
    if(value.locale!==next||!value.messages||messageRegistry.messages.some(m=>typeof value.messages[m.key]!=="string"||!value.messages[m.key].trim()||Array.from(value.messages[m.key]).length>m.maxLength))throw new Error("invalid_locale");
    value.presentation=validatePublicPresentation(value.presentation,{profileId,pageKey,locale:next});
    value.navigation=validateNavigation(value.navigation,{scope:"public",locale:next,id:value.presentation.releaseId,policy}) as NavigationPublicProjection;
    if(route.kind==="artwork"){
     value.artwork=parseGalleryExperience(value.artwork);
     if(value.artwork.locale!==next||value.artwork.artwork.slug!==route.artworkId&&value.artwork.artwork.id!==route.artworkId||value.artwork.presentationReleaseId!==value.presentation.releaseId)throw new Error("invalid_locale_artwork");
    }else if(isContactArtworkId(contactArtwork)){
     value.artwork=parseGalleryExperience(value.artwork);
     if(value.artwork.locale!==next||value.artwork.artwork.id!==contactArtwork||value.artwork.presentationReleaseId!==value.presentation.releaseId)throw new Error("invalid_locale_artwork");
    }else if(value.artwork!==null)throw new Error("invalid_locale_artwork");
    if(route.kind==="article"){
     value.article=parsePublicArticle(value.article);const target=classifyRoute(value.article.canonicalPath,policy);if(value.article.id!==article?.id||target.kind!=="article"||target.locale!==next||target.articleKind!==route.articleKind)throw new Error("invalid_locale_article");
    }else if(value.article!=null)throw new Error("invalid_locale_article");
    if(value.editorialPage!=null)value.editorialPage=parseArticlePage(value.editorialPage);if(value.editorialFilters!=null)value.editorialFilters=parseArticleFilters(value.editorialFilters);
    if(value.editorialQuery){value.editorialQuery=parseEditorialQuery(new URLSearchParams(editorialQueryString(value.editorialQuery)));const search=editorialQueryString(value.editorialQuery);nextQuery=search?"?"+search:"";}
    if(controller.signal.aborted||source!==location.pathname+location.search+location.hash)return;
    setTranslation(value);
    if(!restoring)history.replaceState(history.state,"",(value.presentation.pageIdentity?.canonicalPath??value.article?.canonicalPath??localizedPath(path,next,policy.defaultLocale))+nextQuery+location.hash);
    document.documentElement.lang=next;
    document.title=(value.presentation.pageIdentity?.name??value.article?.title??(route.kind==="artwork"?value.artwork?.artwork.title:undefined)??value.messages[`page.${pageKey==="artworkDetail"||pageKey==="galerist"?"artworks":pageKey}.title`])+" — "+siteName;
    if(value.presentation.pageIdentity)document.querySelector('link[rel="canonical"]')?.setAttribute("href",new URL(value.presentation.pageIdentity.canonicalPath,location.origin).toString());
    if(value.article){document.querySelector('link[rel="canonical"]')?.setAttribute("href",new URL(value.article.canonicalPath,location.origin).toString());document.querySelector('meta[name="description"]')?.setAttribute("content",value.article.summary??"");}
   }catch{if(!controller.signal.aborted)setError(true);}
   finally{if(request.current===controller){request.current=null;setPending(false);}}
  })();
 }
 return <Context value={{changeLocale,pending,error,translation,pagePaths:translation?.presentation.pageIdentity?.alternatePaths??pageIdentity?.alternatePaths??null,articlePaths:translation?.article?.alternatePaths??article?.alternatePaths??null}}><SiteContentProvider messages={translation?.messages??messages} locale={translation?.locale??locale} defaultLocale={policy.defaultLocale} locales={localeCodes}>{children}</SiteContentProvider></Context>;
}
