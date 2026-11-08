'use client';
import {useEffect,type RefObject} from 'react';
type Attempt={snapshot:()=>{status:string};start:()=>void;pause:()=>void;resume:()=>void;remaining:()=>number;loaded:()=>void;timeout:()=>void};
/** Browsers may suspend hidden tabs and lazy images behind an inert modal. */
export function useImageLoadingBudget(image:RefObject<HTMLImageElement|null>,attempt:Attempt,source:string|undefined,onTimeout:()=>void){
 useEffect(()=>{
  const node=image.current;if(!node||!source)return;
  let near=false,timer:ReturnType<typeof setTimeout>|undefined;
  const sync=()=>{
   clearTimeout(timer);
   if(node.complete&&node.naturalWidth>0){attempt.loaded();return;}
   if(document.hidden||!near||node.closest('[inert]')){attempt.pause();return;}
   attempt.resume();attempt.start();
   if(attempt.snapshot().status!=='loading')return;
   timer=setTimeout(()=>{
    if(node.complete&&node.naturalWidth>0){attempt.loaded();return;}
    if(document.hidden||node.closest('[inert]')){attempt.pause();return;}
    onTimeout();attempt.timeout();
   },attempt.remaining());
  };
  const observer=new IntersectionObserver(entries=>{near=entries.some(entry=>entry.isIntersecting);sync();},{rootMargin:'200px'});observer.observe(node);
  // Observe only ancestors: opening a modal makes the retained catalogue inert.
  const mutations=new MutationObserver(sync);for(let parent=node.parentElement;parent;parent=parent.parentElement)mutations.observe(parent,{attributes:true,attributeFilter:['inert']});
  document.addEventListener('visibilitychange',sync);sync();
  return()=>{clearTimeout(timer);observer.disconnect();mutations.disconnect();document.removeEventListener('visibilitychange',sync);attempt.pause();};
 },[image,attempt,source,onTimeout]);
}
