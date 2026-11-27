"use client";
import {BrowserLanguagePolicy} from '../lib/i18n/browser-policy';
import {decodeLanguagePolicy,type PublicLanguagePolicy} from '../lib/i18n/language-policy-protocol';
import {validateTeamProjection} from "../lib/presentation/validate-team-response";
import {validateNavigation} from "../lib/navigation/validate";
import type {NavigationPublicProjection} from "../lib/navigation/types";
import type {PublicPresentation} from "../lib/presentation/types";
import{isEditorialSection}from"../lib/editorial/article-kind";
import {createContext,useContext,useMemo,useEffect,useEffectEvent,useRef,useState,type ReactNode} from "react";
import {SiteContentProvider} from "./SiteContentProvider";
import {classifyRoute,localizedPath,preservedQuery,type RoutingPolicy} from "../lib/i18n/routes";
import {type RuntimeCatalogueContext,type SiteMessages} from "../lib/i18n/site-messages";
import {decodeLocaleMessages} from '../lib/i18n/decode-locale-messages';
import type {LocalePayload} from "../lib/i18n/locale-payload";
import {validatePublicPresentation} from "../lib/presentation/validate-response";
import {parseAddressedExperience as parseGalleryExperience,splitArtworkAddresses,attachArtworkAddresses} from "../lib/artworks/addresses";
import {artworkHref} from "../lib/artworks/artwork-href";
import {isContactArtworkId} from "../lib/contact/artwork";
import {parsePublicArticle,parseArticlePage,parseArticleFilters} from "../lib/editorial/validate";
import {parseEditorialQuery,editorialQueryString} from "../lib/editorial/query";
const Context=createContext<{changeLocale:(locale:string,restoring?:boolean)=>void;pending:boolean;error:boolean;translation:LocalePayload|null;articlePaths:Record<string,string>|null;pagePaths:Record<string,string>|null;policy:RoutingPolicy;retired:boolean}|null>(null);
export function useSiteLocale(){return useContext(Context);}
/** A locale change updates the mounted views atomically; normal visits stay fresh. */
export function SiteLocaleBoundary({locale,messages,policy:initialPolicy,siteId,languagePolicy,profileId,siteName,children,article,pageIdentity,presentationReleaseId,contextIdentity,runtime}:{locale:string;messages:SiteMessages;policy:RoutingPolicy;siteId?:string;languagePolicy?:PublicLanguagePolicy;runtimeRequired?:boolean;profileId:string;siteName:string;children:ReactNode;article?:{id:string;alternatePaths:Record<string,string>};pageIdentity?:PublicPresentation["pageIdentity"];presentationReleaseId?:string;contextIdentity?:string;runtime?:RuntimeCatalogueContext}){
 const [policy,setPolicy]=useState(initialPolicy),[retired,setRetired]=useState(false),policyReader=useRef<BrowserLanguagePolicy|null>(null);
 if(siteId&&!policyReader.current)policyReader.current=new BrowserLanguagePolicy({siteId,initial:languagePolicy,fetch:(...args)=>fetch(...args)});
 if(languagePolicy)policyReader.current?.note(languagePolicy);
 const localeCodes=useMemo(()=>policy.locales.map(l=>l.code),[policy.locales]);
 const [translation,setTranslation]=useState<LocalePayload|null>(null),[pending,setPending]=useState(false),[error,setError]=useState(false),request=useRef<AbortController|null>(null);
 const [previousContext,setPreviousContext]=useState(contextIdentity);
 if(previousContext!==contextIdentity){setPreviousContext(contextIdentity);setPolicy(initialPolicy);setRetired(false);setTranslation(null);setPending(false);setError(false);}
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
  const query=new URLSearchParams({locale:next,pageKey});if(route.artworkId){query.set("artwork",route.artworkId);query.set("artworkLocale",route.locale);}if(presentationReleaseId)query.set("expectedReleaseId",translation?.presentation.releaseId??presentationReleaseId);
  let nextQuery=preservedQuery(route,new URLSearchParams(location.search));
  const contactArtwork=route.kind==="section"&&route.section==="contact"?new URLSearchParams(nextQuery).get("artwork"):null;
  if(isContactArtworkId(contactArtwork))query.set("artwork",contactArtwork);
  if(route.kind==="article"){if(!article){setError(true);return;}query.set("article",article.id);}
  else if(route.kind==="section"&&isEditorialSection(route.section??"")){
   try{const criteria=parseEditorialQuery(new URLSearchParams(location.search)),clean=editorialQueryString({...criteria,page:1,catalogRevision:undefined});for(const [key,value]of new URLSearchParams(clean))query.append(key,value);nextQuery=clean?"?"+clean:"";}catch{nextQuery="";}
  }
  setPending(true);setError(false);
  void(async()=>{
   try{
    let admittedPolicy=policy;
    if(policyReader.current&&languagePolicy){const read=await policyReader.current.read();if(read.kind==='unavailable')throw new Error('language_policy_unavailable');admittedPolicy={defaultLocale:read.policy.defaultLocale,locales:read.policy.locales.map(({code,label})=>({code,label}))};setPolicy(admittedPolicy);setRetired(!admittedPolicy.locales.some(value=>value.code===(translation?.locale??locale)));if(!admittedPolicy.locales.some(value=>value.code===next))throw new Error('locale_retired');}
    if(controller.signal.aborted)return;
    const response=await fetch("/api/site-locale?"+query,{headers:{"X-Presentation-Team":"1","X-Artwork-Address-Contract":"1"},cache:"no-store",credentials:"omit",redirect:"error",signal:AbortSignal.any([controller.signal,AbortSignal.timeout(10000)])});
    if(!response.ok){if(response.status===409&&policyReader.current){const fresh=await policyReader.current.read();if(fresh.kind==='runtime'){setPolicy({defaultLocale:fresh.policy.defaultLocale,locales:fresh.policy.locales.map(({code,label})=>({code,label}))});setRetired(!fresh.policy.locales.some(value=>value.code===(translation?.locale??locale)));}}if(response.status===404&&route.kind==="artwork")window.dispatchEvent(new Event("artwork-revalidate"));await response.body?.cancel();throw new Error("locale_unavailable");}
    const reader=response.body?.getReader();if(!reader)throw new Error("locale_unavailable");
    let bytes=0,text="";const decoder=new TextDecoder();
    try{for(;;){const part=await reader.read();if(part.done)break;bytes+=part.value.byteLength;if(bytes>10485760)throw new Error("locale_too_large");text+=decoder.decode(part.value,{stream:true});}text+=decoder.decode();}finally{await reader.cancel().catch(()=>undefined);reader.releaseLock();}
    const addressContract=response.headers.get("x-artwork-address-contract");if(addressContract!=="1"&&addressContract!=="0")throw new Error("invalid_artwork_address_contract");
    const value=JSON.parse(text) as LocalePayload;
    if(value.locale!==next)throw new Error("invalid_locale");if(value.languagePolicy&&siteId){const observed=decodeLanguagePolicy(value.languagePolicy,siteId);policyReader.current?.note(observed);if(value.runtime&&observed.publicRevision!==value.runtime.publicRevision||!observed.locales.some(language=>language.code===next))throw new Error('invalid_locale_policy');admittedPolicy={defaultLocale:observed.defaultLocale,locales:observed.locales.map(({code,label})=>({code,label}))};}
    const decoded=decodeLocaleMessages(value.messages,value.runtime,next);value.messages=decoded.messages;value.runtime=decoded.runtime;
    const {teamExtension,...addressedPresentation}=value.presentation,parts=splitArtworkAddresses(addressedPresentation,addressContract==="1"),basePresentation=parts.body;
    value.presentation=attachArtworkAddresses(validatePublicPresentation(basePresentation,{profileId,pageKey,locale:next}),parts.addresses);
    if(teamExtension)try{value.presentation.teamExtension=validateTeamProjection(teamExtension,{scope:"public",id:value.presentation.releaseId,pageKey,locale:next});}catch{value.presentation.teamExtension=null;}
    value.navigation=validateNavigation(value.navigation,{scope:"public",locale:next,id:value.presentation.releaseId,policy:admittedPolicy}) as NavigationPublicProjection;
    if(route.kind==="artwork"){
     value.artwork=parseGalleryExperience(value.artwork,addressContract==="1");
     if(value.artwork.locale!==next||!value.artwork.artwork.publicAddress&&value.artwork.artwork.slug!==route.artworkId&&value.artwork.artwork.id!==route.artworkId||value.artwork.presentationReleaseId!==value.presentation.releaseId)throw new Error("invalid_locale_artwork");
    }else if(isContactArtworkId(contactArtwork)){
     value.artwork=parseGalleryExperience(value.artwork,addressContract==="1");
     if(value.artwork.locale!==next||value.artwork.artwork.id!==contactArtwork||value.artwork.presentationReleaseId!==value.presentation.releaseId)throw new Error("invalid_locale_artwork");
    }else if(value.artwork!==null)throw new Error("invalid_locale_artwork");
    if(route.kind==="article"){
     value.article=((p)=>attachArtworkAddresses(parsePublicArticle(p.body),p.addresses))(splitArtworkAddresses(value.article));const target=classifyRoute(value.article.canonicalPath,admittedPolicy);if(value.article.id!==article?.id||target.kind!=="article"||target.locale!==next||target.articleKind!==route.articleKind)throw new Error("invalid_locale_article");
    }else if(value.article!=null)throw new Error("invalid_locale_article");
    if(value.editorialPage!=null)value.editorialPage=((p)=>attachArtworkAddresses(parseArticlePage(p.body),p.addresses))(splitArtworkAddresses(value.editorialPage));if(value.editorialFilters!=null)value.editorialFilters=parseArticleFilters(value.editorialFilters);
    if(value.editorialQuery){value.editorialQuery=parseEditorialQuery(new URLSearchParams(editorialQueryString(value.editorialQuery)));const search=editorialQueryString(value.editorialQuery);nextQuery=search?"?"+search:"";}
    if(controller.signal.aborted||source!==location.pathname+location.search+location.hash)return;
    setPolicy(admittedPolicy);setRetired(false);setTranslation(value);
    if(!restoring)history.replaceState(history.state,"",(value.presentation.pageIdentity?.canonicalPath??value.article?.canonicalPath??(value.artwork&&route.kind==="artwork"?artworkHref(value.artwork.artwork,next,admittedPolicy.defaultLocale):localizedPath(path,next,admittedPolicy.defaultLocale)))+nextQuery+location.hash);
    document.documentElement.lang=new Intl.Locale(next).toString();
    document.title=(value.presentation.pageIdentity?.name??value.article?.title??(route.kind==="artwork"?value.artwork?.artwork.title:undefined)??value.messages[`page.${pageKey==="artworkDetail"||pageKey==="galerist"?"artworks":pageKey}.title`])+" — "+siteName;
    if(value.presentation.pageIdentity)document.querySelector('link[rel="canonical"]')?.setAttribute("href",new URL(value.presentation.pageIdentity.canonicalPath,location.origin).toString());
    if(value.artwork&&route.kind==="artwork"){
     const art=value.artwork.artwork,canonical=new URL(artworkHref(art,next,admittedPolicy.defaultLocale),location.origin).href;document.querySelector('link[rel="canonical"]')?.setAttribute('href',canonical);document.querySelector('meta[property="og:url"]')?.setAttribute('content',canonical);
     for(const link of document.querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang]')){const code=link.hreflang==='x-default'?admittedPolicy.defaultLocale:link.hreflang;if(admittedPolicy.locales.some(l=>l.code===code))link.href=new URL(artworkHref(art,code,admittedPolicy.defaultLocale),location.origin).href;else link.remove();}
    }
    if(value.article){document.querySelector('link[rel="canonical"]')?.setAttribute("href",new URL(value.article.canonicalPath,location.origin).toString());document.querySelector('meta[name="description"]')?.setAttribute("content",value.article.summary??"");}
   }catch{if(!controller.signal.aborted)setError(true);}
   finally{if(request.current===controller){request.current=null;setPending(false);}}
  })();
 }
 return <Context value={{changeLocale,pending,error,translation,policy,retired,pagePaths:translation?.presentation.pageIdentity?.alternatePaths??pageIdentity?.alternatePaths??null,articlePaths:translation?.article?.alternatePaths??article?.alternatePaths??null}}><SiteContentProvider runtime={translation?translation.runtime:runtime} messages={translation?.messages??messages} locale={translation?.locale??locale} defaultLocale={policy.defaultLocale} locales={localeCodes}>{children}</SiteContentProvider></Context>;
}
