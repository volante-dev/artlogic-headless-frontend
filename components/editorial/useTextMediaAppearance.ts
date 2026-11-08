'use client';
import {useRef,type RefObject} from 'react';
import gsap from 'gsap';
import {useGSAP} from '@gsap/react';
import {useEditorialReducedMotion} from '../../lib/editorial/preferences';
import {prepareEditorialImages} from '../../lib/editorial/immersive/prepare-media';
import {createEditorialAppearance} from './immersive/motion';
import type {AnimationId} from '../../lib/editorial/immersive/motion-catalog';
gsap.registerPlugin(useGSAP);
export function useTextMediaAppearance(host:RefObject<HTMLElement|null>,id:string,animation:AnimationId,classic:boolean){
 const entered=useRef<string|null>(null),reduced=useEditorialReducedMotion();
 useGSAP((context,contextSafe)=>{
  const element=host.current;if(!element||!classic||!contextSafe||entered.current===id)return;
  let disposed=false;const controller=new AbortController();
  const play=contextSafe(()=>{if(disposed||host.current!==element)return;try{gsap.set(element,{autoAlpha:1});createEditorialAppearance(animation,{surface:element,text:element.querySelector<HTMLElement>('[data-editorial-motion-text]'),media:element.querySelector<HTMLElement>('[data-editorial-motion-media]')},1,reduced).play();}catch{context.revert();}});
  const show=contextSafe(()=>{if(disposed||host.current!==element||entered.current===id)return;entered.current=id;if(reduced){play();return;}gsap.set(element,{autoAlpha:0});const paths=Array.from(element.querySelectorAll('img')).map(image=>image.getAttribute("src")??"").filter(Boolean);void prepareEditorialImages(paths,controller.signal).then(result=>{if(result!=='cancelled')play();});});
  if(typeof IntersectionObserver==='undefined'){show();return()=>{disposed=true;controller.abort();};}
  const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();show();}},{threshold:.1});observer.observe(element);return()=>{disposed=true;controller.abort();observer.disconnect();};
 },{scope:host,dependencies:[id,animation,classic,reduced],revertOnUpdate:true});
}
