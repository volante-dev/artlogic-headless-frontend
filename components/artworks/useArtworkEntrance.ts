"use client";
import {useLayoutEffect,type RefObject} from "react";
import {useArtworkOpening} from "./ArtworkOpeningBoundary";
/** A visit survives shell replacement; reveal only a decoded primary image or its real fallback. */
export function useArtworkEntrance(root:RefObject<HTMLElement|null>){
 const opening=useArtworkOpening();
 useLayoutEffect(()=>{const element=root.current;if(!element||!opening)return;
  let alive=true,prepared=false;const wasInert=element.inert;
  element.setAttribute("data-artwork-media-ready","false");element.setAttribute("inert","");
  const cleanupRoot=opening.register("root",element),registered=new Map<HTMLElement,()=>void>();
  const prepare=(node:HTMLElement)=>{
   if(prepared)return;
   if(node.matches('[data-artwork-focus-ready="false"],[data-artwork-focus-pending]:not([data-artwork-focus-ready="true"])')||node.querySelector('[data-artwork-focus-ready="false"],[data-artwork-focus-pending]:not([data-artwork-focus-ready="true"])'))return;
   const images=[...node.querySelectorAll<HTMLImageElement>("img")].filter(image=>!image.closest('[aria-hidden="true"]'));
   if(images.some(image=>!image.complete||image.naturalWidth===0))return;
   const reveal=()=>{if(!alive||prepared||!registered.has(node)||!element.contains(node)||images.some(image=>!image.isConnected||image.closest('[aria-hidden="true"]')))return;prepared=true;element.setAttribute("data-artwork-media-ready","true");if(wasInert)element.setAttribute("inert","");else element.removeAttribute("inert");opening.ready(node);if(element.hasAttribute("data-artwork-restore-focus")){element.removeAttribute("data-artwork-restore-focus");element.querySelector<HTMLElement>("[data-artwork-focus-heading]")?.focus({preventScroll:true});}};
   if(images.length)void Promise.all(images.map(image=>image.decode())).then(reveal,()=>{});else reveal();
  };
  const scan=()=>{for(const [node,cleanup]of registered)if(!element.contains(node)){cleanup();registered.delete(node);}
   for(const [kind,selector]of [["identity","[data-artwork-frost-content],[data-artwork-frost]:not(:has([data-artwork-frost-content]))"],["identitySurface","[data-artwork-frost-surface],[data-artwork-frost-frame]"],["timeline","[data-artwork-progress]"],["controls","[data-artwork-entry-controls]"],["media","[data-artwork-entry-media]"]] as const)for(const node of element.querySelectorAll<HTMLElement>(selector)){
    if(!registered.has(node))registered.set(node,opening.register(kind,node,kind==="media"));
    if(kind==="media")prepare(node);
   }
  };
  scan();const observer=new MutationObserver(scan);observer.observe(element,{childList:true,subtree:true,attributes:true,attributeFilter:["aria-hidden","src","loading","data-artwork-focus-ready"]});element.addEventListener("load",scan,true);element.addEventListener("error",scan,true);
  return ()=>{alive=false;observer.disconnect();element.removeEventListener("load",scan,true);element.removeEventListener("error",scan,true);for(const cleanup of registered.values())cleanup();cleanupRoot();if(wasInert)element.setAttribute("inert","");else element.removeAttribute("inert");element.removeAttribute("data-artwork-media-ready");};
 },[opening,root]);
}
