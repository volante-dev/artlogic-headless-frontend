"use client";
import {useLayoutEffect,useRef,type ReactNode} from "react";
/** Media only: the inspection transform and all controls live outside this layer. */
export function ArtworkMediaTransition({active,zoomOut=false,children}:{active:boolean;zoomOut?:boolean;children:ReactNode}){
 const root=useRef<HTMLDivElement>(null),previous=useRef(active);
 useLayoutEffect(()=>{const changed=previous.current!==active;previous.current=active;const node=root.current;if(!node||!changed||matchMedia("(prefers-reduced-motion:reduce)").matches)return;
  const animation=node.animate(active?[{opacity:0,transform:zoomOut?"scale(1.035)":"none"},{opacity:1,transform:"none"}]:[{opacity:1,transform:"none"},{opacity:0,transform:"none"}],{duration:600,easing:"cubic-bezier(.16,1,.3,1)"});
  const stop=()=>animation.cancel(),visibility=()=>{if(document.hidden)stop();},motion=matchMedia("(prefers-reduced-motion:reduce)");motion.addEventListener("change",stop);document.addEventListener("visibilitychange",visibility);
  return ()=>{stop();motion.removeEventListener("change",stop);document.removeEventListener("visibilitychange",visibility);};
 },[active,zoomOut]);
 return <div ref={root} data-artwork-media-transition style={{position:"absolute",inset:0,opacity:active?1:0,pointerEvents:active?undefined:"none"}}>{children}</div>;
}
