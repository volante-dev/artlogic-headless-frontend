"use client";
import {useRef,useState,useCallback,useMemo,useLayoutEffect,type RefObject} from "react";
import gsap from "gsap";
import {useGSAP} from "@gsap/react";
import type {ArtworkContent} from "./ArtworkInformation";
import {ArtworkFinaleMedia,setFinaleBitmap,type FinalePhoto} from "./ArtworkFinaleMedia";
import {useArtworkInteraction} from "./ArtworkInteractionBoundary";
import {finaleStack} from "../../lib/artworks/finale-stage";
import {commonFinaleCardRect,mobileStackOffsets} from "../../lib/artworks/finale-geometry";
import {useArtworkReducedMotion} from "./useArtworkViewport";
import styles from "./ArtworkFinale.module.css";
import integration from "./ArtworkFinaleScene.module.css";
gsap.registerPlugin(useGSAP);
/** Reuses the mounted photo host. Only earlier, decorative planes are rendered here. */
type FinaleSceneProps={owner:RefObject<HTMLElement|null>;content:ArtworkContent;anchor:string|null;open:boolean;mobile:boolean;onExited:()=>void};
export function ArtworkFinaleScene({owner,...props}:FinaleSceneProps){
 const [article,setArticle]=useState<HTMLElement|null>(null);
 const attach=useCallback((node:HTMLSpanElement|null)=>{if(node)setArticle(owner.current);},[owner]);
 return <><span hidden ref={attach}/>{article&&<FinaleSceneContent {...props} article={article}/>}</>;
}
function FinaleSceneContent({article,content,anchor,open,mobile,onExited}:Omit<FinaleSceneProps,"owner">&{article:HTMLElement}){
 const [geometryVersion,setGeometryVersion]=useState(0),resume=useRef(0),prepared=useRef(false);
 const root=useRef<HTMLDivElement>(null),timeline=useRef<gsap.core.Timeline|null>(null),driver=useRef<gsap.core.Tween|null>(null),target=useRef(open),exit=useRef(onExited),reduced=useArtworkReducedMotion();
 useLayoutEffect(()=>{target.current=open;exit.current=onExited;},[open,onExited]);
 const store=useArtworkInteraction();
 const art=content.artwork;
 const photos=useMemo(()=>finaleStack(art.media.map(x=>x.id),anchor).slice(1).flatMap(id=>{const media=art.media.find(x=>x.id===id)!;const original=article.querySelector<HTMLImageElement>(`[data-finale-photo="${id}"] img`);return original?.complete&&original.naturalWidth?[{...media,src:"/media/"+media.id,alt:""} satisfies FinalePhoto]:[];}),[art.media,anchor,article]);
 const slot=!mobile?article.querySelector<HTMLElement>("[data-artwork-finale-slot]"):null;
 const {contextSafe}=useGSAP((_,safe)=>{
  const scene=root.current;if(!scene)return;prepared.current=false;
  const dialog=article.closest<HTMLElement>('[role="dialog"]'),bounds=dialog?.getBoundingClientRect()??{x:0,y:0,width:innerWidth,height:innerHeight};
  const viewport={x:0,y:0,width:bounds.width,height:bounds.height};
  const candidate=anchor?article.querySelector<HTMLElement>(`[data-finale-photo="${anchor}"]`):null,bitmap=candidate?.querySelector<HTMLImageElement>("img");
  const host=bitmap?.complete&&bitmap.naturalWidth?candidate:null;
  const hostRect=host?.getBoundingClientRect(),frame=hostRect?{x:hostRect.x-bounds.x,y:hostRect.y-bounds.y,width:hostRect.width,height:hostRect.height}:viewport;
  const portraitMobile=mobile&&bounds.height>500,destination=commonFinaleCardRect(viewport,portraitMobile,frame);
  // Matches .camera perspective (1300px) and the per-layer depth below.
  const spread=portraitMobile?mobileStackOffsets(viewport,destination,photos.length,50,1300):[];
  const readingScene=article.querySelector<HTMLElement>("[data-finale-mobile-reading-layer]")??scene;
  const identity=mobile?readingScene.querySelector<HTMLElement>("[data-finale-identity]"):article.querySelector<HTMLElement>("[data-artwork-information-identity]");
  const contact=mobile?readingScene.querySelector<HTMLElement>("[data-finale-contact]"):article.querySelector<HTMLElement>("[data-artwork-information-contact]");
  const information=article.querySelector<HTMLElement>("[data-artwork-information]"),informationFrame=information?.parentElement;
  const identityRect=identity?.getBoundingClientRect(),contactRect=contact?.getBoundingClientRect();
  const tl=gsap.timeline({paused:true,defaults:{ease:"power3.inOut"}});timeline.current=tl;
  article.setAttribute("data-finale-scene","true");article.setAttribute("data-finale-has-photo",String(Boolean(host)));if(information)information.dataset.finaleReading="true";article.setAttribute("data-rail-tone","image");
  const zoomControls=Array.from(article.querySelectorAll<HTMLElement>(mobile?'[data-mobile-image-controls]':'[data-artwork-entry-controls]'));
  const priorZoomAccess=zoomControls.map(node=>({node,inert:node.inert,ariaHidden:node.getAttribute("aria-hidden")}));
  // Keep the fade on the reversible scene timeline; access is suspended for its entire lifetime.
  for(const {node} of priorZoomAccess){node.inert=true;node.setAttribute("aria-hidden","true");}
  if(zoomControls.length)tl.to(zoomControls,{autoAlpha:0,duration:.32,ease:"power2.inOut"},0);
  if(host){gsap.set(host.querySelectorAll("[data-artwork-intro-drift]"),{animationPlayState:"paused"});host.dataset.finaleCard="true";host.dataset.front="true";host.dataset.mediaId=anchor??"";gsap.set(host,{willChange:"transform,opacity",backfaceVisibility:"hidden",zIndex:3,transformOrigin:"0 0"});tl.to(host,{x:destination.x-frame.x,y:destination.y-frame.y,scale:destination.width/frame.width,duration:1.55},0);}
  const frameNode=host?.closest<HTMLElement>("[data-artwork-entry-media]");if(frameNode)gsap.set(frameNode,{overflow:"visible",backgroundColor:"transparent"});
  scene.querySelectorAll<HTMLElement>("[data-finale-card]").forEach(card=>{
   const photo=photos.find(x=>x.id===card.dataset.mediaId);if(!photo)return;
   const layer=photos.findIndex(x=>x.id===photo.id)+1;
   setFinaleBitmap(card,frame);gsap.set(card,{x:0,y:0,z:-layer,scale:1,opacity:0});
   tl.to(card,{x:destination.x-frame.x+(portraitMobile?spread[layer-1]??0:layer*(mobile?18:42)),y:destination.y-frame.y,z:-layer*(mobile?50:92),scale:destination.width/frame.width,duration:1.55},.12+layer*.025);
   tl.to(card,{opacity:1,duration:.18,ease:"none"},.2+layer*.035);
   gsap.set(card.querySelector("img"),{filter:`blur(${layer*.6}px) brightness(${Math.max(.55,1-layer*.12)})`});
  });
  tl.fromTo(scene.querySelector("[data-finale-black]"),{opacity:0},{opacity:1,duration:1.25,ease:"power2.inOut"},.08);
  const veil=readingScene.querySelector("[data-finale-mobile-veil]");if(veil)tl.fromTo(veil,{opacity:0},{opacity:1,duration:1.25,ease:"power2.inOut"},.08);
  if(!mobile&&information&&informationFrame&&identity&&contact&&identityRect&&contactRect){
   gsap.set([identity,contact],{willChange:"transform,opacity",backfaceVisibility:"hidden"});
   const parentRect=informationFrame.getBoundingClientRect();gsap.set(informationFrame,{position:"fixed",top:bounds.y,left:parentRect.x,width:parentRect.width,height:bounds.height,paddingTop:0,paddingBottom:0,opacity:1,clipPath:"none"});
   gsap.set(information,{position:"relative",height:bounds.height});
   gsap.set(identity,{position:"absolute",left:0,right:0,top:0,y:identityRect.y-bounds.y});
   gsap.set(contact,{position:"absolute",left:0,right:0,top:0,y:contactRect.y-bounds.y});
   const short=bounds.height<800,finalTop=bounds.height*(short?.04:.08),contactTop=bounds.height*(short?.975:.95)-contact.getBoundingClientRect().height;
   tl.to(identity,{y:finalTop,color:"#f6f7f6",duration:1.35},0);tl.to(identity.querySelectorAll("dt,[data-artwork-artist]"),{color:"#c9cec9",duration:1.25},.08);
   tl.to(contact,{y:contactTop,color:"#f6f7f6",duration:1.5},0);
   tl.to(contact.querySelector("a"),{backgroundColor:"#f6f7f6",color:"#101314",duration:1.25},.08);
   const details=slot?.querySelector<HTMLElement>("[data-finale-details]");if(details)gsap.set(details,{top:finalTop+identity.getBoundingClientRect().height+(short?12:16),bottom:bounds.height-contactTop+(short?20:30)});
  }else if(mobile){const details=readingScene.querySelector<HTMLElement>("[data-finale-details]");if(details)gsap.set(details,{top:(identityRect?.height??0)+12});tl.fromTo(readingScene.querySelector("[data-finale-reading]"),{opacity:0},{opacity:1,duration:.65},.65);gsap.set(identity,{color:"#f6f7f6"});}
  const details=(mobile?readingScene:slot)?.querySelector("[data-finale-details]");
  if(details)tl.fromTo(Array.from(details.children),{opacity:0,x:-10},{opacity:1,x:0,duration:.85,stagger:.08,ease:"power3.out"},.7);
  if(contact)tl.fromTo(contact,{"--finale-contact-rule":0},{"--finale-contact-rule":1,duration:.7},.7);
  tl.progress(resume.current);
  const play=safe!(()=>{prepared.current=true;driver.current?.kill();if(reduced){tl.progress(target.current?1:0);if(!target.current)exit.current();}else driver.current=gsap.to(tl,{progress:target.current?1:0,duration:Math.max(.18,Math.abs((target.current?1:0)-tl.progress())*1.65),ease:"none",onComplete:()=>{if(!target.current)exit.current();}});});
  const descriptionNode=(mobile?readingScene:slot)?.querySelector<HTMLElement>("[data-finale-description]");if(descriptionNode)descriptionNode.scrollTop=store?.read().finaleScrollTop??0;
  const persistReading=()=>{if(descriptionNode)store?.send({type:"finale-reading",top:descriptionNode.scrollTop},art.media.map(m=>m.id));};descriptionNode?.addEventListener("scroll",persistReading,{passive:true});
  const images=Array.from(scene.querySelectorAll<HTMLImageElement>("[data-finale-card] img"));let alive=true;
  void Promise.all(images.map(img=>img.decode().catch(()=>{img.parentElement!.style.visibility="hidden";}))).then(()=>{if(alive)play();});
  const resize=safe!(()=>{driver.current?.kill();tl.progress(target.current?1:0);if(!target.current)exit.current();else setGeometryVersion(v=>v+1);});
  window.addEventListener("resize",resize);document.addEventListener("visibilitychange",resize);
  return()=>{descriptionNode?.removeEventListener("scroll",persistReading);alive=false;resume.current=tl.progress();prepared.current=false;driver.current?.kill();tl.revert();for(const {node,inert,ariaHidden} of priorZoomAccess){node.inert=inert;if(ariaHidden===null)node.removeAttribute("aria-hidden");else node.setAttribute("aria-hidden",ariaHidden);}timeline.current=null;article.removeAttribute("data-finale-scene");article.removeAttribute("data-finale-has-photo");if(information)delete information.dataset.finaleReading;if(host){delete host.dataset.finaleCard;delete host.dataset.front;delete host.dataset.mediaId;}window.removeEventListener("resize",resize);document.removeEventListener("visibilitychange",resize);};
 },{scope:root,dependencies:[anchor,content,mobile,photos,reduced,geometryVersion],revertOnUpdate:true});
 useLayoutEffect(()=>{contextSafe(()=>{const tl=timeline.current;if(!tl||!prepared.current)return;driver.current?.kill();if(reduced){tl.progress(open?1:0);if(!open)exit.current();return;}driver.current=gsap.to(tl,{progress:open?1:0,duration:Math.max(.18,Math.abs((open?1:0)-tl.progress())*1.65),ease:"none",onComplete:()=>{if(!open)exit.current();}});})();},[open,reduced,contextSafe]);
 return <><div ref={root} className={[styles.scene,integration.layer].join(" ")} data-artwork-finale data-finale-open={open} style={{pointerEvents:"none"}}>
  <div className={[styles.black,integration.backdrop].join(" ")} data-finale-black/>
  <div className={styles.camera}>{photos.toReversed().map(photo=><ArtworkFinaleMedia key={photo.id} photo={photo}/>)}</div>
 </div></>;
}
