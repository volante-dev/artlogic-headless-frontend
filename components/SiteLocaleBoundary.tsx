"use client";
import {createContext,useContext,useEffect,useEffectEvent,useRef,useState,type ReactNode} from "react";
import {SiteContentProvider} from "./SiteContentProvider";
import {classifyRoute,localizedPath,preservedQuery,type RoutingPolicy} from "../lib/i18n/routes";
import {messageRegistry,type SiteMessages} from "../lib/i18n/messages.generated";
import type {LocalePayload} from "../lib/i18n/locale-payload";
import {validatePublicPresentation} from "../lib/presentation/validate-response";
import {parseGalleryExperience} from "../lib/artworks/validate";
const Context=createContext<{changeLocale:(locale:string)=>void;pending:boolean;error:boolean;translation:LocalePayload|null}|null>(null);
export function useSiteLocale(){return useContext(Context);}
/** A locale change updates the mounted views atomically; normal visits stay fresh. */
export function SiteLocaleBoundary({locale,messages,policy,profileId,siteName,children}:{locale:string;messages:SiteMessages;policy:RoutingPolicy;profileId:string;siteName:string;children:ReactNode}){
 const [translation,setTranslation]=useState<LocalePayload|null>(null),[pending,setPending]=useState(false),[error,setError]=useState(false),request=useRef<AbortController|null>(null);
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
  if(route.kind==="unknown")return;
  const pageKey=route.kind==="home"?"home":route.kind==="artwork"?"artworkDetail":route.section!;
  const query=new URLSearchParams({locale:next,pageKey});if(route.artworkId)query.set("artwork",route.artworkId);
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
    if(route.kind==="artwork"){
     value.artwork=parseGalleryExperience(value.artwork);
     if(value.artwork.locale!==next||value.artwork.artwork.slug!==route.artworkId&&value.artwork.artwork.id!==route.artworkId||value.artwork.presentationReleaseId!==value.presentation.releaseId)throw new Error("invalid_locale_artwork");
    }else if(value.artwork!==null)throw new Error("invalid_locale_artwork");
    if(controller.signal.aborted||source!==location.pathname+location.search+location.hash)return;
    setTranslation(value);
    if(!restoring)history.replaceState(history.state,"",localizedPath(path,next,policy.defaultLocale)+preservedQuery(route,new URLSearchParams(location.search))+location.hash);
    document.documentElement.lang=next;
    document.title=(value.artwork?.artwork.title??value.messages[`page.${pageKey==="artworkDetail"?"artworks":pageKey}.title`])+" — "+siteName;
   }catch{if(!controller.signal.aborted)setError(true);}
   finally{if(request.current===controller){request.current=null;setPending(false);}}
  })();
 }
 return <Context value={{changeLocale,pending,error,translation}}><SiteContentProvider messages={translation?.messages??messages} locale={translation?.locale??locale} defaultLocale={policy.defaultLocale} locales={policy.locales.map(l=>l.code)}>{children}</SiteContentProvider></Context>;
}
