'use client';
import {useLayoutEffect,useRef,type RefObject} from 'react';
import {gsap} from 'gsap';
import {useGSAP} from '@gsap/react';
gsap.registerPlugin(useGSAP);
export function useArtworkTypeFilterMotion(root:RefObject<HTMLElement|null>,open:boolean){
 const timeline=useRef<gsap.core.Timeline|null>(null),target=useRef(open);useLayoutEffect(()=>{target.current=open;},[open]);
 useGSAP((_,safe)=>{
  const el=root.current,panel=el?.querySelector<HTMLElement>('[data-type-panel]'),content=el?.querySelector<HTMLElement>('[data-type-content]');if(!el||!panel||!content)return;
  const media=matchMedia('(prefers-reduced-motion: reduce)');let frame=0,lastHeight=-1;
  const build=safe!(()=>{
   const height=content.getBoundingClientRect().height;if(height===lastHeight&&timeline.current)return;lastHeight=height;
   const progress=timeline.current?.progress()??(target.current?1:0);timeline.current?.kill();
   const t=gsap.timeline({paused:true,onComplete:()=>{panel.style.height='auto';},onUpdate:()=>{el.dataset.typeMotion=t.progress()===0?'closed':t.progress()===1?'open':target.current?'opening':'closing';}})
    .fromTo(panel,{height:0},{height,duration:1.05,ease:'power3.inOut'},0)
    .fromTo(content,{opacity:0,y:8},{opacity:1,y:0,duration:.35,ease:'power2.out'},.65)
    .fromTo(content.querySelectorAll('[data-type-option]'),{opacity:0},{opacity:1,duration:.35,stagger:{amount:.15},ease:'power2.out'},.65);
   timeline.current=t;t.progress(media.matches?(target.current?1:0):progress);if(!media.matches){if(target.current)t.play();else t.reverse();}
  });
  build();const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(build);};const observer=new ResizeObserver(schedule);observer.observe(content);window.addEventListener('resize',schedule);const preference=()=>{timeline.current?.progress(target.current?1:0).pause();};media.addEventListener('change',preference);void document.fonts.ready.then(schedule);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('resize',schedule);media.removeEventListener('change',preference);timeline.current?.kill();timeline.current=null;};
 },{scope:root});
 useLayoutEffect(()=>{const t=timeline.current,panel=root.current?.querySelector<HTMLElement>('[data-type-panel]');if(!t||!panel)return;if(matchMedia('(prefers-reduced-motion: reduce)').matches){t.progress(open?1:0).pause();panel.style.height=open?'auto':'0px';return;}if(!open&&t.progress()===1)panel.style.height=`${panel.getBoundingClientRect().height}px`;if(open)t.play();else t.reverse();},[open,root]);
}
