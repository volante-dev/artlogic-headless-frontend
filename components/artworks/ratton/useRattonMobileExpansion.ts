"use client";
import {useCallback,useLayoutEffect,useRef,useSyncExternalStore,type RefObject} from "react";
import {gsap} from "gsap";
import {useGSAP} from "@gsap/react";
import {useArtworkDialogInteraction} from "../ArtworkDialogInteractionContext";
import {useArtworkOpening} from "../ArtworkOpeningBoundary";
import type {RattonArtworkVisitState,RattonVisitStore} from "./ratton-artwork-state";

gsap.registerPlugin(useGSAP);
const mobileQuery="(max-width:959px),(max-height:639px)";
const subscribe=(notify:()=>void)=>{const query=matchMedia(mobileQuery);query.addEventListener("change",notify);return ()=>query.removeEventListener("change",notify);};
const snapshot=()=>matchMedia(mobileQuery).matches;
type Geometry={height:number;paddingLeft:number;paddingRight:number;actionsHeight:number;navigationSpace:number};

type ExpansionNodes={host:HTMLElement;viewport:HTMLElement;media:HTMLElement;carousel:HTMLElement;actions:HTMLElement;navigation:HTMLElement|null;timeline:HTMLElement|null;control:HTMLElement|null};
 function measure(n:ExpansionNodes):Geometry{
  const css=getComputedStyle(n.media);
  return {height:n.media.getBoundingClientRect().height,paddingLeft:parseFloat(css.paddingLeft)||0,paddingRight:parseFloat(css.paddingRight)||0,actionsHeight:n.actions.getBoundingClientRect().height,navigationSpace:parseFloat(getComputedStyle(n.carousel).getPropertyValue('--ratton-navigation-space'))||0};
 }
 const mediaTop=(n:ExpansionNodes)=>n.media.getBoundingClientRect().top-n.viewport.getBoundingClientRect().top+n.viewport.scrollTop;
 const outsideRight=(node:HTMLElement)=>Math.max(96,innerWidth-node.getBoundingClientRect().left+16);
 function expandedLayout(n:ExpansionNodes){
  gsap.set(n.media,{height:n.host.clientHeight,paddingLeft:0,paddingRight:0});
  gsap.set(n.actions,{marginBottom:-n.actions.getBoundingClientRect().height});
  gsap.set(n.carousel,{'--ratton-navigation-space':'0px','--ratton-photo-top':'76px','--ratton-photo-bottom':'108px'});
  gsap.set(n.viewport,{overflow:'hidden',scrollTop:mediaTop(n)});
  if(n.timeline)gsap.set(n.timeline,{autoAlpha:1,y:0});
 }
 function clearLayout(n:ExpansionNodes,scrollTop:number){
  gsap.set(n.media,{clearProps:'height,paddingLeft,paddingRight'});gsap.set(n.actions,{clearProps:'marginBottom'});
  gsap.set(n.carousel,{clearProps:'--ratton-navigation-space,--ratton-photo-top,--ratton-photo-bottom'});gsap.set(n.viewport,{clearProps:'overflow'});
  if(n.navigation)gsap.set(n.navigation,{clearProps:'opacity,visibility'});
  if(n.timeline)gsap.set(n.timeline,{clearProps:'opacity,visibility,transform'});
  if(n.control)gsap.set(n.control,{clearProps:'opacity,visibility,transform'});
  n.viewport.scrollTop=scrollTop;
 }

function readNodes(host:HTMLElement|null){
  const viewport=host?.querySelector<HTMLElement>('[data-ratton-viewport]'),media=host?.querySelector<HTMLElement>('[data-ratton-media]'),carousel=host?.querySelector<HTMLElement>('[data-ratton-carousel]'),actions=host?.querySelector<HTMLElement>('[data-ratton-actions]');
  if(!host||!viewport||!media||!carousel||!actions)return null;
  return {host,viewport,media,carousel,actions,navigation:carousel.querySelector<HTMLElement>('[data-ratton-navigation]'),timeline:carousel.querySelector<HTMLElement>('[data-ratton-timeline]'),control:carousel.querySelector<HTMLElement>('[data-ratton-current] [data-artwork-entry-controls]')};
}


/** Height is deliberately animated here: it pushes native reading flow below the
 * photograph. Geometry is read once per operation, never from an onUpdate loop. */
export function useRattonMobileExpansion(rootRef:RefObject<HTMLElement|null>,store:RattonVisitStore,state:RattonArtworkVisitState){
 const mobile=useSyncExternalStore(subscribe,snapshot,()=>false),opening=useArtworkOpening(),register=useArtworkDialogInteraction();
 const operation=useRef<gsap.core.Timeline|null>(null),geometry=useRef<Geometry|null>(null);
 const {contextSafe}=useGSAP((_,safe)=>{
  const n=readNodes(rootRef.current);if(!n)return;
  geometry.current=measure(n);
  const current=store.read();
  if(mobile&&current.expanded&&current.expansionPhase!=="closing"){
   expandedLayout(n);if(current.expansionPhase!=="expanded")store.patch({expansionPhase:"expanded"});
  }else if(current.expansionPhase!=="collapsed"){
   const top=current.expansionOriginScrollTop??current.informationScrollTop;
   clearLayout(n,top);store.patch({expanded:false,expansionPhase:"collapsed",expansionOriginScrollTop:null,informationScrollTop:top});
  }
  const resize=safe!(()=>{
   if(window.visualViewport&&window.visualViewport.scale!==1)return;
   operation.current?.progress(1);
   const active=readNodes(rootRef.current);if(mobile&&active&&store.read().expanded)expandedLayout(active);
  });
  const hidden=()=>{if(document.hidden)operation.current?.progress(1);};
  const reduced=matchMedia('(prefers-reduced-motion:reduce)'),reduce=()=>{if(reduced.matches)operation.current?.progress(1);};
  window.addEventListener('resize',resize);window.visualViewport?.addEventListener('resize',resize);document.addEventListener('visibilitychange',hidden);reduced.addEventListener('change',reduce);
  return ()=>{operation.current?.kill();operation.current=null;window.removeEventListener('resize',resize);window.visualViewport?.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',hidden);reduced.removeEventListener('change',reduce);};
 },{scope:rootRef,dependencies:[mobile,store],revertOnUpdate:true});

 const expand=()=>contextSafe(()=>{
  const n=readNodes(rootRef.current);if(!mobile||!n?.control||opening?.isClosing||store.read().expansionPhase!=="collapsed")return;
  operation.current?.kill();geometry.current=measure(n);const saved=geometry.current,scrollTop=n.viewport.scrollTop,reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
  n.control.focus({preventScroll:true});store.patch({expansionPhase:"opening",expansionOriginScrollTop:scrollTop});
  gsap.set(n.viewport,{overflow:'hidden'});
  const tl=gsap.timeline({defaults:{ease:'power3.inOut'},onComplete:()=>{operation.current=null;store.patch({expanded:true,expansionPhase:"expanded"});if(!opening?.isClosing)readNodes(rootRef.current)?.control?.focus({preventScroll:true});}});operation.current=tl;
  tl.addLabel('acknowledge',0).to(n.control,{x:reduced?0:outsideRight(n.control),autoAlpha:0,duration:reduced ? .06 : .14},'acknowledge');
  if(n.navigation)tl.to(n.navigation,{autoAlpha:0,duration:reduced ? .06 : .1},0);
  tl.addLabel('expand',reduced ? .06 : .14).call(()=>store.patch({expanded:true}),[],'expand')
   .to(n.media,{height:n.host.clientHeight,paddingLeft:0,paddingRight:0,duration:reduced?0:.6},'expand')
   .to(n.actions,{marginBottom:-saved.actionsHeight,duration:reduced?0:.6},'expand')
   .to(n.carousel,{'--ratton-navigation-space':'0px','--ratton-photo-top':'76px','--ratton-photo-bottom':'108px',duration:reduced?0:.6},'expand')
   .to(n.viewport,{scrollTop:mediaTop(n),duration:reduced?0:.6},'expand');
  if(n.navigation)tl.to(n.navigation,{autoAlpha:1,duration:reduced ? .06 : .14},reduced ? .06 : .66);
  if(n.timeline)tl.fromTo(n.timeline,{y:reduced?0:80,autoAlpha:0},{y:0,autoAlpha:1,duration:reduced ? .08 : .24,immediateRender:false,ease:'power3.out'},reduced ? .06 : .72);
  tl.addLabel('controlsReady',reduced ? .14 : .96).fromTo(n.control,{x:()=>reduced?0:outsideRight(n.control!),autoAlpha:0},{x:0,autoAlpha:1,duration:reduced ? .08 : .18,ease:'power3.out',immediateRender:false},'controlsReady');
 })();
 const collapse=useCallback(()=>contextSafe(()=>{
  const n=readNodes(rootRef.current);if(!n||store.read().expansionPhase==="collapsed"||store.read().expansionPhase==="closing")return;
  operation.current?.kill();const saved=geometry.current??measure(n),origin=store.read().expansionOriginScrollTop??0,reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
  store.patch({expansionPhase:"closing"});
  const tl=gsap.timeline({defaults:{ease:'power3.inOut'},onComplete:()=>{operation.current=null;clearLayout(n,origin);store.patch({expanded:false,expansionPhase:"collapsed",expansionOriginScrollTop:null,informationScrollTop:n.viewport.scrollTop});if(!opening?.isClosing)readNodes(rootRef.current)?.control?.focus({preventScroll:true});}});operation.current=tl;
  if(n.control)tl.to(n.control,{x:reduced?0:outsideRight(n.control),autoAlpha:0,duration:reduced ? .06 : .12},0);
  if(n.timeline)tl.to(n.timeline,{y:reduced?0:80,autoAlpha:0,duration:reduced ? .06 : .14},0);
  if(n.navigation)tl.to(n.navigation,{autoAlpha:0,duration:reduced ? .06 : .1},0);
  tl.addLabel('restore',reduced ? .06 : .14).call(()=>store.patch({expanded:false}),[],'restore')
   .to(n.media,{height:saved.height,paddingLeft:saved.paddingLeft,paddingRight:saved.paddingRight,duration:reduced?0:.5},'restore')
   .to(n.actions,{marginBottom:0,duration:reduced?0:.5},'restore')
   .to(n.carousel,{'--ratton-navigation-space':saved.navigationSpace+'px','--ratton-photo-top':'0px','--ratton-photo-bottom':'0px',duration:reduced?0:.5},'restore')
   .to(n.viewport,{scrollTop:origin,duration:reduced?0:.5},'restore');
  if(n.navigation)tl.to(n.navigation,{autoAlpha:1,duration:reduced ? .06 : .14},reduced ? .06 : .56);
  if(n.control)tl.fromTo(n.control,{x:()=>reduced?0:outsideRight(n.control!),autoAlpha:0},{x:0,autoAlpha:1,duration:reduced ? .08 : .18,immediateRender:false,ease:'power3.out'},reduced ? .12 : .7);
 })(),[contextSafe,rootRef,opening,store]);
 useLayoutEffect(()=>{if(!mobile||state.expansionPhase==="collapsed")return;return register?.(()=>{collapse();return true;});},[mobile,state.expansionPhase,register,collapse]);
 return {mobile,expanded:state.expanded,phase:state.expansionPhase,busy:state.expansionPhase==="opening"||state.expansionPhase==="closing",toggle:()=>{if(store.read().expansionPhase==="collapsed")expand();else if(store.read().expansionPhase==="expanded")collapse();}};
}
export type RattonMobileExpansion=ReturnType<typeof useRattonMobileExpansion>;
