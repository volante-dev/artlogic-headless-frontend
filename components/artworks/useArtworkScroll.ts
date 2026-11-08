"use client";
import {useLayoutEffect,useRef,useState,useCallback} from "react";
import {useArtworkOpening} from "./ArtworkOpeningBoundary";
import {artworkProgress,artworkStageOffsets} from "./artwork-progress";
import {artworkFinaleIntent,artworkScrollDuration,artworkScrollEase,artworkScrollTarget,artworkScrollUnsettled} from "./artwork-scroll-sequence";
import {createArtworkWheelGesture} from "./artwork-wheel-gesture";
interface Geometry {scroller:HTMLElement|Window;start:number;viewport:number;reading:number;enhanced:boolean;staticOffsets:number[]}
interface Motion {from:number;to:number;started:number;media:number}
export function useArtworkScroll(count:number,finale?:{active:boolean;change:(open:boolean)=>void}){
 const finaleRef=useRef(finale);useLayoutEffect(()=>{finaleRef.current=finale;},[finale]);
 const opening=useArtworkOpening();
 const root=useRef<HTMLElement>(null),information=useRef<HTMLDivElement>(null),geometry=useRef<Geometry|null>(null),select=useRef<(index:number)=>void>(()=>{}),restore=useRef<(index:number)=>void>(()=>{});
 const [active,setActive]=useState(0),[enhanced,setEnhanced]=useState(false);
 useLayoutEffect(()=>{
  const element=root.current,info=information.current;if(!element||!info)return;
  const scroller=element.closest<HTMLElement>("[role=dialog]")??window,preference=matchMedia("(prefers-reduced-motion: reduce)"),compact=matchMedia("(max-width: 767px), (max-height: 639px)");
  let frame=0,animation=0,alive=true,lastActive=-1,lastY=0,motion:Motion|null=null,gestureClaimed=false,touchY=0,pendingSelection:number|null=null;
  const wheelGesture=createArtworkWheelGesture();
  const scrollTop=()=>scroller===window?window.scrollY:(scroller as HTMLElement).scrollTop;
  const position=()=>Math.max(0,scrollTop()-(geometry.current?.start??0));
  const write=(y:number)=>{const g=geometry.current;if(g)g.scroller.scrollTo({top:g.start+y,behavior:"instant"});};
  function paint(){
   frame=0;const g=geometry.current;if(!alive||document.hidden||!g)return;
   const y=position(),state=artworkProgress(y,g.viewport,g.reading,count);let index=motion?.media??state.active;
   if(!g.enhanced){index=0;g.staticOffsets.forEach((offset,i)=>{if(y+g.viewport*.35>=offset)index=i+1;});}
   const progress=g.enhanced?state.transition:Math.min(1,y/Math.max(1,g.viewport*.65));
   element!.style.setProperty("--artwork-transition",String(progress));element!.style.setProperty("--artwork-frost-opacity",String(Math.max(0,1-progress*2)));
   element!.dataset.transition=String(Number(progress.toFixed(3)));element!.dataset.railTone=progress>=.7?"paper":"image";
   if(index!==lastActive){lastActive=index;setActive(index);}lastY=y;
  }
  function finish(){
   cancelAnimationFrame(animation);animation=0;const target=motion?.to,queued=pendingSelection;motion=null;pendingSelection=null;
   element!.dataset.scrollMotion="idle";if(target!==undefined)write(target);paint();if(queued!==null&&alive&&!document.hidden)select.current(queued);
  }
  function animateTo(to:number){
   const g=geometry.current;if(!g||motion)return;
   const from=position();if(Math.abs(to-from)<1){write(to);paint();return;}
   motion={from,to,started:performance.now(),media:artworkProgress(to,g.viewport,g.reading,count).active};element!.dataset.scrollMotion="running";
   cancelAnimationFrame(frame);frame=0;
   const tick=(now:number)=>{
    animation=0;if(!alive||!motion)return;if(document.hidden){finish();return;}
    const elapsed=Math.min(1,(now-motion.started)/artworkScrollDuration);
    write(motion.from+(motion.to-motion.from)*artworkScrollEase(elapsed));paint();
    if(elapsed<1)animation=requestAnimationFrame(tick);else finish();
   };
   animation=requestAnimationFrame(tick);
  }
  function schedule(){if(!frame&&alive&&!document.hidden&&!motion)frame=requestAnimationFrame(paint);}
  function onScroll(){
   const g=geometry.current;if(!g||motion)return;
   const y=position(),direction=Math.sign(y-lastY);
   if(g.enhanced&&direction&&artworkScrollUnsettled(y,g.viewport,g.reading,count)){
    const target=artworkScrollTarget(y,g.viewport,g.reading,count,direction);if(target!==null){animateTo(target);return;}
   }
   schedule();
  }
  function measure(){
   // The finale temporarily fixes the information panel; it must not change photo offsets.
   if(geometry.current&&finaleRef.current?.active)return;
   if(motion)finish();
   const viewport=scroller===window?window.innerHeight:(scroller as HTMLElement).clientHeight,offset=scroller===window?0:(scroller as HTMLElement).getBoundingClientRect().top;
   const start=element!.getBoundingClientRect().top-offset+scrollTop(),reading=Math.max(viewport,info!.scrollHeight+160),enhanced=!preference.matches&&!compact.matches;
   const maximum=Math.max(0,(scroller===window?document.documentElement.scrollHeight:(scroller as HTMLElement).scrollHeight)-viewport-start);
   const staticOffsets=[...element!.querySelectorAll<HTMLElement>("[data-static-view]")].map(node=>Math.min(maximum,node.getBoundingClientRect().top-offset+scrollTop()-start));
   geometry.current={scroller,start,viewport,reading,enhanced,staticOffsets};element!.dataset.enhanced=String(enhanced);setEnhanced(enhanced);
   const infoTop=Math.min(80,viewport-info!.scrollHeight-80);
   element!.style.setProperty("--artwork-reading-distance",reading+"px");element!.style.setProperty("--artwork-flow-height",reading+Math.max(0,count-1)*viewport+"px");element!.style.setProperty("--artwork-info-top",infoTop+"px");element!.style.setProperty("--artwork-heading-top",80+Math.max(0,infoTop)+"px");
   lastY=position();
   if(enhanced&&artworkScrollUnsettled(lastY,viewport,reading,count)){const target=artworkScrollTarget(lastY,viewport,reading,count,1);if(target!==null){animateTo(target);return;}}
   schedule();
  }
  function nestedScroll(target:EventTarget|null,direction:number){
   let node=target instanceof Element?target:null;
   while(node&&node!==scroller){
    if(node.matches("input,textarea,select,[contenteditable=true]"))return true;
    if(node instanceof HTMLElement&&node.scrollHeight>node.clientHeight+1&&/auto|scroll/.test(getComputedStyle(node).overflowY)&&(direction>0?node.scrollTop+node.clientHeight<node.scrollHeight-1:node.scrollTop>0))return true;
    node=node.parentElement;
   }
   return false;
  }
  function intent(direction:number,event:Event,claimed=false){
   if(element!.inert){event.preventDefault();return false;}
   const g=geometry.current;if(!g||!direction||nestedScroll(event.target,direction))return;
   const f=finaleRef.current,description=element!.querySelector<HTMLElement>('[data-finale-description][data-scrollable="true"]');
   if(f?.active){if(description&&(description.contains(event.target as Node)||description.contains(document.activeElement))){event.stopPropagation();return;}event.preventDefault();if(!claimed)f.change(direction>0);return true;}
   if(!g.enhanced)return;
   if(motion){event.preventDefault();return;}
   if(f&&artworkFinaleIntent(false,position(),g.viewport,g.reading,count,direction,claimed)===true){event.preventDefault();f.change(true);return true;}
   const target=artworkScrollTarget(position(),g.viewport,g.reading,count,direction);
   if(target!==null){event.preventDefault();opening?.finish();if(!claimed)animateTo(target);return true;}
   return false;
  }
  const wheel=(event:WheelEvent)=>{
   if(event.ctrlKey||event.metaKey||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;
   // Wheel targeting may stay latched to a view that became hidden beneath a
   // stationary pointer. Capture on the window, but only inside this scene.
   const bounds=(scroller===window?element!:scroller as HTMLElement).getBoundingClientRect();
   if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)return;
   intent(Math.sign(event.deltaY),event,!wheelGesture.accept(event));
  };
  const keyboard=(event:KeyboardEvent)=>{
   if(event.ctrlKey||event.metaKey||event.altKey||event.defaultPrevented)return;
   if(event.target instanceof Element&&event.target.closest('[data-zoomed="true"]'))return;
   if(event.key===" "&&event.target instanceof Element&&event.target.closest("a,button"))return;
   const direction=["ArrowDown","PageDown"," "].includes(event.key)?(event.key===" "&&event.shiftKey?-1:1):["ArrowUp","PageUp"].includes(event.key)?-1:0;
   if(direction)intent(direction,event,event.repeat);
  };
  const touchStart=(event:TouchEvent)=>{touchY=event.touches[0]?.clientY??0;gestureClaimed=false;};
  const touchMove=(event:TouchEvent)=>{if(event.target instanceof Element&&event.target.closest('[data-zoomed="true"]'))return;const current=event.touches[0]?.clientY??touchY,delta=touchY-current;if(Math.abs(delta)<6)return;if(intent(Math.sign(delta),event,gestureClaimed))gestureClaimed=true;};
  const visibility=()=>{if(document.hidden){finish();cancelAnimationFrame(frame);frame=0;}else measure();};
  select.current=index=>{
   opening?.finish();const g=geometry.current;if(!g||index<0||index>=Math.max(1,count))return;if(motion){pendingSelection=index;return;}
   const target=g.enhanced?artworkStageOffsets(g.viewport,g.reading,count)[index]!:index===0?0:g.staticOffsets[index-1]??0;
   if(g.enhanced)animateTo(target);else{write(target);schedule();}
  };
  restore.current=index=>{const g=geometry.current;if(!g||index<0||index>=Math.max(1,count))return;if(motion)finish();const target=g.enhanced?artworkStageOffsets(g.viewport,g.reading,count)[index]!:index===0?0:g.staticOffsets[index-1]??0;write(target);paint();};
  const observer=new ResizeObserver(measure);observer.observe(info);observer.observe(element);if(scroller!==window)observer.observe(scroller as HTMLElement);
  scroller.addEventListener("scroll",onScroll,{passive:true});window.addEventListener("wheel",wheel,{passive:false,capture:true});scroller.addEventListener("keydown",keyboard as EventListener);
  scroller.addEventListener("touchstart",touchStart as EventListener,{passive:true});scroller.addEventListener("touchmove",touchMove as EventListener,{passive:false});
  window.addEventListener("resize",measure,{passive:true});document.addEventListener("visibilitychange",visibility);preference.addEventListener("change",measure);compact.addEventListener("change",measure);element.dataset.scrollMotion="idle";
  measure();
  return ()=>{alive=false;cancelAnimationFrame(frame);cancelAnimationFrame(animation);motion=null;wheelGesture.dispose();observer.disconnect();scroller.removeEventListener("scroll",onScroll);window.removeEventListener("wheel",wheel,true);scroller.removeEventListener("keydown",keyboard as EventListener);scroller.removeEventListener("touchstart",touchStart as EventListener);scroller.removeEventListener("touchmove",touchMove as EventListener);window.removeEventListener("resize",measure);document.removeEventListener("visibilitychange",visibility);preference.removeEventListener("change",measure);compact.removeEventListener("change",measure);geometry.current=null;select.current=()=>{};restore.current=()=>{};};
 },[count,opening]);
 const goTo=useCallback((index:number)=>select.current(index),[]);
 const restoreTo=useCallback((index:number)=>restore.current(index),[]);
 return {root,information,active,goTo,restoreTo,enhanced};
}
