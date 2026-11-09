'use client';
import {useRef,useLayoutEffect,type RefObject} from 'react';
import {gsap} from 'gsap';
import {useGSAP} from '@gsap/react';
gsap.registerPlugin(useGSAP);
/** One reversible drawing: burger endpoints → full width → lower edge → menu. */
export function useHeaderMenuMotion(header:RefObject<HTMLElement|null>,compact:boolean,phase:'closed'|'open'|'closing',onClosed:()=>void){
 const timeline=useRef<gsap.core.Timeline|null>(null);
 const target=useRef(phase),closed=useRef(onClosed);
 useLayoutEffect(()=>{target.current=phase;closed.current=onClosed;},[phase,onClosed]);
 useGSAP((_,safe)=>{
  const root=header.current,surface=root?.querySelector<HTMLElement>('[data-menu-surface]'),icon=root?.querySelector<HTMLElement>('[data-menu-icon]');
  if(!root||!surface||!icon||!compact)return;
  const fill=surface.querySelector<HTMLElement>('[data-menu-fill]')!,scrim=root.querySelector<HTMLElement>('[data-menu-scrim]')!;
  const edges=Array.from(surface.querySelectorAll<HTMLElement>('[data-menu-edge]'));
  const lines=Array.from(icon.children),content=Array.from(root.querySelectorAll<HTMLElement>('[data-menu-content]'));
  let lastSize='';
  const build=safe!(()=>{
   const progress=timeline.current?.progress()??(target.current==='open'?1:0);timeline.current?.kill();
   const bounds=surface.getBoundingClientRect(),source=icon.getBoundingClientRect();
   const style=getComputedStyle(surface),left=parseFloat(style.paddingLeft),right=parseFloat(style.paddingRight),bottom=parseFloat(style.paddingBottom);
   const top=root.getBoundingClientRect().bottom;
   lastSize=`${bounds.width}:${bounds.height}:${source.x}:${source.y}:${top}`;
   const motion={x:source.left,y:source.top+source.height/2-4,width:source.width,height:8,join:0,fill:0};
   const draw=()=>{
    const time=timeline.current?.time()??0;root.dataset.menuMotion=target.current==='closed'?'closed':time<.16?'joining':time<.56?'extending':time<1.16?'descending':(timeline.current?.progress()??0)<1?'revealing':'open';
    fill.style.cssText=`left:${motion.x}px;top:${motion.y}px;width:${motion.width}px;height:${motion.height}px;opacity:${motion.fill}`;
    Object.assign(edges[0]!.style,{width:`${motion.width}px`,transform:`translate(${motion.x}px,${motion.y}px)`});
    Object.assign(edges[1]!.style,{width:`${motion.width}px`,transform:`translate(${motion.x}px,${motion.y+motion.height}px)`});
    Object.assign(edges[2]!.style,{height:`${motion.height*motion.join}px`,transform:`translate(${motion.x}px,${motion.y}px)`});
    Object.assign(edges[3]!.style,{height:`${motion.height*motion.join}px`,transform:`translate(${motion.x+motion.width-1}px,${motion.y}px)`});
   };
   gsap.set(edges,{color:getComputedStyle(icon).color,opacity:1});
   gsap.set(lines,{opacity:0,rotation:0,y:(i:number)=>i===0?-4:4});gsap.set(content,{opacity:0,y:10});gsap.set(scrim,{opacity:0});
   const t=gsap.timeline({paused:true,onUpdate:draw,onReverseComplete:()=>{if(target.current==='closing')closed.current();}});
   t.addLabel('join',0).to(motion,{join:1,duration:.16,ease:'power2.inOut'},'join')
    .addLabel('extend').to(motion,{x:left,y:top,width:bounds.width-left-right,fill:1,duration:.4,ease:'power3.inOut'},'extend')
    .to(scrim,{opacity:1,duration:.4,ease:'power2.inOut'},'extend')
    .to(edges,{color:getComputedStyle(root).getPropertyValue('--site-color-inverseText').trim(),opacity:.35,duration:.4},'extend')
    .to(lines,{opacity:1,rotation:(i:number)=>i===0?45:-45,y:0,duration:.24,ease:'power2.inOut'},'extend+=.16')
    .addLabel('descend').to(motion,{height:Math.max(8,bounds.height-bottom-top),duration:.6,ease:'power3.inOut'},'descend')
    .addLabel('reveal').to(content,{opacity:1,y:0,duration:.28,stagger:.025,ease:'power2.out'},'reveal');
   timeline.current=t;t.progress(progress);draw();
   if(target.current==='closed')gsap.set(lines,{opacity:1,rotation:0,y:(i:number)=>i===0?-4:4});
   if(target.current==='open')t.play();else if(target.current==='closing')t.reverse();
  });
  build();const observer=new ResizeObserver(()=>{
   const b=surface.getBoundingClientRect(),s=icon.getBoundingClientRect(),top=root.getBoundingClientRect().bottom;
   if(lastSize!==`${b.width}:${b.height}:${s.x}:${s.y}:${top}`)build();
  });observer.observe(surface);observer.observe(root);
  return()=>{observer.disconnect();timeline.current?.kill();timeline.current=null;delete root.dataset.menuMotion;[fill,scrim,...edges,...lines,...content].forEach(node=>node.removeAttribute('style'));};
 },{scope:header,dependencies:[compact],revertOnUpdate:true});
 useGSAP(()=>{
  const t=timeline.current;if(!t)return;
  const root=header.current,lines=root?.querySelectorAll('[data-menu-icon] > span');
  if(phase==='closed')root?.setAttribute('data-menu-motion','closed');
  if(matchMedia('(prefers-reduced-motion:reduce)').matches){t.pause().progress(phase==='open'?1:0);if(phase!=='open'&&lines)gsap.set(lines,{opacity:1,rotation:0,y:(i:number)=>i===0?-4:4});if(phase==='closing')closed.current();return;}
  if(phase==='open'){if(t.time()===0&&lines)gsap.set(lines,{opacity:0});t.play();}
  else if(phase==='closing'){if(t.time()===0)closed.current();else t.reverse();}
  else {t.pause(0);if(lines)gsap.set(lines,{opacity:1,rotation:0,y:(i:number)=>i===0?-4:4});}
 },{scope:header,dependencies:[phase,compact]});
}
