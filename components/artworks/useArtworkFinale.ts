"use client";
import {useRef,useLayoutEffect,useCallback,type RefObject} from "react";
import gsap from "gsap";
import {useGSAP} from "@gsap/react";
import {coverBitmap,commonFinaleCardRect,initialCrop,coverCardTransform} from "../../lib/artworks/finale-geometry";
import type {FinalePhoto} from "./ArtworkFinaleMedia";
import {setFinaleBitmap} from "./ArtworkFinaleMedia";
gsap.registerPlugin(useGSAP);
/** Approved motion profile shared by the executable visual comparator. */
export function useArtworkFinale(root:RefObject<HTMLDivElement|null>,photos:readonly FinalePhoto[],options:{reduced:boolean;enabled?:boolean;onSettled?:(finale:boolean)=>void}){
 const planes=useRef<HTMLElement[]>([]);
 const timeline=useRef<gsap.core.Timeline|null>(null),driver=useRef<gsap.core.Tween|null>(null),target=useRef(false),settled=useRef(options.onSettled);
 useLayoutEffect(()=>{settled.current=options.onSettled;},[options.onSettled]);
 const {contextSafe}=useGSAP((_,safe)=>{
  const element=root.current;if(!element)return;
  const build=()=>{
   driver.current?.kill();timeline.current?.revert();
   const rect=element.getBoundingClientRect(),viewport={x:0,y:0,width:rect.width,height:rect.height},mobile=rect.width<900&&rect.height>500;
   const entry=element.querySelector<HTMLElement>("[data-finale-start-frame]")?.getBoundingClientRect();
   const frame=entry?{x:entry.x-rect.x,y:entry.y-rect.y,width:entry.width,height:entry.height}:viewport;
   const destination=commonFinaleCardRect(viewport,mobile,frame);
   const cards=Array.from(element.querySelectorAll<HTMLElement>("[data-finale-card]"));planes.current=cards;
   const tl=gsap.timeline({paused:true,defaults:{ease:"power3.inOut"}});
   cards.forEach(card=>{
    const photo=photos.find(p=>p.id===card.dataset.mediaId);if(!photo)return;
    const bitmap=coverBitmap(frame,photo),transform=coverCardTransform(bitmap,destination);
    setFinaleBitmap(card,bitmap);
    const front=card.dataset.front==="true",layer=front?0:photos.findIndex(p=>p.id===photo.id);
    gsap.set(card,{x:0,y:0,z:front?0:-layer,scale:1,rotationY:0,rotationZ:0,clipPath:initialCrop(bitmap,frame),opacity:front?1:0});
    tl.to(card,{x:transform.x+(mobile?layer*18:layer*42),y:transform.y,z:-layer*(mobile?50:92),scale:transform.scale,rotationY:0,rotationZ:0,duration:1.55},front?0:.12+layer*.025);
    const image=card.querySelector("img");
    gsap.set(image,{filter:"blur(0px) brightness(1)"});
    if(!front)tl.to(image,{filter:`blur(${layer*.6}px) brightness(${Math.max(.55,1-layer*.12)})`,duration:1.15,ease:"power2.inOut"},.18);
    if(!front)tl.to(card,{opacity:1,duration:.18,ease:"none"},.2+layer*.035);
   });
   const veil=element.querySelector("[data-finale-mobile-veil]"),black=element.querySelector("[data-finale-black]"),reading=element.querySelector<HTMLElement>("[data-finale-reading]");
   const identity=element.querySelector<HTMLElement>("[data-finale-identity]"),contact=element.querySelector<HTMLElement>("[data-finale-contact]"),details=element.querySelector<HTMLElement>("[data-finale-details]");
   if(veil)gsap.set(veil,{opacity:0});
   gsap.set(black,{opacity:0});gsap.set(reading,{opacity:mobile?0:1,y:0});
   gsap.set(identity,{y:0,opacity:1,color:"#101314"});gsap.set(contact,{y:0,opacity:1,"--finale-contact-rule":0});
   const identityRect=identity?.getBoundingClientRect(),contactRect=contact?.getBoundingClientRect();
   const offset=mobile?0:rect.y+rect.height*.18-(identityRect?.y??rect.y);
   const existingTop=(identityRect?.height??0)+(mobile||rect.height<500?12:16);
   if(details)gsap.set(details,{top:existingTop,opacity:1,y:0,clipPath:"none"});
   const contactOffset=mobile?0:(identityRect?.y??rect.y)+offset+(identityRect?.height??0)+32-(contactRect?.y??0);
   gsap.set(identity,{y:offset});gsap.set(contact,{y:contactOffset});
   const contactButton=contact?.querySelector("button,a")??null;gsap.set(contactButton,{backgroundColor:"#3c554a",color:"#ffffff"});
   tl.to(black,{opacity:1,duration:1.25,ease:"power2.inOut"},.08);
   if(mobile&&veil)tl.to(veil,{opacity:1,duration:1.25,ease:"power2.inOut"},.08);
   tl.to(identity,{y:0,color:"#f6f7f6",duration:1.35},0);
   tl.to(contact,{y:0,duration:1.5},0);
   tl.to(contact,{"--finale-contact-rule":1,duration:.7},.7);
   tl.to(contactButton,{backgroundColor:"#f6f7f6",color:"#101314",duration:1.25},.08);
   const textParts=Array.from(details?.children??[]);
   if(textParts.length){
    gsap.set(textParts,{opacity:0,x:-10});
    tl.to(textParts,{opacity:1,x:0,duration:.85,stagger:.08,ease:"power3.out"},.7);
   }
   if(mobile)tl.to(reading,{opacity:1,duration:.65},.65);
   timeline.current=tl;tl.progress(target.current?1:0);
  };
  build();let resizeFrame=0;
  const rebuild=safe!(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(build);});
  const observer=new ResizeObserver(rebuild);observer.observe(element);
  const visibility=safe!(()=>{if(document.hidden){driver.current?.kill();timeline.current?.progress(target.current?1:0);settled.current?.(target.current);}});
  document.addEventListener("visibilitychange",visibility);
  return ()=>{cancelAnimationFrame(resizeFrame);observer.disconnect();document.removeEventListener("visibilitychange",visibility);driver.current?.kill();timeline.current?.kill();timeline.current=null;};
 },{scope:root,dependencies:[photos,options.reduced,options.enabled],revertOnUpdate:true});
 const go=useCallback((finale:boolean)=>{contextSafe(()=>{
  target.current=finale;driver.current?.kill();const tl=timeline.current;if(!tl)return;
  if(finale)for(const card of planes.current.filter(card=>card.dataset.front!=="true")){
   const image=card.querySelector("img");gsap.set(card,{visibility:image?.dataset.finaleDecoded==="true"?"visible":"hidden"});
  }
  if(options.reduced){tl.progress(finale?1:0);settled.current?.(finale);return;}
  driver.current=gsap.to(tl,{progress:finale?1:0,duration:Math.max(.18,Math.abs((finale?1:0)-tl.progress())*1.65),ease:"none",onComplete:()=>settled.current?.(finale)});
 })();},[contextSafe,options.reduced]);
 return {go,progress:()=>timeline.current?.progress()??0};
}
