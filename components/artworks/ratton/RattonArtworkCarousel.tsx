"use client";
import {useCallback,useEffect,useLayoutEffect,useRef} from "react";
import type {ArtworkContent} from "../ArtworkInformation";
import {ArtworkZoomImage} from "../ArtworkZoomImage";
import {ArtworkImage} from "../../ArtworkImage";
import {useSiteContent} from "../../SiteContentProvider";
import {useArtworkOpening,useArtworkOpeningPhase} from "../ArtworkOpeningBoundary";
import {useRattonArtworkVisit} from "./RattonArtworkVisitBoundary";
import {rattonPhotoWindow} from "./ratton-artwork-state";
import {useRattonArtworkCarouselGesture} from "./useRattonArtworkCarouselGesture";
import {ViewProgress} from "../../navigation/ViewProgress";
import type {RattonMobileExpansion} from "./useRattonMobileExpansion";
import {rattonArtworkImageSizes,rattonArtworkExpandedImageSizes} from "../../../lib/artworks/ratton-artwork-image";
import styles from "./RattonArtwork.module.css";
function Arrow({next=false}:{next?:boolean}){return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true"><path d={next?"M4 12h16m-6-6 6 6-6 6":"M20 12H4m6-6-6 6 6 6"}/></svg>;}
export function RattonArtworkCarousel({content,expansion}:{content:ArtworkContent;expansion:RattonMobileExpansion}){
 useArtworkOpeningPhase();
 const {messages:m}=useSiteContent(),{store,state}=useRattonArtworkVisit(),opening=useArtworkOpening(),container=useRef<HTMLDivElement>(null);
 const media=content.artwork.media,ids=media.map(m=>m.id),signature=ids.join("|"),index=Math.max(0,ids.indexOf(state.selectedMediaId??"")),current=media[index],windowIds=rattonPhotoWindow(ids,current?.id??null),closing=Boolean(opening?.isClosing);
 useLayoutEffect(()=>{store.reconcile(signature?signature.split("|"):[]);},[store,signature]);
 const move=(delta:number)=>{if(opening?.isClosing||expansion.busy)return;store.move(signature?signature.split("|"):[],delta);};
 const gesture=useRattonArtworkCarouselGesture(move,Boolean(state.zoomMediaId)||closing||expansion.busy);
 const decode=useCallback((image:HTMLImageElement)=>{const source=image.currentSrc;if(!source||!image.complete||!image.naturalWidth)return;const frame=image.closest<HTMLElement>("[data-ratton-photo]");if(frame)frame.dataset.rattonDecoded="false";void image.decode().then(()=>{if(frame?.isConnected&&image.currentSrc===source)frame.dataset.rattonDecoded="true";},()=>{});},[]);
 useEffect(()=>{for(const image of container.current?.querySelectorAll<HTMLImageElement>("img")??[])decode(image);},[decode,signature,index]);
 const nextLabel=content.locale.startsWith("fr")?"Vue suivante":content.locale.startsWith("en")?"Next view":m["gallery.nextPage"],previousLabel=content.locale.startsWith("fr")?"Vue précédente":content.locale.startsWith("en")?"Previous view":m["gallery.previousPage"];
 return <div ref={container} className={styles.carousel} role="group" aria-label={m["gallery.progressLabel"]} data-ratton-carousel data-ratton-has-navigation={media.length>1} data-ratton-expanded={expansion.mobile&&expansion.expanded||undefined} onLoadCapture={event=>{if(event.target instanceof HTMLImageElement)decode(event.target);}} onKeyDown={event=>{if(state.zoomMediaId||closing||expansion.busy||event.altKey||event.ctrlKey||event.metaKey||!(event.target instanceof Element)||event.target.closest("input,textarea,select,[contenteditable=true]"))return;if(event.key==="ArrowLeft"||event.key==="ArrowRight"){event.preventDefault();move(event.key==="ArrowRight"?1:-1);}}}>
  <div className={styles.photos} {...gesture}>
   {current?media.filter(photo=>windowIds.includes(photo.id)).map(photo=>{const active=photo.id===current.id,photoIndex=ids.indexOf(photo.id);return <div key={photo.id} className={styles.photo} data-ratton-photo={photo.id} data-ratton-current={active?"true":undefined} data-current={active} role="group" aria-label={`${m["gallery.view"]} ${photoIndex+1} / ${media.length}`} aria-hidden={!active||undefined} inert={!active}>
    <ArtworkZoomImage media={photo} title={content.artwork.title} active={active} eager fit="contain" sizes={expansion.mobile&&expansion.expanded?rattonArtworkExpandedImageSizes(photo.width/photo.height):rattonArtworkImageSizes(photo.width/photo.height)} imageSlot="ratton-carousel" fetchPriority={active?"high":"low"} heroFocus={null} expansionControl={expansion.mobile?{expanded:expansion.expanded,busy:expansion.busy||closing,toggle:expansion.toggle}:undefined} zoomed={state.zoomMediaId===photo.id} onZoomChange={zoomed=>{if(zoomed)store.patch({zoomMediaId:photo.id});else if(store.read().zoomMediaId===photo.id)store.patch({zoomMediaId:null});}}/>
   </div>;}):<div className={styles.empty}><ArtworkImage title={content.artwork.title}/></div>}
  </div>
  {media.length>1&&<div className={styles.navigation} data-ratton-navigation>
   <button type="button" disabled={index===0||closing||expansion.busy||Boolean(state.zoomMediaId)} onClick={()=>move(-1)} aria-label={previousLabel}><Arrow/></button>
   <span className={styles.counter} data-ratton-counter aria-live="polite" aria-atomic="true">{index+1} / {media.length}</span>
   <button type="button" disabled={index===media.length-1||closing||expansion.busy||Boolean(state.zoomMediaId)} onClick={()=>move(1)} aria-label={nextLabel}><Arrow next/></button>
  </div>}
  {media.length>0&&<div className={styles.timelineFrame} data-ratton-timeline aria-hidden={!expansion.mobile||expansion.phase!=="expanded"||undefined} inert={!expansion.mobile||expansion.phase!=="expanded"}>
   <ViewProgress count={media.length} active={index} onSelect={next=>move(next-index)} className={styles.timeline} stepClassName={styles.timelineStep} singleClassName={styles.timelineStep} navigationLabel={m["gallery.progressLabel"]} stepLabel={(i,total)=>`${m["gallery.view"]} ${i+1} / ${total}`}/>
  </div>}
 </div>;
}
