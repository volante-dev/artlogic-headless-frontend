"use client";
import {createContext,useContext,useMemo,useRef,type RefObject} from "react";
import {controlsCoverage} from "./artwork-dialog-controls-coverage";
export const ArtworkDialogControlsContext=createContext<ReturnType<typeof controlsCoverage>|null>(null);
export const useArtworkDialogControls=()=>useContext(ArtworkDialogControlsContext);
export function useDialogControlsCoverage(ref:RefObject<HTMLDivElement|null>){
 const saved=useRef<{node:HTMLDivElement;inert:boolean;aria:string|null;opacity:string}|null>(null);
 return useMemo(()=>{
  // The callback is invoked only by a lease in a layout effect or GSAP update, never during render.
  // eslint-disable-next-line react-hooks/refs
  return controlsCoverage((coverage,active)=>{
   const node=ref.current;if(!node)return;
   if(active&&!saved.current){saved.current={node,inert:node.inert,aria:node.getAttribute("aria-hidden"),opacity:node.style.opacity};node.inert=true;node.setAttribute("aria-hidden","true");}
   if(active){node.style.opacity=String(1-coverage);}
   else if(saved.current){const prior=saved.current;saved.current=null;prior.node.inert=prior.inert;if(prior.aria===null)prior.node.removeAttribute("aria-hidden");else prior.node.setAttribute("aria-hidden",prior.aria);prior.node.style.opacity=prior.opacity;}
  });
 },[ref]);
}
