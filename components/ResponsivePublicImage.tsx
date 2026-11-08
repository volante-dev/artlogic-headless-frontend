'use client';
/* eslint-disable @next/next/no-img-element -- Native srcset selects direct Storage/CDN renditions. */
import{useSiteContent}from'./SiteContentProvider';
import{useCallback,useId,useRef,useEffect,useState,useSyncExternalStore,useMemo,type ImgHTMLAttributes}from'react';
import{useMediaDisplayContext}from'../lib/media/MediaDisplayProvider';
import{useImageLoadingBudget}from'../lib/media/useImageLoadingBudget';
import{ResponsiveImageAttempt}from'../lib/media/responsive-display-state';
import{buildImageAttributes,referenceImagePath,parseImageQuery,type ImageResource,type ImageDescriptor}from'../lib/media/public-image-url';
import{sendImageObservation,type ImageObservation}from'../lib/media/image-observations';
export interface ResponsivePublicImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>,'src'|'srcSet'|'sizes'|'onError'|'resource'>{resource:ImageResource;descriptor?:ImageDescriptor;sizes:string;fallbackPath?:string;eager?:boolean;forceReference?:boolean;slot?:string;allowRetry?:boolean;onTerminalFailure?:()=>void}
export function ResponsivePublicImage({resource:inputResource,descriptor:provided,sizes,fallbackPath,eager=false,forceReference=false,slot,allowRetry=false,onTerminalFailure,alt='',...props}:ResponsivePublicImageProps){
 const {resourceKind,resourceId}=inputResource,resource=useMemo(()=>({resourceKind,resourceId}),[resourceKind,resourceId]);
 const site=useSiteContent(),context=useMediaDisplayContext(),instance=useId().replace(/[^A-Za-z0-9_.:-]/g,'_'),node=useRef<HTMLImageElement|null>(null);
 const key=resource.resourceKind+':'+resource.resourceId+':'+(provided?.sourceVersion??'unknown')+':'+(slot??instance);
 const attempt=useMemo(()=>{const existing=context?.responsiveAttempts.get(key);if(existing)return existing;const value=new ResponsiveImageAttempt(context?.budgetMs??60000,Date.now,key,instance);context?.responsiveAttempts.set(key,value);return value;},[context,key,instance]);
 const state=useSyncExternalStore(attempt.subscribe,attempt.snapshot,attempt.serverSnapshot),[resolved,setResolved]=useState<{key:string;descriptor:ImageDescriptor|undefined;done:boolean}>({key:'',descriptor:undefined,done:false});
 const descriptor=provided??(resolved.key===key?resolved.descriptor:undefined),ready=Boolean(provided)||resolved.key===key&&resolved.done,legacy=fallbackPath??referenceImagePath(resource),enabled=context?.responsive??false;
 useEffect(()=>{if(provided||!enabled)return;let alive=true;void(context?.descriptors.requestDescriptor(resource,eager)??Promise.resolve(undefined)).then(d=>{if(alive)setResolved({key,descriptor:d,done:true});});return()=>{alive=false;};},[key,provided,context,enabled,resource,eager]);
 const attributes=enabled&&descriptor&&!state.retry&&!forceReference?buildImageAttributes(descriptor,sizes):{src:state.retry?legacy+(legacy.includes('?')?'&':'?')+'retry=1':enabled&&descriptor?buildImageAttributes(descriptor,sizes).src:legacy,srcSet:undefined,sizes:undefined};
 const displayId=(attempt.displayId+'.'+state.generation).slice(0,160);
 const mountedSource=useRef<string>('');
 const report=useCallback((event:ImageObservation['event'],reason:ImageObservation['fallbackReason']=null)=>{
  const current=attempt.snapshot();let selected:ImageObservation['selectedRendition']=null,mode:ImageObservation['mode']=current.retry||forceReference||!descriptor?'reference':'unknown';
  // Inspect the terminal URL only transiently; retain and send a validated enum, never the URL.
  try{const u=new URL(node.current?.currentSrc??'',location.href);if(u.origin===location.origin&&u.pathname===referenceImagePath(resource)){const q=parseImageQuery(u);if(q.version===descriptor?.sourceVersion){const candidate=descriptor.candidates.find(c=>c.rendition===q.rendition);if(candidate){selected=candidate.rendition;mode=candidate.mode;}}}}catch{/* Selection remains unknown. */}
  if(!reason&&descriptor?.candidates.every(c=>c.mode==='reference'))reason=descriptor.source.mimeType==='image/webp'?'source_limited':'source_untransformable';
  sendImageObservation({...resource,sourceVersion:descriptor?.sourceVersion??null,displayId,retry:current.retry,event,elapsedMs:Math.min(180000,Math.max(0,current.startedAt===null?0:Date.now()-current.startedAt)),requestedRendition:forceReference?'r1-reference':selected,selectedRendition:selected,mode,fallbackReason:reason});
 },[attempt,descriptor,displayId,forceReference,resource]);
 const fail=useCallback(()=>{if(node.current?.complete&&node.current.naturalWidth>0)return;report('failed','transfer_failed');const before=attempt.snapshot().retry;attempt.fail();if(attempt.snapshot().retry!==before)report('retry','transfer_failed');},[attempt,report]);
 const timeout=useCallback(()=>report('timeout','budget_exhausted'),[report]);
 useImageLoadingBudget(node,attempt,enabled&&!ready?undefined:attributes.src,timeout);
 useEffect(()=>{const image=node.current;if(!image||!image.getAttribute('src')||!image.complete)return;const declaration=attributes.src+'|'+attributes.srcSet+'|'+state.generation;if(mountedSource.current===declaration)return;mountedSource.current=declaration;if(image.naturalWidth>0)image.dispatchEvent(new Event('load',{bubbles:true}));else fail();},[attempt,ready,attributes.src,attributes.srcSet,state.generation,fail]);
 useEffect(()=>{if(state.status==='fallback')onTerminalFailure?.();},[state.status,onTerminalFailure]);
 if(state.status==='fallback')return <span role={allowRetry?'group':'img'} aria-label={alt||site.messages['artwork.imageUnavailable']} aria-hidden={!alt&&!allowRetry||undefined} className={props.className} style={{display:'grid',placeItems:'center',aspectRatio:`${props.width??descriptor?.source.width??4}/${props.height??descriptor?.source.height??3}`,...props.style}} data-image-fallback><span>{site.messages['artwork.imageUnavailable']}</span>{allowRetry&&<button type='button' onClick={event=>{const heading=event.currentTarget.closest('[data-artwork-experience]')?.querySelector<HTMLElement>('[data-artwork-focus-heading]');attempt.restart();heading?.focus({preventScroll:true});}}>{site.messages['catalog.retry']}</button>}</span>;
 // An unresolved descriptor must not start a reference download that hydration replaces.
 const src=enabled&&!ready?undefined:attributes.src;
 return <img {...props} data-public-image-path={legacy} data-public-image-resource={resource.resourceKind+":"+resource.resourceId} ref={node} alt={alt} src={src} srcSet={src?attributes.srcSet:undefined} sizes={src?attributes.sizes:undefined} loading={eager?'eager':props.loading??'lazy'} fetchPriority={eager?'high':props.fetchPriority} onError={fail} onLoad={event=>{attempt.loaded();if(attempt.claimLoaded()){report('loaded',!descriptor?'descriptor_unavailable':null);}props.onLoad?.(event);}}/>;
}
