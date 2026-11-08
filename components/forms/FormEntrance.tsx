"use client";
import {useRef,type ReactNode} from "react";
import {useGSAP} from "@gsap/react";
import {gsap} from "gsap";
import {createFormAppearance,type FormAnimation} from "@/lib/forms/appearance";
gsap.registerPlugin(useGSAP);
export type {FormAnimation} from "@/lib/forms/appearance";
/** Visually approved on 2026-11-05; input interaction always finishes the appearance. */
export function FormEntrance({children,animation="form-fade",enabled=true,reducedMotion=false,replay=0}:{children:ReactNode;animation?:FormAnimation;enabled?:boolean;reducedMotion?:boolean;replay?:number}){
 const root=useRef<HTMLDivElement>(null),timeline=useRef<gsap.core.Timeline|null>(null);
 useGSAP(()=>{
  if(!root.current||!enabled)return;const media=gsap.matchMedia();
  media.add({reduce:"(prefers-reduced-motion: reduce)",ordinary:"(prefers-reduced-motion: no-preference)"},context=>{
   if(reducedMotion||context.conditions?.reduce)return;
   const tl=createFormAppearance(root.current!,animation);timeline.current=tl;tl.play();
   return()=>{timeline.current=null;};
  });return()=>media.revert();
 },{scope:root,dependencies:[animation,enabled,reducedMotion,replay],revertOnUpdate:true});
 // Any interaction completes the appearance immediately; it never gates form use.
 function finish(){timeline.current?.progress(1);}
 return <div ref={root} onFocusCapture={finish} onPointerDownCapture={finish}>{children}</div>;
}
