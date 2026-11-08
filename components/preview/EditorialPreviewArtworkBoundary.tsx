"use client";
import{useEditorialSurface}from"../editorial/immersive/EditorialInteractionProvider";
import {useEffect,useRef,useState,type ReactNode} from "react";
import {readArtworkExperience,ArtworkReadError} from "../../lib/artworks/browser";
import {classifyRoute} from "../../lib/i18n/routes";
import type {GalleryExperience} from "../../lib/artworks/types";
import {useClientComponents} from "../../clients/ClientComponentsProvider";
import {useSiteContent} from "../SiteContentProvider";
import {ArtworkNavigationContext} from "../artworks/ArtworkNavigationContext";
import {ArtworkOpeningBoundary,useArtworkOpening} from "../artworks/ArtworkOpeningBoundary";
import {ArtworkDialogShell} from "../artworks/ArtworkDialogShell";
import {ArtworkRouteState} from "../artworks/ArtworkRouteState";
/** Article authority remains bound to its copy. Artwork data uses the public API only. */
function Boundary({children}:{children:ReactNode}){
 const site=useSiteContent(),opening=useArtworkOpening(),components=useClientComponents(),container=useRef<HTMLDivElement>(null),request=useRef<AbortController|null>(null),origin=useRef<HTMLElement|null>(null),restoreFocus=useRef(false);
 const [view,setView]=useState<{locale:string;content?:GalleryExperience;status?:number}|null>(null);
 useEditorialSurface(view!==null);
 function close(){request.current?.abort();request.current=null;opening?.close();restoreFocus.current=true;setView(null);}
 useEffect(()=>{if(view!==null||!restoreFocus.current)return;restoreFocus.current=false;const target=origin.current,frame=requestAnimationFrame(()=>{if(target?.isConnected)target.focus({preventScroll:true});});return()=>cancelAnimationFrame(frame);},[view]);
 useEffect(()=>{
  const capture=(event:MouseEvent)=>{
   if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
   const target=event.target instanceof Element?event.target.closest("a[href]"):null;
   if(!(target instanceof HTMLAnchorElement)||target.hasAttribute("download")||target.target&&target.target!=="_self")return;
   const url=new URL(target.href,location.href);if(url.origin!==location.origin)return;
   const route=classifyRoute(url.pathname,{defaultLocale:site.defaultLocale,locales:site.locales.map(code=>({code,label:code}))});if(route.kind!=="artwork")return;
   event.preventDefault();event.stopPropagation();request.current?.abort();const controller=new AbortController();request.current=controller;origin.current=target;opening?.begin();setView({locale:route.locale});
   void readArtworkExperience(route.artworkId!,route.locale,controller.signal).then(content=>{if(!controller.signal.aborted)setView({locale:route.locale,content});}).catch(error=>{if(!controller.signal.aborted){opening?.finish();setView({locale:route.locale,status:error instanceof ArtworkReadError?error.status:503});}});
  };
  document.addEventListener("click",capture,true);return()=>{document.removeEventListener("click",capture,true);request.current?.abort();};
 },[opening,site.defaultLocale,site.locales]);
 const Experience=components.ArtworkExperience;
 return <ArtworkNavigationContext value={{container,close,changeLocale:()=>{}}}><div ref={container} data-editorial-layout>{children}{view&&<ArtworkDialogShell locale={view.locale} title={view.content?.artwork.title??undefined}>{view.content?<Experience content={view.content} InformationView={components.ArtworkInformation} ProgressView={components.ArtworkProgress}/>:<ArtworkRouteState status={view.status===404?"unavailable":view.status?"error":"loading"}/>}</ArtworkDialogShell>}</div></ArtworkNavigationContext>;
}
export function EditorialPreviewArtworkBoundary({children}:{children:ReactNode}){return <ArtworkOpeningBoundary><Boundary>{children}</Boundary></ArtworkOpeningBoundary>;}
