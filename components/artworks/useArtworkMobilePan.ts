"use client";
import {useRef,useLayoutEffect,useState,type RefObject,type KeyboardEvent} from "react";
import {examinationGeometry,relativePan} from "./artwork-mobile-examination";
import type {MobileArtworkViewProps} from "./ArtworkMobileController";
/** Pan is relative to the contact origin; resize, pinch, blur and hiding end ownership. */
export function useArtworkMobilePan({frame,media,state,send,systemZoom,enabled=true}:{frame:RefObject<HTMLDivElement|null>;media:MobileArtworkViewProps["content"]["artwork"]["media"][number]|undefined;state:MobileArtworkViewProps["state"];send:MobileArtworkViewProps["send"];systemZoom:boolean;enabled?:boolean}){
 const [size,setSize]=useState({width:1,height:1}),drag=useRef<{id:number;x:number;y:number;pan:{x:number;y:number}}|null>(null);
 useLayoutEffect(()=>{const node=frame.current;if(!node||!enabled)return;const cancel=()=>{const owner=drag.current;drag.current=null;if(owner&&node.hasPointerCapture(owner.id))node.releasePointerCapture(owner.id);};const measure=()=>{cancel();setSize({width:node.clientWidth,height:node.clientHeight});};const visibility=()=>{if(document.hidden)cancel();};measure();const observer=new ResizeObserver(measure);observer.observe(node);document.addEventListener("visibilitychange",visibility);window.addEventListener("blur",cancel);return ()=>{cancel();observer.disconnect();document.removeEventListener("visibilitychange",visibility);window.removeEventListener("blur",cancel);};},[frame,enabled]);
 const geometry=examinationGeometry(media?.width??1,media?.height??1,size.width,size.height,state.zoom);
 const pointer:MobileArtworkViewProps["pointer"]={
  onPointerDown:event=>{if(!event.isPrimary||systemZoom){drag.current=null;return;}drag.current={id:event.pointerId,x:event.clientX,y:event.clientY,pan:{...state.pan}};event.currentTarget.setPointerCapture(event.pointerId);},
  onPointerMove:event=>{if(systemZoom){drag.current=null;return;}const d=drag.current;if(!d&&event.pointerType==="mouse"&&event.buttons===0&&!matchMedia("(pointer:coarse)").matches){const box=event.currentTarget.getBoundingClientRect();send({type:"pan",x:(.5-(event.clientX-box.left)/box.width)*2,y:(.5-(event.clientY-box.top)/box.height)*2});return;}if(d&&d.id===event.pointerId){const next=relativePan(d.pan,event.clientX-d.x,event.clientY-d.y,geometry);send({type:"pan",...next});}},
  onPointerUp:event=>{drag.current=null;if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);},onPointerCancel:()=>{drag.current=null;},onLostPointerCapture:()=>{drag.current=null;},
 };
 const onKeyDown=(event:KeyboardEvent<HTMLDivElement>)=>{if(systemZoom||event.target!==frame.current)return;const delta:Record<string,[number,number]>={ArrowLeft:[40,0],ArrowRight:[-40,0],ArrowUp:[0,40],ArrowDown:[0,-40]};const step=delta[event.key];if(step){event.preventDefault();event.stopPropagation();send({type:"pan",...relativePan(state.pan,...step,geometry)});}};
 return {geometry,pointer,onKeyDown};
}
