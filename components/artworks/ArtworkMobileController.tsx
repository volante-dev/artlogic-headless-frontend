"use client";
import {useRef,useLayoutEffect,useEffect,useMemo,useCallback,useSyncExternalStore,type ComponentType,type RefObject,type PointerEventHandler,type KeyboardEventHandler,type ReactNode} from "react";
import type {ArtworkContent,ArtworkInformationProps} from "./ArtworkInformation";
import type {ArtworkProgressProps} from "./ArtworkProgress";
import {useArtworkInteraction,useArtworkVisual} from "./ArtworkInteractionBoundary";
import {useArtworkDialogInteraction} from "./ArtworkDialogInteractionContext";
import {useArtworkOpening} from "./ArtworkOpeningBoundary";
import {useArtworkReducedMotion} from "./useArtworkViewport";
import {ArtworkTouchGesture} from "./artwork-mobile-gesture";
import {createArtworkWheelGesture} from "./artwork-wheel-gesture";
import type {MobileEvent,MobileState} from "./artwork-mobile-state";
const zoomSubscribe=(notify:()=>void)=>{const viewport=window.visualViewport;viewport?.addEventListener("resize",notify);return ()=>viewport?.removeEventListener("resize",notify);};
const interactive=(target:EventTarget|null)=>target instanceof Element&&Boolean(target.closest("button,a,input,textarea,select,[contenteditable=true],[data-artwork-reading]"));
export interface MobileArtworkViewProps {
 id?:string;content:ArtworkContent;state:MobileState;reduced:boolean;systemZoom:boolean;root:RefObject<HTMLElement|null>;surface:RefObject<HTMLDivElement|null>;
 InformationView:ComponentType<ArtworkInformationProps>;ProgressView:ComponentType<ArtworkProgressProps>;supplementalContent?:ReactNode;
 registerInformationDismiss?:(run:()=>void)=>()=>void;select:(index:number)=>void;send:(event:MobileEvent)=>void;
 pointer:{onPointerDown:PointerEventHandler<HTMLDivElement>;onPointerMove:PointerEventHandler<HTMLDivElement>;onPointerUp:PointerEventHandler<HTMLDivElement>;onPointerCancel:PointerEventHandler<HTMLDivElement>;onLostPointerCapture:PointerEventHandler<HTMLDivElement>};onKeyDown:KeyboardEventHandler<HTMLElement>;
}
export function ArtworkMobileController({View,id,content,InformationView,ProgressView,supplementalContent}:{View:ComponentType<MobileArtworkViewProps>;id?:string;content:ArtworkContent;InformationView:ComponentType<ArtworkInformationProps>;ProgressView:ComponentType<ArtworkProgressProps>;supplementalContent?:ReactNode}){
 const store=useArtworkInteraction()!;const state=useArtworkVisual(store),opening=useArtworkOpening(),registerEscape=useArtworkDialogInteraction(),reduced=useArtworkReducedMotion();
 const systemZoom=useSyncExternalStore(zoomSubscribe,()=>Boolean(window.visualViewport&&(window.visualViewport.scale>1.01)),()=>false);
 const idsKey=content.artwork.media.map(m=>m.id).join(","),ids=useMemo(()=>idsKey?idsKey.split(","):[],[idsKey]);
 const root=useRef<HTMLElement>(null),surface=useRef<HTMLDivElement>(null),touch=useRef(new ArtworkTouchGesture()),lastMode=useRef({mode:state.mode,zoom:state.zoom}),returnFocus=useRef<HTMLElement|null>(null);
 const captured=useRef<{node:HTMLDivElement;id:number}|null>(null);
 const informationDismiss=useRef<(()=>void)|null>(null);
 const registerInformationDismiss=useCallback((run:()=>void)=>{informationDismiss.current=run;return()=>{if(informationDismiss.current===run)informationDismiss.current=null;};},[]);
 const send=useCallback((event:MobileEvent)=>{opening?.finish();if(event.type==="information"){touch.current.cancel();const capture=captured.current;captured.current=null;if(capture?.node.hasPointerCapture(capture.id))capture.node.releasePointerCapture(capture.id);if(document.activeElement instanceof HTMLElement)returnFocus.current=document.activeElement;}store.send(event,ids);},[opening,store,ids]);
 const select=(index:number)=>{const s=store.read();if(systemZoom)return;if(index===Math.max(1,ids.length)){send({type:"finale"});return;}if(s.mode==="finale")store.send({type:"gallery"},ids);if(index<0||index>=ids.length||!["gallery","finale"].includes(s.mode))return;opening?.finish();store.send({type:"select",id:ids[index]!,now:performance.now()},ids);if(reduced&&store.read().transition)store.send({type:"commit",epoch:store.read().transition!.epoch},ids);};
 useLayoutEffect(()=>{store.reconcile(ids);},[store,ids]);
 useEffect(()=>{const transition=state.transition;if(!transition)return;const timer=setTimeout(()=>store.send({type:"commit",epoch:transition.epoch},ids),Math.max(0,transition.duration-(performance.now()-transition.acceptedAt)));return ()=>clearTimeout(timer);},[state.transition,store,ids]);
 useLayoutEffect(()=>registerEscape?.(()=>{if(["gallery","finale"].includes(store.read().mode))return false;if(store.read().mode==="information"&&informationDismiss.current){informationDismiss.current();return true;}opening?.finish();store.send({type:"gallery"},ids);return true;}),[registerEscape,store,ids,opening]);
 useLayoutEffect(()=>{const prior=lastMode.current;lastMode.current={mode:state.mode,zoom:state.zoom};if(prior.mode===state.mode&&prior.zoom===state.zoom)return;
  if(state.mode==="gallery"){const trigger=returnFocus.current;if(trigger?.isConnected&&!trigger.matches(":disabled")&&!trigger.closest("[inert]"))trigger.focus({preventScroll:true});else (root.current?.querySelector<HTMLElement>(`[data-mobile-trigger="${prior.mode}"]:not(:disabled)`)??root.current?.querySelector<HTMLElement>("[data-artwork-focus-heading]"))?.focus({preventScroll:true});}
  else{if(prior.mode==="gallery"&&document.activeElement instanceof HTMLElement&&root.current?.contains(document.activeElement))returnFocus.current=document.activeElement;if(state.mode!=="information")root.current?.querySelector<HTMLElement>("[data-mobile-mode-heading]")?.focus({preventScroll:true});}
 },[state.mode,state.zoom]);
 useEffect(()=>{const detector=createArtworkWheelGesture();const step=(direction:number)=>{const s=store.read();if(root.current?.dataset.finaleScene==="true"&&s.mode==="gallery"){if(direction>0){store.send({type:"finale"},ids);return;}}if(s.mode==="finale"){if(direction<0)store.send({type:"gallery"},ids);return;}if(s.mode!=="gallery"||s.transition||systemZoom||root.current?.inert)return;const index=ids.indexOf(s.selectedMediaId??"");opening?.finish();const next=ids[index+direction];if(!next&&direction>0){store.send({type:"finale"},ids);return;}if(next){store.send({type:"select",id:next,now:performance.now()},ids);if(reduced)store.send({type:"commit",epoch:store.read().epoch},ids);}};
  const wheel=(event:WheelEvent)=>{if(event.ctrlKey||event.metaKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)||systemZoom||!["gallery","finale"].includes(store.read().mode)||interactive(event.target))return;const description=root.current?.querySelector<HTMLElement>('[data-finale-description][data-scrollable="true"]');if(store.read().mode==="finale"&&description&&(description.contains(event.target as Node)||description.contains(document.activeElement)))return;const bounds=(store.read().mode==="finale"?root:surface).current?.getBoundingClientRect();if(!bounds||event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)return;event.preventDefault();if(detector.accept(event))step(Math.sign(event.deltaY));};
  const interrupt=()=>{touch.current.cancel();const s=store.read();if(s.transition)store.send({type:"commit",epoch:s.transition.epoch},ids);};
  const visibility=()=>{if(document.hidden)interrupt();};window.addEventListener("wheel",wheel,{passive:false,capture:true});window.addEventListener("resize",interrupt);document.addEventListener("visibilitychange",visibility);
  return ()=>{interrupt();detector.dispose();window.removeEventListener("wheel",wheel,true);window.removeEventListener("resize",interrupt);document.removeEventListener("visibilitychange",visibility);};
 },[store,ids,opening,reduced,systemZoom]);
 const pointer:MobileArtworkViewProps["pointer"]={
  onPointerDown:event=>{if(!event.isPrimary){touch.current.cancel();return;}const s=store.read();touch.current.start(event.pointerId,event.clientX,event.clientY,Boolean(s.transition)||!["gallery","finale"].includes(s.mode)||systemZoom);event.currentTarget.setPointerCapture(event.pointerId);captured.current={node:event.currentTarget,id:event.pointerId};},
  onPointerMove:event=>{const direction=touch.current.move(event.pointerId,event.clientX,event.clientY);if(direction){event.preventDefault();const s=store.read();if(root.current?.dataset.finaleScene==="true"&&s.mode==="gallery"){if(direction>0){store.send({type:"finale"},ids);return;}}if(s.mode==="finale"){if(direction<0)send({type:"gallery"});}else select(ids.indexOf(s.selectedMediaId??"")+direction);}},
  onPointerUp:event=>{touch.current.end(event.pointerId);if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);},
  onPointerCancel:()=>touch.current.cancel(),onLostPointerCapture:()=>touch.current.cancel(),
 };
 const onKeyDown:KeyboardEventHandler<HTMLElement>=event=>{if(event.defaultPrevented||interactive(event.target)||event.ctrlKey||event.metaKey||event.altKey||!["gallery","finale"].includes(state.mode)||event.repeat)return;const direction=["ArrowDown","PageDown"," "].includes(event.key)?(event.key===" "&&event.shiftKey?-1:1):["ArrowUp","PageUp"].includes(event.key)?-1:0;if(direction){event.preventDefault();if(state.mode==="finale"){if(direction<0)send({type:"gallery"});}else select(ids.indexOf(state.selectedMediaId??"")+direction);}};
 return <View id={id} content={content} state={state} root={root} surface={surface} reduced={reduced} systemZoom={systemZoom} InformationView={InformationView} ProgressView={ProgressView} supplementalContent={supplementalContent} registerInformationDismiss={registerInformationDismiss} select={select} send={send} pointer={pointer} onKeyDown={onKeyDown}/>;
}
