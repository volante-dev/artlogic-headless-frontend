'use client';
import {useEffect,useRef} from 'react';
import {useMediaDisplayContext} from '../../../lib/media/MediaDisplayProvider';
import {createEditorialImagePrefetcher,editorialPrefetchPaths,prefetchEditorialImage} from '../../../lib/editorial/immersive/image-prefetch';
import type {Article,EditorialView} from '../../../lib/editorial/immersive/build-views';
export function useEditorialImagePrefetch(article:Article,views:readonly EditorialView[],active:string,enabled:boolean,target:string|null=null){
 const context=useMediaDisplayContext(),worker=useRef<ReturnType<typeof createEditorialImagePrefetcher>|null>(null),current=useRef({active,target});
 useEffect(()=>{current.current={active,target};},[active,target]);
 useEffect(()=>{if(!enabled)return;const abort=new AbortController();
  const start=()=>{if(abort.signal.aborted||document.hidden)return;worker.current??=createEditorialImagePrefetcher(path=>prefetchEditorialImage(path,abort.signal,{responsive:context?.responsive??false,descriptor:resource=>context?.descriptors.requestDescriptor(resource,false)??Promise.resolve(undefined)}),abort.signal,()=>!document.hidden);const index=Math.max(0,views.findIndex(view=>view.id===(current.current.target??current.current.active)));worker.current.prioritize(editorialPrefetchPaths(views,article,current.current.target?index:Math.min(index+1,views.length)));};
  const timer=setTimeout(start,200);document.addEventListener('visibilitychange',start);
  return()=>{clearTimeout(timer);document.removeEventListener('visibilitychange',start);abort.abort();worker.current=null;};
 },[article,views,enabled,context]);
 useEffect(()=>{if(!enabled)return;const index=Math.max(0,views.findIndex(view=>view.id===(target??active)));worker.current?.prioritize(editorialPrefetchPaths(views,article,target?index:Math.min(index+1,views.length)));},[active,target,article,views,enabled]);
}
