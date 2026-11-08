"use client";
import{useEditorialSurface}from"../editorial/immersive/EditorialInteractionProvider";
import {useRef,useState,useEffect,useLayoutEffect,useCallback,useMemo,type ReactNode} from "react";
import {useRouter,usePathname,useSelectedLayoutSegments} from "next/navigation";
import {ArtworkVisits,type ArtworkOrigin,type ArtworkActivation} from "../../lib/artworks/navigation";
import {readArtworkExperience,ArtworkReadError} from "../../lib/artworks/browser";
import {classifyRoute,localizedPath} from "../../lib/i18n/routes";
import {useSiteContent} from "../SiteContentProvider";
import {ArtworkNavigationContext} from "./ArtworkNavigationContext";
import {ArtworkDialogShell} from "./ArtworkDialogShell";
import {ArtworkReturnOverlay} from "./ArtworkReturnOverlay";
import styles from "./ArtworkDialogShell.module.css";
import {ArtworkRouteState} from "./ArtworkRouteState";
import type {MobileArtworkVisualSnapshot} from "../../lib/artworks/interaction";
import {useArtworkOpening} from "./ArtworkOpeningBoundary";
import {useSiteLocale} from "../SiteLocaleBoundary";

const stateKey="artlogicArtworkVisit";
type Pending={reference:string;locale:string;status:number|null};
type Restore={origin:ArtworkOrigin};
export function ArtworkNavigationBoundary({children,artwork,canonical}:{children:ReactNode;artwork:ReactNode;canonical:ReactNode}){
  const opening=useArtworkOpening(),site=useSiteContent(),dynamic=useSiteLocale(),router=useRouter(),pathname=usePathname(),segments=useSelectedLayoutSegments("artwork"),slot=segments.join("|");
  const policy=useMemo(()=>({defaultLocale:site.defaultLocale,locales:site.locales.map(code=>({code,label:code}))}),[site.defaultLocale,site.locales]);
  const route=classifyRoute(pathname,policy),isArtwork=route.kind==="artwork",intercepted=segments.some(segment=>segment==="(.)artworks"||segment==="artworks");
  const visits=useRef<ArtworkVisits|null>(null);if(visits.current===null){visits.current=new ArtworkVisits();}
  const background=useRef<HTMLDivElement>(null),container=useRef<HTMLDivElement>(null),committing=useRef<{href:string;token:string;cancelled?:boolean;refresh?:boolean}|null>(null);
  const [pending,setPending]=useState<Pending|null>(null),[restoring,setRestoring]=useState<Restore|null>(null),[activation,setActivation]=useState(0);
  const nonces=useRef(new Map<string,string>()),closingRequest=useRef(false),completingRestore=useRef<Restore|null>(null),restoringRef=useRef(restoring),pendingRef=useRef(pending);
  useLayoutEffect(()=>{restoringRef.current=restoring;pendingRef.current=pending;},[restoring,pending]);
  const visitToken=useCallback(()=>visits.current!.token,[]);
  const rememberVisual=useCallback((scrollTop:number,provided?:string|null)=>{const token=provided===undefined?visits.current!.token:provided;if(token)visits.current!.rememberVisual(token,{scrollTop});},[]);
  const readVisual=useCallback((provided?:string|null)=>{const token=provided===undefined?visits.current!.token:provided;return token?visits.current!.visual(token)?.scrollTop:undefined;},[]);
  const rememberMobileVisual=useCallback((mobile:MobileArtworkVisualSnapshot,provided?:string|null)=>{const token=provided===undefined?visits.current!.token:provided;if(token)visits.current!.rememberVisual(token,{mobile});},[]);
  const readMobileVisual=useCallback((provided?:string|null)=>{const token=provided===undefined?visits.current!.token:provided;return token?visits.current!.visual(token)?.mobile:undefined;},[]);
  const saveCurrentVisual=useCallback(()=>{const dialog=[...container.current?.querySelectorAll<HTMLElement>("[role=dialog]")??[]].find(node=>node.checkVisibility());if(dialog)rememberVisual(dialog.scrollTop);},[rememberVisual]);
  const fallback=localizedPath("/artworks",pending?.locale??(dynamic?site.locale:route.locale),site.defaultLocale);
  const resolve=useCallback(async(request:ArtworkActivation)=>{
    setPending({reference:request.reference,locale:request.locale,status:null});
    try{
      const data=await readArtworkExperience(request.reference,request.locale,request.signal);
      const href=localizedPath("/artworks/"+data.artwork.slug,request.locale,site.defaultLocale),commit=visits.current!.complete(request.id,href);
      if(!commit)return;
      if(commit.action!=="none"){
        committing.current={href,token:commit.token,refresh:commit.action==="replace"};
        if(commit.action==="push")router.push(href,{scroll:false});else router.replace(href,{scroll:false});
      }else setPending(null);
    }catch(error){if(request.signal.aborted||!visits.current!.fail(request.id))return;setPending({reference:request.reference,locale:request.locale,status:error instanceof ArtworkReadError?error.status:503});}
  },[router,site.defaultLocale,setPending]);
  const completeRestore=useCallback((restore:Restore)=>{
    if(restoringRef.current!==restore||completingRestore.current===restore)return;
    completingRestore.current=restore;
    requestAnimationFrame(()=>{void(async()=>{
      if(restoringRef.current!==restore)return;
      window.scrollTo(restore.origin.scrollX,restore.origin.scrollY);
      const completed=opening?await opening.revealOrigin():true;
      if(!completed||restoringRef.current!==restore)return;
      restoringRef.current=null;setRestoring(null);closingRequest.current=false;
      requestAnimationFrame(()=>{
        const dialog=[...container.current?.querySelectorAll<HTMLElement>("[role=dialog]")??[]].find(node=>node.checkVisibility());
        if(dialog&&restore.origin.artworkScrollTop!==undefined)dialog.scrollTop=restore.origin.artworkScrollTop;
        const focus=restore.origin.focus,anchors=focus?[...document.querySelectorAll<HTMLAnchorElement>("a[href]")].filter(a=>a.getAttribute("href")===focus.href&&a.checkVisibility()&&!a.closest("[inert]")):[];
        (anchors[focus?.index??0]??dialog?.querySelector<HTMLElement>('[role="button"]')??document.querySelector<HTMLElement>("#contenu"))?.focus({preventScroll:true});
      });
    })();});
  },[opening]);
  const restoreOrigin=useCallback((origin:ArtworkOrigin)=>{const restore={origin};restoringRef.current=restore;setRestoring(restore);return restore;},[]);
  const close=useCallback(()=>{
    if(closingRequest.current||restoringRef.current)return;
    closingRequest.current=true;saveCurrentVisual();
    const visit=visits.current!.state,origin=visit.kind==="closed"?null:visit.visit.origin;
    const wasPending=Boolean(pendingRef.current),result=visits.current!.close(fallback);
    void(async()=>{
      if(opening&&!await opening.startClosing()){closingRequest.current=false;return;}
      setPending(null);
      const target=origin??{href:isArtwork?fallback:location.pathname+location.search,locale:route.locale,scrollX:isArtwork?0:scrollX,scrollY:isArtwork?0:scrollY,focus:null};
      const restore=restoreOrigin(result.action==="back"?result.origin:target),commit=committing.current;
      if(commit&&commit.href!==location.pathname){commit.cancelled=true;return;}
      committing.current=null;
      if(result.action==="back")router.back();
      else if(result.action==="dismiss"){
        if(isArtwork&&wasPending)visits.current!.resume(typeof history.state?.[stateKey]==="string"?history.state[stateKey]:null,route.artworkId!,route.locale);
        completeRestore(restore);
      }else router.replace(fallback,{scroll:false});
    })();
  },[fallback,isArtwork,route.artworkId,route.locale,router,saveCurrentVisual,opening,restoreOrigin,completeRestore]);
  const changeLocale=useCallback((locale:string)=>{if(!site.locales.includes(locale))return;saveCurrentVisual();if(dynamic)dynamic.changeLocale(locale);else void resolve(visits.current!.changeLocale(locale));},[resolve,site.locales,saveCurrentVisual,dynamic]);

  useLayoutEffect(()=>{
    if(isArtwork){
      const commit=committing.current;
      if(commit&&commit.href===location.pathname){
        if(commit.cancelled){committing.current=null;router.back();return;}
        history.replaceState({...history.state,[stateKey]:commit.token},"",location.href);committing.current=null;setPending(null);if(commit.refresh)router.refresh();
      }else visits.current!.resume(typeof history.state?.[stateKey]==="string"?history.state[stateKey]:null,route.artworkId!,route.locale);
    }else if(restoringRef.current){
      const restore=restoringRef.current,url=new URL(restore.origin.href,location.origin);
      if(nonces.current.has(url.pathname+url.search)&&location.pathname===url.pathname)completeRestore(restore);
    }
    else if(visits.current!.state.kind!=="closed"){
      opening?.close();visits.current!.dispose();setPending(null);if(committing.current)committing.current.cancelled=true;
      const origin:ArtworkOrigin={href:location.pathname+location.search+location.hash,locale:route.locale,scrollX:0,scrollY:0,focus:null};
      const restore=restoreOrigin(origin);if(nonces.current.has(location.pathname+location.search))completeRestore(restore);
    }
  },[pathname,isArtwork,route.artworkId,route.locale,router,opening,restoreOrigin,completeRestore]);
  useLayoutEffect(()=>{
    const state=visits.current!.state;
    if(isArtwork&&state.kind!=="closed"&&state.visit.pushed&&state.visit.reference===route.artworkId&&state.visit.locale===route.locale&&history.state?.[stateKey]!==state.visit.token)history.replaceState({...history.state,[stateKey]:state.visit.token},"",location.href);
  });

  useEffect(()=>{
    const capture=(event:MouseEvent)=>{
      if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.altKey||event.shiftKey)return;
      const target=event.target instanceof Element?event.target.closest("a[href]"):null;
      if(!(target instanceof HTMLAnchorElement)||target.hasAttribute("download")||target.target&&target.target!=="_self")return;
      const url=new URL(target.href,location.href);if(url.origin!==location.origin)return;
      const next=classifyRoute(url.pathname,policy);if(next.kind!=="artwork")return;
      event.preventDefault();event.stopPropagation();
      const language=target.dataset.artworkLocale;
      if(language){if(language!==(pending?.locale??(dynamic?site.locale:route.locale)))changeLocale(language);return;}
      const anchors=[...document.querySelectorAll<HTMLAnchorElement>("a[href]")].filter(a=>a.href===target.href&&a.checkVisibility()&&!a.closest("[inert]"));
      const origin:ArtworkOrigin={href:location.pathname+location.search+location.hash,locale:route.locale,scrollX:scrollX,scrollY:scrollY,focus:{href:target.getAttribute("href")!,index:Math.max(0,anchors.indexOf(target))},...(isArtwork?{artworkScrollTop:target.closest<HTMLElement>("[role=dialog]")?.scrollTop??0}:{})};
      target.focus({preventScroll:true});
      opening?.begin();void resolve(visits.current!.start(next.artworkId!,next.locale,origin));
    };
    document.addEventListener("click",capture,true);
    return ()=>document.removeEventListener("click",capture,true);
  },[resolve,changeLocale,policy,route.locale,site.locale,isArtwork,pending?.locale,dynamic,opening]);

  useLayoutEffect(()=>{
    const ready=(event:Event)=>{
      const detail=(event as CustomEvent<{nonce:string;href:string}>).detail;if(!detail)return;
      nonces.current.set(detail.href,detail.nonce);
      const restore=restoringRef.current;if(!restore)return;
      const url=new URL(restore.origin.href,location.origin);if(detail.href!==url.pathname+url.search)return;
      completeRestore(restore);
    };
    const pop=()=>{
      const current=classifyRoute(location.pathname,policy);
      if(current.kind==="artwork"){
        if(![...document.querySelectorAll<HTMLElement>("[role=dialog]")].some(node=>node.checkVisibility()))opening?.begin();saveCurrentVisual();visits.current!.resume(typeof history.state?.[stateKey]==="string"?history.state[stateKey]:null,current.artworkId!,current.locale);setActivation(n=>n+1);return;
      }
      if(opening&&!closingRequest.current&&(opening.isOpen||visits.current!.state.kind!=="closed")){closingRequest.current=true;void opening.startClosing(true).then(completed=>{const restore=restoringRef.current;if(completed&&restore&&nonces.current.has(location.pathname+location.search))completeRestore(restore);});}
      if(visits.current!.state.kind!=="closed"){
        saveCurrentVisual();const result=visits.current!.close(localizedPath("/artworks",current.locale,site.defaultLocale));setPending(null);
        if(result.action==="back"){
          restoreOrigin(result.origin);
        }
      }
    };
    window.addEventListener("artwork-origin-ready",ready);window.addEventListener("popstate",pop);
    return ()=>{window.removeEventListener("artwork-origin-ready",ready);window.removeEventListener("popstate",pop);};
  },[policy,site.defaultLocale,saveCurrentVisual,opening,restoreOrigin,completeRestore]);
  useEffect(()=>{if(!restoring)return;const timer=setTimeout(()=>window.location.replace(fallback),10000);return ()=>clearTimeout(timer);},[restoring,fallback]);
  const leaveForHeader=useCallback(()=>{opening?.close();visits.current!.dispose();committing.current=null;setPending(null);setRestoring(null);restoringRef.current=null;pendingRef.current=null;closingRequest.current=false;},[opening]);
  useEffect(()=>()=>visits.current!.dispose(),[]);
  const active=isArtwork||pending!==null||restoring!==null;
 useEditorialSurface(active);
  useLayoutEffect(()=>{if(active&&background.current)return opening?.register("background",background.current);},[active,opening]);
  const pendingShell=Boolean(pending&&(!isArtwork||pending.locale!==route.locale||pending.reference!==route.artworkId||pending.status));
  return <ArtworkNavigationContext value={{leaveForHeader,close,changeLocale,container,rememberVisual,readVisual,rememberMobileVisual,readMobileVisual,visitToken,activation,restoring:Boolean(restoring),activeLocale:pending?.locale??(dynamic?site.locale:route.locale)}}><div ref={container} data-artwork-slot={slot??"none"} data-artwork-route={pathname}>
    <div ref={background} className={styles.origin} data-editorial-layout data-artwork-background inert={active||undefined} aria-hidden={active||undefined}>{!(isArtwork&&!intercepted)&&children}</div>
    {!pendingShell&&isArtwork&&(!intercepted?canonical:artwork)}
    {pendingShell&&!restoring&&<ArtworkDialogShell artworkRef={pending?.reference} locale={pending?.locale}>
      <ArtworkRouteState status={pending?.status===404?"unavailable":pending?.status?"error":"loading"} retry={()=>{const request=visits.current!.retry();if(request)void resolve(request);}}/>
    </ArtworkDialogShell>}
    <ArtworkReturnOverlay/>
  </div></ArtworkNavigationContext>;
}
