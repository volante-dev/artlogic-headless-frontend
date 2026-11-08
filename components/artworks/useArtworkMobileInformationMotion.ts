"use client";
import {useRef,useLayoutEffect,useCallback,type RefObject} from "react";
import {gsap} from "gsap";
import {useGSAP} from "@gsap/react";
import {informationGeometry} from "../../lib/artworks/mobile-information-geometry";
import {informationPresentation} from "../../lib/artworks/mobile-information-presentation";
import {useArtworkDialogControls} from "./ArtworkDialogControlsContext";
import type {ControlsLease} from "./artwork-dialog-controls-coverage";
gsap.registerPlugin(useGSAP);
export function useArtworkMobileInformationMotion(panelRef:RefObject<HTMLElement|null>,options:{open:boolean;reduced:boolean;revision:string;onClosed:()=>void;onReading:()=>void;onBeforeMeasure:()=>void}){
 const {open,reduced,revision,onClosed,onReading,onBeforeMeasure}=options;
 const coverage=useArtworkDialogControls(),model=useRef(informationPresentation(open)),timeline=useRef<gsap.core.Timeline|null>(null),lease=useRef<ControlsLease|null>(null),callbacks=useRef({onClosed,onReading,onBeforeMeasure});
 useLayoutEffect(()=>{callbacks.current={onClosed,onReading,onBeforeMeasure};});
 const compactMetrics=useRef<{viewport:string;height:number;buttonHeight:number}|null>(null);
 const restored=useRef(open),initialized=useRef(false),mounted=useRef(false),request=useRef<(value:boolean)=>void>(()=>{});
 const {contextSafe}=useGSAP((_,safe)=>{
  const node=panelRef.current;if(!node)return;mounted.current=true;
  const frame=node.closest<HTMLElement>('[data-artwork-experience]')!,identity=node.querySelector<HTMLElement>('[data-information-identity]')!,reader=node.querySelector<HTMLElement>('[data-mobile-information-scroll]')!,body=node.querySelector<HTMLElement>('[data-information-body]')!,contact=node.querySelector<HTMLElement>('[data-information-contact]')!,toggle=node.querySelector<HTMLButtonElement>('[data-mobile-trigger="information"]')!,surface=node.querySelector<HTMLElement>('[data-artwork-frost-surface]')!,borders=Array.from(node.querySelectorAll<HTMLElement>('[data-information-border]'));
  let resizeFrame=0,lastSize='',building=false,preparing=false;
  const phase=()=>{const value=model.current.phase;if(node.dataset.informationPhase!==value)node.dataset.informationPhase=value;};
  const end=()=>{
   if(!mounted.current)return;
   if(model.current.targetOpen){node.dataset.informationReady='true';reader.inert=false;contact.inert=false;reader.style.overflowY=node.dataset.informationCompact==='true'?'auto':'visible';reader.style.pointerEvents='auto';callbacks.current.onReading();}
   else{node.dataset.informationReady='false';reader.inert=false;reader.style.pointerEvents='none';contact.inert=true;lease.current?.release();lease.current=null;if(open||node.dataset.informationEngaged==='true'){node.dataset.informationEngaged='false';callbacks.current.onClosed();}}
   phase();
  };
  const build=safe!((settle:boolean)=>{
   if(building||!mounted.current)return;building=true;callbacks.current.onBeforeMeasure();node.dataset.informationReady='false';model.current.rebuild();const epoch=model.current.epoch;
   timeline.current?.kill();
   // Measure the actual compact composition, including its two-column/stacked image controls.
   node.removeAttribute('data-information-measured');node.style.height='';reader.removeAttribute('style');identity.removeAttribute('style');body.removeAttribute('style');contact.removeAttribute('style');toggle.removeAttribute('style');
   let rect=node.getBoundingClientRect();const bounds=frame.getBoundingClientRect(),computed=getComputedStyle(node),padding=parseFloat(computed.paddingLeft)||18,topPadding=parseFloat(computed.paddingTop)||16,bottomPadding=parseFloat(computed.paddingBottom)||8;
   const identityHeight=identity.scrollHeight,compactHeight=identity.getBoundingClientRect().height;let buttonHeight=toggle.getBoundingClientRect().height;
   const viewportKey=`${bounds.width}:${bounds.height}`;
   if(open&&compactMetrics.current?.viewport===viewportKey){buttonHeight=compactMetrics.current.buttonHeight;node.style.height=compactMetrics.current.height+'px';rect=node.getBoundingClientRect();}
   else if(!open)compactMetrics.current={viewport:viewportKey,height:rect.height,buttonHeight};
   toggle.style.minHeight=buttonHeight+'px';
   const compactWidth=rect.width-2*padding;
   identity.style.width=compactWidth+'px';
   contact.style.display='block';const contactHeight=contact.getBoundingClientRect().height;contact.style.display='';
   const bottom=Math.max(0,bounds.bottom-rect.bottom),left=rect.left-bounds.left;
   const g=informationGeometry({viewport:{width:bounds.width,height:bounds.height},closed:{left,top:rect.top-bounds.top,width:rect.width,height:rect.height},insets:{left,right:left,top:Math.max(bottom,parseFloat(getComputedStyle(frame).paddingTop)||0),bottom},identityHeight,actionsHeight:buttonHeight+contactHeight+16,lineHeight:parseFloat(getComputedStyle(body).lineHeight)||24,padding,gap:16});
   const rise=g.identityOffset,openHeight=g.open.height,sharedHeight=Math.max(0,openHeight-topPadding-bottomPadding-buttonHeight-contactHeight-32);
   node.style.height=rect.height+'px';node.dataset.informationCompact=String(g.compact);node.dataset.informationMeasured='true';
   Object.assign(surface.style,{left:'0px',top:-rise+'px',width:g.open.width+'px',height:openHeight+'px'});
   Object.assign(reader.style,{position:'absolute',left:padding+'px',top:topPadding-rise+'px',width:Math.max(0,g.open.width-2*padding)+'px',height:sharedHeight+'px',overflow:'visible'});
   identity.style.maxHeight=g.compact?'none':compactHeight+'px';identity.style.pointerEvents='auto';reader.style.pointerEvents='none';
   Object.assign(body.style,{position:g.compact?'relative':'absolute',top:g.compact?'0px':identityHeight+16+'px',marginTop:g.compact?'16px':'0px',width:'100%',height:g.compact?'auto':Math.max(0,sharedHeight-identityHeight-16)+'px',overflowY:g.compact?'visible':'auto'});
   Object.assign(contact.style,{position:'absolute',left:padding+'px',bottom:bottomPadding+buttonHeight+16+'px',width:Math.max(0,g.open.width-2*padding)+'px'});
   Object.assign(toggle.style,{position:'absolute',left:padding+'px',bottom:bottomPadding+'px',margin:0});
   const motion={width:g.closed.width,height:g.closed.height,offset:rise,coverage:0,imageCoverage:0,shade:44};
   const draw=()=>{
    const y=g.closed.height-motion.height;
    surface.style.backgroundColor=`color-mix(in srgb,var(--site-color-inverseSurface) ${motion.shade}%,transparent)`;
    surface.style.clipPath=`inset(${openHeight-motion.height}px ${g.open.width-motion.width}px 0 0)`;
    // Short axis is never scaled: all four edges remain exactly one CSS pixel.
    Object.assign(borders[0]!.style,{width:motion.width+'px',transform:`translate(0px,${y}px)`});
    Object.assign(borders[1]!.style,{width:motion.width+'px',transform:`translate(0px,${g.closed.height-1}px)`});
    Object.assign(borders[2]!.style,{height:motion.height+'px',transform:`translate(0px,${y}px)`});
    Object.assign(borders[3]!.style,{height:motion.height+'px',transform:`translate(${motion.width-1}px,${y}px)`});
    identity.style.transform=`translateY(${motion.offset}px)`;toggle.style.width=Math.max(0,motion.width-2*padding)+'px';
    model.current.update(timeline.current?.progress()??0);lease.current?.update(motion.coverage);
    frame.style.setProperty('--information-controls-opacity',String(1-motion.coverage));
    frame.style.setProperty('--information-image-controls-opacity',String(1-motion.imageCoverage));phase();
   };
   const t=gsap.timeline({paused:true,onUpdate:draw,onComplete:()=>{if(model.current.valid(epoch))end();},onReverseComplete:()=>{if(model.current.valid(epoch))end();}});timeline.current=t;
   t.to(motion,{width:g.open.width,duration:.72,ease:'power3.inOut'},0)
    .to(motion,{imageCoverage:1,duration:.3,ease:'power2.inOut'},.12)
    .to(motion,{height:openHeight,offset:0,duration:.92,ease:'power3.inOut'},.72)
    .to(toggle.querySelector('svg'),{rotation:180,duration:.44,ease:'power2.inOut'},.08)
    .to(motion,{coverage:1,duration:.3,ease:'power2.inOut'},1.28)
    .fromTo(body,{opacity:0,y:10},{opacity:1,y:0,duration:.48,ease:'power2.out',immediateRender:true},1.38)
    .fromTo(contact,{opacity:0,y:10},{opacity:1,y:0,duration:.4,ease:'power2.out',immediateRender:true},1.48)
    .to(motion,{shade:86,duration:.92,ease:'power3.inOut'},.72);
   const target=model.current.targetOpen;
   if(settle||!initialized.current){t.progress(target?1:0,true);draw();if(target)end();}else{t.progress(0,true);draw();}
   initialized.current=true;lastSize=`${frame.clientWidth}:${frame.clientHeight}:${identity.scrollHeight}`;building=false;
  });
  const setTarget=(value:boolean)=>{
   model.current.target(value);node.dataset.informationEngaged='true';node.dataset.informationReady='false';
   // Transfer focus before any shell or photo controls become inert.
   toggle.focus({preventScroll:true});reader.inert=true;contact.inert=true;
   if(value&&!lease.current)lease.current=coverage?.acquire()??null;
   const t=timeline.current;if(!t)return;
   if(reduced||matchMedia("(prefers-reduced-motion:reduce)").matches||document.hidden||(!value&&t.time()===0)){t.progress(value?1:0,false);model.current.update(value?1:0);end();}
   else if(value&&t.time()>0)t.timeScale(1).play();
   else if(value){
    preparing=true;const epoch=model.current.epoch;
    // Mounting the body introduces font faces that the compact caption never requested.
    // Prepare those faces before starting the authored 1.88s sequence.
    const fonts=[identity,...identity.querySelectorAll('*'),body,...body.querySelectorAll('*'),toggle,contact.querySelector('a')??contact].map(element=>{const style=getComputedStyle(element);return document.fonts.load(`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`,element.textContent?.slice(0,100)??'');});
    void Promise.all(fonts).then(()=>document.fonts.ready).then(()=>{
     if(!mounted.current||!model.current.valid(epoch))return;preparing=false;if((timeline.current?.time()??0)>0)return;
     if(model.current.targetOpen){build(false);if(document.hidden||matchMedia("(prefers-reduced-motion:reduce)").matches){timeline.current?.progress(1,false);model.current.update(1);end();}else timeline.current?.timeScale(1).play();}
    }).catch(()=>{if(mounted.current&&model.current.valid(epoch)){preparing=false;t.timeScale(1).play();}});
   }else t.timeScale(1.1).reverse();
   phase();
  };
  request.current=setTarget;
  if(restored.current&&!lease.current)lease.current=coverage?.acquire()??null;
  build(true);
  const rebuild=()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>build(true));};
  const observer=new ResizeObserver(()=>{const size=`${frame.clientWidth}:${frame.clientHeight}:${identity.scrollHeight}`,viewportChanged=lastSize.split(':').slice(0,2).join(':')!==size.split(':').slice(0,2).join(':');if(viewportChanged||(!model.current.targetOpen&&model.current.phase==='closed'&&lastSize!==size))rebuild();});observer.observe(frame);observer.observe(identity);
  const hidden=()=>{if(document.hidden){const t=timeline.current;t?.pause().progress(model.current.targetOpen?1:0,false);model.current.update(model.current.targetOpen?1:0);end();}};
  const fontsReady=()=>{if(!preparing)rebuild();};
  document.addEventListener('visibilitychange',hidden);document.fonts?.addEventListener('loadingdone',fontsReady);
  return()=>{mounted.current=false;model.current.rebuild();cancelAnimationFrame(resizeFrame);observer.disconnect();document.removeEventListener('visibilitychange',hidden);document.fonts?.removeEventListener('loadingdone',fontsReady);timeline.current?.kill();timeline.current=null;lease.current?.release();lease.current=null;request.current=()=>{};frame.style.removeProperty('--information-controls-opacity');frame.style.removeProperty('--information-image-controls-opacity');};
 },{scope:panelRef,dependencies:[coverage,revision],revertOnUpdate:true});
 useGSAP(()=>{if(open&&!model.current.targetOpen)request.current(true);if(reduced&&timeline.current){timeline.current.pause().progress(model.current.targetOpen?1:0,false);model.current.update(model.current.targetOpen?1:0);}}, {scope:panelRef,dependencies:[open,reduced]});
 const toggle=useCallback(()=>{contextSafe(()=>request.current(!model.current.targetOpen))();},[contextSafe]);
 const dismiss=useCallback(()=>{contextSafe(()=>{if(model.current.targetOpen)request.current(false);})();},[contextSafe]);
 return {toggle,dismiss};
}
