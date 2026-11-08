"use client";
import {useCallback,useEffect,useId,useRef,useState,useSyncExternalStore} from "react";
import {useImageLoadingBudget} from "./useImageLoadingBudget";
import {MediaDisplayAttempt} from "./display-state";
import {useMediaDisplayContext} from "./MediaDisplayProvider";
import {sendMediaObservation} from "./observations";
export function useMediaDisplay(path:string|undefined,resourceKind:"artwork"|"siteLogo",resourceId:string|undefined){
 const context=useMediaDisplayContext(),id=useId().replace(/[^A-Za-z0-9_.:-]/g,"_"),image=useRef<HTMLImageElement|null>(null);
 const [local]=useState(()=>new Map<string,MediaDisplayAttempt>()),attempts=context?.attempts??local;
 const key=path??"missing";
 if(!attempts.has(key))attempts.set(key,new MediaDisplayAttempt(key,id,context?.budgetMs??60000));
 const attempt=attempts.get(key)!;
 const state=useSyncExternalStore(attempt.subscribe,attempt.snapshot,attempt.serverSnapshot);
 const failureSource=useRef<string|null>(null);
 const report=useCallback((event:"loaded"|"failed"|"timeout"|"retry")=>{const s=attempt.snapshot();if(!resourceId)return;sendMediaObservation({resourceKind,resourceId,displayId:s.displayId,retry:s.retry,event,elapsedMs:Math.min(180000,Math.max(0,s.startedAt===null?0:Date.now()-s.startedAt))});},[attempt,resourceKind,resourceId]);
 const fail=useCallback(()=>{const source=image.current?.getAttribute("src")??attempt.snapshot().src;if(failureSource.current===source)return;failureSource.current=source;report("failed");const before=attempt.snapshot().retry;attempt.fail();if(attempt.snapshot().retry!==before)report("retry");},[attempt,report]);
 const loaded=useCallback(()=>{if(!image.current?.complete||image.current.naturalWidth===0)return;attempt.loaded();if(attempt.claimLoaded())report("loaded");},[attempt,report]);
 useEffect(()=>{
  const node=image.current;if(!node||!path)return;
  if(node.complete){if(node.naturalWidth>0)loaded();else fail();return;}
 },[attempt,path,loaded,fail,state.src]);
 const timeout=useCallback(()=>report("timeout"),[report]);
 useImageLoadingBudget(image,attempt,path?state.src:undefined,timeout);
 // Listen natively: passing onError to Next/Image causes an uncounted src=self retry at hydration.
 const imageRef=useCallback((node:HTMLImageElement|null)=>{image.current?.removeEventListener("error",fail);image.current=node;node?.addEventListener("error",fail);},[fail]);
 return {image:imageRef,src:state.src,failed:!path||state.status==="fallback",onLoad:loaded,onError:fail,restart:attempt.restart,displayId:state.displayId};
}
