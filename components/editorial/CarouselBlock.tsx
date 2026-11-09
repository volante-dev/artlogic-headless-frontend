"use client";
import {useCallback,useEffect,useMemo,useRef,useState} from "react";
import IconButton from "@mui/material/IconButton";
import type {components} from "../../lib/api/generated";
import {useSiteContent} from "../SiteContentProvider";
import {useEditorialPageVisible,useEditorialReducedMotion} from "../../lib/editorial/preferences";
import {MediaBlock} from "./MediaBlock";
import {createEditorialWheelGesture} from "../../lib/editorial/immersive/gestures";
import styles from "./CarouselBlock.module.css";
type Block=Extract<components["schemas"]["EditorialPublicBlock"],{type:"carousel"}>;
type SlideTransition={fromId:string;toId:string;direction:1|-1};
function Arrow({previous=false}:{previous?:boolean}){return <svg width="28" height="24" viewBox="0 0 28 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><path d={previous?"M25 12H3m8-8-8 8 8 8":"M3 12h22m-8-8 8 8-8 8"}/></svg>;}
export function CarouselBlock({block,active=true,timeoutMs,preparing=false,preload=false,preloadAdjacent=false,allowZoom=true,activeItemId,onActiveItemChange,fullFrameMobile=false}:{block:Block;active?:boolean;timeoutMs?:number;preparing?:boolean;preload?:boolean;preloadAdjacent?:boolean;allowZoom?:boolean;activeItemId?:string|null;onActiveItemChange?(id:string):void;fullFrameMobile?:boolean}){
 const {messages:m}=useSiteContent(),reduced=useEditorialReducedMotion(),pageVisible=useEditorialPageVisible();
 const slides=useMemo(()=>block.slides.filter(slide=>slide.media.source!==null),[block.slides]);
 const [activeId,setActiveId]=useState<string|null>(null),[transition,setTransition]=useState<SlideTransition|null>(null),[choice,setChoice]=useState<"auto"|"paused"|"playing">("auto"),[hover,setHover]=useState(false),[visible,setVisible]=useState(false),hostRef=useRef<HTMLElement>(null),gesture=useRef<{x:number;y:number}|null>(null),suppressClick=useRef(false);
 const index=Math.max(0,slides.findIndex(slide=>slide.id===(activeItemId??activeId))),slide=slides[index],hasSlide=Boolean(slide),automatic=block.automatic&&slides.every(slide=>slide.media.source?.kind==="image"||slide.media.source?.kind==="artwork"),paused=choice==="paused"||choice==="auto"&&reduced;
 const complete=useCallback((expected:SlideTransition)=>setTransition(current=>current===expected?null:current),[]);
 const go=useCallback((next:number,manual=true)=>{
  if(!slide||transition||slides.length<2)return;const destination=slides[(next+slides.length)%slides.length]!;if(destination.id===slide.id)return;
  if(!reduced)setTransition({fromId:slide.id,toId:destination.id,direction:next>index?1:-1});
  setActiveId(destination.id);onActiveItemChange?.(destination.id);if(manual)setChoice("paused");
 },[slide,transition,slides,reduced,index,onActiveItemChange]);
 const wheelNavigation=useRef({go,index,active});
 useEffect(()=>{wheelNavigation.current={go,index,active};},[go,index,active]);
 useEffect(()=>{const element=hostRef.current;if(!element||!fullFrameMobile)return;const detector=createEditorialWheelGesture("x");const onWheel=(event:WheelEvent)=>{const state=wheelNavigation.current,result=detector.feed(event,()=>!state.active||event.ctrlKey||event.defaultPrevented?"ignored":"navigation");if(result.owner==="navigation"&&!event.ctrlKey){event.preventDefault();if(result.step)state.go(state.index+(event.deltaX>0?1:-1));}};element.addEventListener("wheel",onWheel,{passive:false});return()=>{element.removeEventListener("wheel",onWheel);detector.dispose();};},[fullFrameMobile,hasSlide]);
 useEffect(()=>{const element=hostRef.current;if(!element)return;const observer=new IntersectionObserver(entries=>setVisible((entries[0]?.intersectionRatio??0)>.5),{threshold:[0,.5,.51,1]});observer.observe(element);return()=>observer.disconnect();},[hasSlide]);
 useEffect(()=>{if(!transition)return;const timer=setTimeout(()=>complete(transition),reduced?0:550);return()=>clearTimeout(timer);},[transition,reduced,complete]);
 useEffect(()=>{
  if(!active||transition||!automatic||paused||hover||!visible||!pageVisible||slides.length<2)return;
  const seconds=Number.isFinite(block.intervalSeconds)?Math.min(60,Math.max(3,block.intervalSeconds)):5;
  const timer=setTimeout(()=>go(index+1,false),seconds*1000);return()=>clearTimeout(timer);
 },[active,transition,automatic,paused,hover,visible,pageVisible,slides.length,go,index,block.intervalSeconds]);
 if(!slide)return null;
 const previous=transition?slides.find(item=>item.id===transition.fromId):undefined,foreground=previous&&previous.id!==slide.id?[previous,slide]:[slide];
 // Keep the actual adjacent images ready; never mount a player ahead of its slide.
 const warm=preloadAdjacent&&(active||preparing||preload)?[slides[(index+1)%slides.length]!,slides[(index+slides.length-1)%slides.length]!].filter((item,i,all)=>all.findIndex(s=>s.id===item.id)===i&&!foreground.some(s=>s.id===item.id)&&(item.media.source?.kind==='image'||item.media.source?.kind==='artwork')):[],rendered=[...foreground,...warm];
 return <section ref={hostRef} data-editorial-carousel data-editorial-active-item={slide.id} data-editorial-carousel-state={transition?'transitioning':'ready'} className={styles.carousel} data-full-frame-mobile={fullFrameMobile||undefined} aria-label={m["editorial.carousel"]} onPointerEnter={event=>{if(event.pointerType==="mouse")setHover(true);}} onPointerLeave={event=>{if(event.pointerType==="mouse")setHover(false);}} onFocusCapture={event=>{if(!(event.target as Element).closest("[data-rotation-control]"))setChoice("paused");}} onKeyDown={event=>{
  if(!["ArrowLeft","ArrowRight"].includes(event.key)||(event.target as Element).closest("input,textarea,select,[contenteditable=true],[role=dialog]"))return;event.preventDefault();const rtl=getComputedStyle(event.currentTarget).direction==="rtl",direction=(event.key==="ArrowRight"?1:-1)*(rtl?-1:1);go(index+direction);
 }} onPointerDown={event=>{if(event.pointerType==="mouse"||(event.target as Element).closest("button,input,textarea,select,iframe,[role=dialog]"))return;gesture.current={x:event.clientX,y:event.clientY};}} onPointerCancel={()=>{gesture.current=null;}} onPointerUp={event=>{
  const start=gesture.current;gesture.current=null;if(!start)return;const dx=event.clientX-start.x,dy=event.clientY-start.y;
  if(Math.abs(dx)<55||Math.abs(dx)<Math.abs(dy)*1.2)return;event.preventDefault();suppressClick.current=true;setTimeout(()=>{suppressClick.current=false;},400);const rtl=getComputedStyle(event.currentTarget).direction==="rtl";go(index+(dx<0?1:-1)*(rtl?-1:1));
 }} onClickCapture={event=>{if(suppressClick.current&&event.detail!==0){event.preventDefault();event.stopPropagation();suppressClick.current=false;}}}>
 <div data-editorial-carousel-viewport data-direction={transition?.direction===-1?'backward':'forward'} className={styles.viewport}>
 {rendered.map(item=>{const current=item.id===slide.id,warming=warm.some(s=>s.id===item.id),phase=warming?'warming':current?(transition?'incoming':'active'):'outgoing';return <div key={item.id} data-editorial-carousel-stage data-editorial-slide-phase={phase} data-editorial-slide-id={item.id} className={styles.stage} aria-hidden={!current||Boolean(transition)||undefined} inert={!current||Boolean(transition)||undefined} onAnimationEnd={event=>{if(current&&transition&&event.target===event.currentTarget)complete(transition);}}><MediaBlock preload={preload||warming} appearanceFrame={fullFrameMobile} captionFocusable={fullFrameMobile} media={item.media} active={active&&current&&!transition} allowZoom={allowZoom} timeoutMs={timeoutMs} preparing={current&&preparing} autoplay={item.media.source?.kind==="video"||item.media.source?.kind==="youtube"||item.media.source?.kind==="vimeo"?true:undefined}/></div>;})}
 </div>
 {slides.length>1&&<div data-editorial-carousel-navigation className={styles.navigation} data-editorial-motion-controls><IconButton aria-label={m["editorial.previousSlide"]} aria-disabled={Boolean(transition)||undefined} onClick={()=>go(index-1)}><Arrow previous/></IconButton><ol className={styles.progress}>{slides.map((item,i)=><li key={item.id}><button type="button" aria-label={m["editorial.slide"]+" "+(i+1)} aria-current={index===i?"true":undefined} onClick={()=>go(i)}><span/></button></li>)}</ol>{automatic&&<IconButton data-rotation-control aria-label={paused?m["editorial.resumeCarousel"]:m["editorial.pauseCarousel"]} aria-pressed={paused} onClick={()=>setChoice(paused?"playing":"paused")}><span aria-hidden="true">{paused?"▶":"Ⅱ"}</span></IconButton>}<IconButton aria-label={m["editorial.nextSlide"]} aria-disabled={Boolean(transition)||undefined} onClick={()=>go(index+1)}><Arrow/></IconButton><span className={styles.srOnly} role="status" aria-live={automatic&&!paused?"off":"polite"}>{m["editorial.slide"]} {index+1} / {slides.length}</span></div>}
 </section>;
}
