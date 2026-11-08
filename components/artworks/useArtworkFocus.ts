"use client";
import {useLayoutEffect,type RefObject} from "react";
import type {HeroFocus} from "../../lib/artworks/focus";
import {modalFocusGeometry} from "../../lib/artworks/modal-focus-geometry.generated";
/** Focus geometry is installed before the parent's entrance readiness check. */
export function useArtworkFocus(ref:RefObject<HTMLElement|null>,focus:HeroFocus|null|undefined,image:{width:number;height:number}|undefined){
 const x=focus?.x,y=focus?.y,width=image?.width,height=image?.height,id=focus?.mediaId;
 useLayoutEffect(()=>{
  const node=ref.current;if(!node)return;
  const clear=()=>{node.removeAttribute("data-artwork-focus");node.removeAttribute("data-artwork-focus-ready");node.style.removeProperty("--artwork-focus-x");node.style.removeProperty("--artwork-focus-y");};
  if(x===undefined||y===undefined||!width||!height){clear();return;}
  node.setAttribute("data-artwork-focus-ready","false");
  const measure=()=>{const position=modalFocusGeometry(width,height,node.clientWidth,node.clientHeight,{x,y});if(!position)return;
   node.style.setProperty("--artwork-focus-x",position.x*100+"%");node.style.setProperty("--artwork-focus-y",position.y*100+"%");node.setAttribute("data-artwork-focus","true");node.setAttribute("data-artwork-focus-ready","true");};
  measure();const observer=new ResizeObserver(measure);observer.observe(node);
  return()=>{observer.disconnect();clear();};
 },[ref,x,y,width,height,id]);
}
