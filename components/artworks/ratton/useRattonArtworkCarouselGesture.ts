"use client";
import {useRef,type PointerEvent} from "react";
/** A vertical gesture remains owned by the browser and the reading viewport. */
export function useRattonArtworkCarouselGesture(move:(delta:number)=>void,disabled:boolean){
 const gesture=useRef<{id:number;x:number;y:number}|null>(null);
 const clear=()=>{gesture.current=null;};
 return {
  onPointerDown:(event:PointerEvent<HTMLElement>)=>{if(disabled||!event.isPrimary||event.button!==0||event.target instanceof Element&&event.target.closest("button,a"))return;gesture.current={id:event.pointerId,x:event.clientX,y:event.clientY};},
  onPointerMove:(event:PointerEvent<HTMLElement>)=>{const start=gesture.current;if(!start||start.id!==event.pointerId)return;const dx=event.clientX-start.x,dy=event.clientY-start.y;if(Math.abs(dy)>12&&Math.abs(dy)>=Math.abs(dx)){clear();return;}if(Math.abs(dx)>=48&&Math.abs(dx)>Math.abs(dy)*1.5){clear();move(dx<0?1:-1);}},
  onPointerUp:clear,onPointerCancel:clear,onLostPointerCapture:clear
 };
}
