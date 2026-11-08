"use client";
import {detailImageSizes} from "@/lib/media/public-image-sizes";
import {useId,useRef,useState,type KeyboardEvent,type PointerEvent} from "react";
import type {Artwork} from "../../lib/api/artworks";
import {ArtworkMediaTransition} from "./ArtworkMediaTransition";
import {ArtworkImage} from "../ArtworkImage";
import {useSiteContent} from "../SiteContentProvider";
import {useArtworkFocus} from "./useArtworkFocus";
import type {HeroFocus} from "../../lib/artworks/focus";
import styles from "./ArtworkExperience.module.css";
/** Zoom belongs to the explicit control; the image itself never navigates. */
export function ArtworkZoomImage({media,title,active=true,eager=false,transitioning=false,zoomOut=false,introDrift=false,heroFocus,controlSurface="light"}:{controlSurface?:"light"|"image";heroFocus?:HeroFocus|null;media:Artwork["media"][number];title:string|null;active?:boolean;eager?:boolean;transitioning?:boolean;zoomOut?:boolean;introDrift?:boolean}){
 const {messages:m}=useSiteContent(),hint=useId(),surface=useRef<HTMLDivElement>(null),position=useRef({x:.5,y:.5});
 const [state,setState]=useState({active,zoomed:false}),[ready,setReady]=useState(false);
 if(state.active!==active)setState({active,zoomed:false});
 const zoomed=state.active===active&&state.zoomed;
 useArtworkFocus(surface,zoomed?null:heroFocus,media);
 function pan(x:number,y:number){
  const element=surface.current;if(!element)return;
  position.current={x:Math.max(0,Math.min(1,x)),y:Math.max(0,Math.min(1,y))};
  element.style.setProperty("--artwork-pan-x",(0.5-position.current.x)*element.clientWidth+"px");
  element.style.setProperty("--artwork-pan-y",(0.5-position.current.y)*element.clientHeight+"px");
 }
 function move(event:PointerEvent<HTMLDivElement>){
  if(!zoomed||event.target instanceof Element&&event.target.closest("button"))return;
  if(event.pointerType!=="mouse"&&event.buttons!==1)return;
  const rect=event.currentTarget.getBoundingClientRect();pan((event.clientX-rect.left)/rect.width,(event.clientY-rect.top)/rect.height);
 }
 function keys(event:KeyboardEvent<HTMLDivElement>){
  if(!zoomed)return;
  if(event.key==="Escape"){event.preventDefault();event.stopPropagation();setState({active,zoomed:false});return;}
  if(event.target!==surface.current)return;
  const delta:Record<string,[number,number]>={ArrowLeft:[-.1,0],ArrowRight:[.1,0],ArrowUp:[0,-.1],ArrowDown:[0,.1]};
  const step=delta[event.key];if(step){event.preventDefault();event.stopPropagation();pan(position.current.x+step[0],position.current.y+step[1]);}
 }
 return <div className={styles.zoomView} data-zoomed={zoomed} onKeyDown={keys}>
  <div ref={surface} data-artwork-focus-pending={Boolean(heroFocus&&!zoomed)||undefined} className={styles.zoomSurface} tabIndex={zoomed?0:undefined} role={zoomed?"group":undefined} aria-label={zoomed?media.alt??title??m["artwork.imageAlt"]:undefined} aria-describedby={zoomed?hint:undefined} onPointerMove={move} onPointerDown={event=>{if(zoomed&&event.pointerType!=="mouse"){event.currentTarget.setPointerCapture(event.pointerId);event.preventDefault();}}} onLoadCapture={()=>setReady(true)} onErrorCapture={()=>{setReady(false);setState({active,zoomed:false});}}>
   {transitioning?<ArtworkMediaTransition active={active} zoomOut={zoomOut}><div className={introDrift?styles.introDrift:styles.mediaContent} data-artwork-intro-drift={introDrift||undefined}><ArtworkImage sizes={detailImageSizes(media.width/media.height)} forceReference={zoomed} slot="examination" media={media} title={title} eager={eager}/></div></ArtworkMediaTransition>:<ArtworkImage sizes={detailImageSizes(media.width/media.height)} forceReference={zoomed} slot="examination" media={media} title={title} eager={eager}/>}
  </div>
  {ready&&active&&<button type="button" data-artwork-entry-controls data-control-surface={controlSurface} className={styles.zoomControl} aria-pressed={zoomed} aria-label={m[zoomed?"gallery.zoomOut":"gallery.zoomIn"]} onClick={()=>{pan(.5,.5);setState({active,zoomed:!zoomed});}}>
   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true"><circle cx="10" cy="10" r="6.5"/><path d="m15 15 6 6M7 10h6"/>{!zoomed&&<path d="M10 7v6"/>}</svg>
  </button>}
  <span id={hint} className={styles.srOnly}>{m["gallery.zoomHelp"]}</span>
 </div>;
}
