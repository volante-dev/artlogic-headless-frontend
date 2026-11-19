"use client";
import {useLayoutEffect,useRef,type RefObject} from "react";
/** Defer scroll geometry changes until the information column has finished resizing. */
export function useArtworkDesktopShape(root:RefObject<HTMLElement|null>,landscape:boolean,enhanced:boolean){
 const previous=useRef(landscape);
 useLayoutEffect(()=>{
  const node=root.current,changed=previous.current!==landscape;previous.current=landscape;
  if(!node||!changed||!enhanced)return;
  node.setAttribute("data-artwork-shape-transition","running");
  const finish=()=>{node.removeAttribute("data-artwork-shape-transition");node.dispatchEvent(new Event("artwork-shape-settled"));};
  const timer=window.setTimeout(finish,650);
  const visibility=()=>{if(document.hidden){clearTimeout(timer);finish();}};
  document.addEventListener("visibilitychange",visibility);
  return()=>{clearTimeout(timer);document.removeEventListener("visibilitychange",visibility);node.removeAttribute("data-artwork-shape-transition");};
 },[root,landscape,enhanced]);
}
