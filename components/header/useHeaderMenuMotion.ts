'use client';
import {useRef,useLayoutEffect,type RefObject} from 'react';
import {gsap} from 'gsap';
import {useGSAP} from '@gsap/react';
gsap.registerPlugin(useGSAP);
export const menuCloseMs=1000;
/** The same two-axis frosted expansion as the artwork information panel, from the header. */
export function useHeaderMenuMotion(header:RefObject<HTMLElement|null>,compact:boolean,phase:'closed'|'open'|'closing'){
 const timeline=useRef<gsap.core.Timeline|null>(null);
 const target=useRef(phase);useLayoutEffect(()=>{target.current=phase;},[phase]);
 useGSAP((_,safe)=>{
  const root=header.current,surface=root?.querySelector<HTMLElement>('[data-menu-surface]');if(!root||!surface||!compact)return;
  const edges=Array.from(surface.querySelectorAll<HTMLElement>('[data-menu-edge]'));
  let lastSize="";
  const build=safe!(()=>{
   timeline.current?.kill();const {width,height}=surface.getBoundingClientRect();lastSize=`${width}:${height}`;const motion={width:48,height:48};
   const draw=()=>{surface.style.clipPath=`inset(0px 0px ${Math.max(0,height-motion.height)}px ${Math.max(0,width-motion.width)}px)`;const x=width-motion.width;
    edges[0]!.style.cssText=`width:${motion.width}px;transform:translate(${x}px,0)`;
    edges[1]!.style.cssText=`width:${motion.width}px;transform:translate(${x}px,${motion.height-1}px)`;
    edges[2]!.style.cssText=`height:${motion.height}px;transform:translate(${x}px,0)`;
    edges[3]!.style.cssText=`height:${motion.height}px;transform:translate(${width-1}px,0)`;
   };
   timeline.current=gsap.timeline({paused:true,onUpdate:draw}).to(motion,{width,duration:.4,ease:'power3.inOut'},0).to(motion,{height,duration:.6,ease:'power3.inOut'},.4);
   timeline.current.progress(target.current==='open'?1:0);draw();
  });
  build();const observer=new ResizeObserver(()=>{const {width,height}=surface.getBoundingClientRect();if(lastSize!==`${width}:${height}`)build();});observer.observe(surface);
  return()=>{observer.disconnect();timeline.current?.kill();timeline.current=null;surface.style.removeProperty('clip-path');edges.forEach(edge=>edge.removeAttribute('style'));};
 },{scope:header,dependencies:[compact],revertOnUpdate:true});
 useGSAP(()=>{
  const t=timeline.current;if(!t)return;
  if(matchMedia('(prefers-reduced-motion:reduce)').matches){t.pause().progress(phase==='open'?1:0);return;}
  if(phase==='open')t.play();else if(phase==='closing')t.reverse();else t.pause(0);
 },{scope:header,dependencies:[phase,compact]});
}
