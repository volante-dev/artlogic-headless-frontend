"use client";
import {useRef,type RefObject} from "react";
import {useGSAP} from "@gsap/react";
import {gsap} from "gsap";
gsap.registerPlugin(useGSAP);

/** One observer for the list, one entrance per card. Source order and geometry stay intact. */
export function useCatalogEntrance(root:RefObject<HTMLElement|null>){
 const seen=useRef(new WeakSet<HTMLElement>());
 useGSAP(()=>{
  const list=root.current;if(!list||typeof IntersectionObserver==="undefined")return;
  const media=gsap.matchMedia();
  media.add({desktop:"(min-width: 768px)",motion:"(prefers-reduced-motion: no-preference)",reduce:"(prefers-reduced-motion: reduce)"},context=>{
   if(context.conditions?.reduce)return;
   const ranks=new Map<HTMLElement,number>(),tracked=new WeakSet<HTMLElement>();
   const desktop=Boolean(context.conditions?.desktop);
   const reveal=(card:HTMLElement,animate=true)=>{
    if(seen.current.has(card))return;seen.current.add(card);observer.unobserve(card);
    context.add(()=>{if(animate)gsap.to(card,{opacity:1,x:0,y:0,duration:desktop?0.55:0.4,delay:desktop?(ranks.get(card)??0)*.12:0,ease:"power3.out",clearProps:"opacity,transform"});else gsap.set(card,{clearProps:"opacity,transform"});});
   };
   const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)reveal(entry.target as HTMLElement);},{rootMargin:"0px 0px -24px 0px",threshold:0});
   const scan=()=>context.add(()=>{
    const cards=[...list.querySelectorAll<HTMLElement>("[data-artwork-card]")],rows=new Map<number,HTMLElement[]>();
    // Read geometry before writing transforms; offsetTop preserves actual grid rows.
    for(const card of cards){const top=card.offsetTop;rows.set(top,[...rows.get(top)??[],card]);}
    for(const row of rows.values())row.sort((a,b)=>a.offsetLeft-b.offsetLeft).forEach((card,index)=>ranks.set(card,index));
    for(const card of cards){if(seen.current.has(card)||tracked.has(card))continue;tracked.add(card);if(card.getBoundingClientRect().bottom<0){seen.current.add(card);continue;}gsap.set(card,{opacity:.55,x:desktop?-18:0,y:desktop?12:10});observer.observe(card);}
   });
   scan();const additions=new MutationObserver(scan);additions.observe(list,{childList:true});
   const focus=(event:FocusEvent)=>{const card=(event.target as Element)?.closest<HTMLElement>("[data-artwork-card]");if(card){gsap.killTweensOf(card);reveal(card,false);gsap.set(card,{clearProps:"opacity,transform"});}};
   list.addEventListener("focusin",focus);
   return()=>{observer.disconnect();additions.disconnect();list.removeEventListener("focusin",focus);};
  });
  return()=>media.revert();
 },{scope:root});
}
