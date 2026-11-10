"use client";
import {ArtworkInitialDocument} from "./ArtworkInitialDocument";
import {claimArtworkDocument} from "../../lib/artworks/document-state";
import {useLayoutEffect,useRef,useState} from "react";
import {useRouter} from "next/navigation";
import type {GalleryExperience} from "../../lib/artworks/types";
import type {PublicPresentation} from "../../lib/presentation/types";
import {readArtworkExperience,ArtworkReadError} from "../../lib/artworks/browser";
import {ArtworkRouteState} from "./ArtworkRouteState";
import {ArtworkDocumentRenderer} from "../../page-composer/ArtworkDocumentRenderer";
import {useArtworkNavigation} from "./ArtworkNavigationContext";
import {useSiteContent} from "../SiteContentProvider";
import {SiteThemeProvider} from "../../branding/SiteThemeProvider";
import {useSiteLocale} from "../SiteLocaleBoundary";
import {ArtworkInteractionBoundary} from "./ArtworkInteractionBoundary";
type Reading={generation:number;data:GalleryExperience|null;status:number|null};
/** No retained public projection is revealed until the current visibility and release agree. */
function ArtworkFreshnessContent({initial,presentation,siteName,demonstration}:{initial:GalleryExperience;presentation:PublicPresentation;siteName:string;demonstration?:boolean}){
  const router=useRouter(),navigation=useArtworkNavigation(),generation=useRef(0),content=useRef<HTMLDivElement>(null),restored=useRef(0),[attempt,retry]=useState(0);
  const rememberVisual=navigation?.rememberVisual,readVisual=navigation?.readVisual,visitToken=navigation?.visitToken,activation=navigation?.activation??0;
  const readingToken=useRef<string|null>(null);
  const {messages}=useSiteContent(),genericTitle=messages["gallery.presentation"]+" — "+siteName,untitled=messages["artwork.untitled"];
  const translation=useSiteLocale()?.translation,translated=translation?.artwork?.artwork.id===initial.artwork.id&&translation.presentation.releaseId===presentation.releaseId?translation:null;
  const liveLocale=useRef({genericTitle,locale:initial.locale});
  useLayoutEffect(()=>{liveLocale.current={genericTitle,locale:translated?.locale??initial.locale};},[genericTitle,translated?.locale,initial.locale]);
  const [reading,setReading]=useState<Reading>({generation:0,data:null,status:null});
  const visibleData=reading.data&&translated?.artwork&&reading.data.locale!==translated.locale?translated.artwork:reading.data;
  useLayoutEffect(()=>{
    if(!claimArtworkDocument())return;
    const wrapper=content.current,epoch=generation,visualToken=visitToken?.()??null;
    readingToken.current=visualToken;
    let request:AbortController|null=null,alive=true,hasData=false;
    const validate=async()=>{
      const dialog=wrapper?.closest<HTMLElement>("[role=dialog]");if(hasData&&dialog)rememberVisual?.(dialog.scrollTop,visualToken);hasData=false;
      request?.abort();request=new AbortController();const current=++generation.current,signal=AbortSignal.any([request.signal,AbortSignal.timeout(10000)]);
      if(wrapper)wrapper.style.visibility="hidden";
      document.title=liveLocale.current.genericTitle;
      setReading({generation:current,data:null,status:null});
      if(document.visibilityState==="hidden")return;
      try{
        const data=await readArtworkExperience(initial.artwork.slug,liveLocale.current.locale,signal);
        if(!alive||current!==generation.current)return;
        if(data.artwork.id!==initial.artwork.id)throw new ArtworkReadError(503);
        if(data.presentationReleaseId!==presentation.releaseId){router.refresh();setReading({generation:current,data:null,status:503});return;}
        hasData=true;setReading({generation:current,data,status:null});
      }catch(error){if(!alive||request.signal.aborted||current!==generation.current)return;setReading({generation:current,data:null,status:error instanceof ArtworkReadError?error.status:503});}
    };
    void validate();const visibility=()=>void validate();document.addEventListener("visibilitychange",visibility);window.addEventListener("artwork-revalidate",visibility);
    return ()=>{const dialog=wrapper?.closest<HTMLElement>("[role=dialog]");if(hasData&&dialog)rememberVisual?.(dialog.scrollTop,visualToken);alive=false;request?.abort();epoch.current++;if(wrapper)wrapper.style.visibility="hidden";document.removeEventListener("visibilitychange",visibility);window.removeEventListener("artwork-revalidate",visibility);};
  },[initial.artwork.id,initial.artwork.slug,initial.locale,presentation.releaseId,attempt,router,rememberVisual,visitToken,activation]);
  useLayoutEffect(()=>{
    if(!content.current)return;const valid=reading.data&&reading.generation===generation.current;content.current.style.visibility=valid?"visible":"hidden";
    document.title=valid?(visibleData!.artwork.title??untitled)+" — "+siteName:genericTitle;
    if(valid&&restored.current!==reading.generation){
      restored.current=reading.generation;content.current.closest<HTMLElement>("[role=dialog]")?.scrollTo({top:readVisual?.(readingToken.current)??0,behavior:"instant"});
      window.dispatchEvent(new CustomEvent("artwork-origin-ready",{detail:{nonce:crypto.randomUUID(),href:location.pathname+location.search}}));
    }
  },[reading,visibleData,readVisual,genericTitle,untitled,siteName]);
  return <>
    {reading.generation===0&&<ArtworkInitialDocument content={initial}/>}
    {!reading.data&&<ArtworkRouteState status={reading.status===404?"unavailable":reading.status?"error":"loading"} retry={()=>retry(n=>n+1)}/>}
    <div ref={content} style={{visibility:"hidden"}}>{visibleData&&<SiteThemeProvider theme={presentation.theme} fonts={presentation.fontFiles}><ArtworkDocumentRenderer presentation={translated?.presentation??presentation} content={visibleData} siteName={siteName} demonstration={demonstration}/></SiteThemeProvider>}</div>
  </>;
}

export function ArtworkFreshnessBoundary(props:Parameters<typeof ArtworkFreshnessContent>[0]){return <ArtworkInteractionBoundary key={props.initial.artwork.id} artworkId={props.initial.artwork.id} mediaIds={props.initial.artwork.media.map(m=>m.id)}><ArtworkFreshnessContent {...props}/></ArtworkInteractionBoundary>;}
