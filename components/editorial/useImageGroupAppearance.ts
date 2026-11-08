'use client';
import {useRef,type RefObject} from 'react';
import gsap from 'gsap';
import {useGSAP} from '@gsap/react';
import {createImageGroupAppearance,type GroupAppearance} from './immersive/image-group-motion';
import {useEditorialReducedMotion} from '../../lib/editorial/preferences';
gsap.registerPlugin(useGSAP);
/** Classic entrance only. Immersive ownership belongs exclusively to the article orchestrator. */
export function useImageGroupAppearance(host:RefObject<HTMLElement|null>,blockId:string,appearance:GroupAppearance,mobile:boolean,classic:boolean){
 const entered=useRef<string|null>(null),reduced=useEditorialReducedMotion();
 useGSAP((context,contextSafe)=>{
  if(!contextSafe)return;
  const element=host.current;if(!element||!classic||entered.current===blockId)return;
  let disposed=false;const show=contextSafe(()=>{if(disposed||host.current!==element||entered.current===blockId)return;entered.current=blockId;try{createImageGroupAppearance(appearance,element,reduced).play();}catch{context.revert();}});
  if(typeof IntersectionObserver==='undefined'){show();return;}
  const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();show();}},{threshold:.1});observer.observe(element);return()=>{disposed=true;observer.disconnect();};
 },{scope:host,dependencies:[blockId,appearance,mobile,classic,reduced],revertOnUpdate:true});
}
