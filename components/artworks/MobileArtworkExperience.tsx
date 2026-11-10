"use client";
import {detailImageSizes} from "@/lib/media/public-image-sizes";
import {useState,useRef,useId,useLayoutEffect,type CSSProperties} from "react";
import {ArtworkFinaleReadingLayer} from "./ArtworkFinaleReadingLayer";
import {ArtworkFinaleScene} from "./ArtworkFinaleScene";
import {ArtworkImage} from "../ArtworkImage";
import {ArtworkMobileInformationPanel} from "./ArtworkMobileInformationPanel";
import {ArtworkMediaTransition} from "./ArtworkMediaTransition";
import {useArtworkMobilePan} from "./useArtworkMobilePan";
import {examinationGeometry} from "./artwork-mobile-examination";
import {useArtworkEntrance} from "./useArtworkEntrance";
import type {MobileArtworkViewProps} from "./ArtworkMobileController";
import {useSiteContent} from "../SiteContentProvider";
import {useArtworkFocus} from "./useArtworkFocus";
import styles from "./MobileArtworkExperience.module.css";
export function MobileArtworkExperience(props:MobileArtworkViewProps){
 const {id,content,state,root,surface,InformationView,ProgressView,supplementalContent,select,send,pointer,onKeyDown,reduced,systemZoom,registerInformationDismiss}=props;
 const pendingFinaleSelection=useRef<number|null>(null);const [finale,setFinale]=useState<{anchor:string|null}|null>(null);if(state.mode==="finale"&&(!finale||finale.anchor!==null&&!content.artwork.media.some(m=>m.id===finale.anchor)))setFinale({anchor:content.artwork.media.some(m=>m.id===state.selectedMediaId)?state.selectedMediaId:content.artwork.media.at(-1)?.id??null});
 const {messages:m}=useSiteContent(),[loaded,setLoaded]=useState<Set<string>>(()=>new Set()),hint=useId();
 useArtworkEntrance(root);const media=content.artwork.media,index=media.findIndex(m=>m.id===state.selectedMediaId),inlineZoom=(state.mode==="examine"||state.mode==="information")&&state.zoom===2,gallery=state.mode==="gallery"||state.mode==="finale"||inlineZoom,active=media[index],ready=active&&loaded.has(active.id);
 useArtworkFocus(surface,index===0&&["gallery","finale","information"].includes(state.mode)&&!inlineZoom?content.heroFocus:null,active);
 const zoom=useArtworkMobilePan({frame:surface,media:active,state,send,systemZoom,enabled:inlineZoom});
 const priorView=useRef<{mode:string;zoomed:boolean;image:HTMLImageElement|null;style:{width:string;height:string;transform:string}}|null>(null);
 useLayoutEffect(()=>{
  const image=surface.current?.querySelector<HTMLImageElement>('[data-active="true"] img')??null,prior=priorView.current;
  let animation:Animation|undefined;
  if(image&&prior?.mode==='information'&&state.mode==='gallery'&&prior.zoomed&&prior.image===image&&!reduced){
   const end=getComputedStyle(image);animation=image.animate([{position:'absolute',left:'50%',top:'50%',width:prior.style.width,height:prior.style.height,transform:prior.style.transform,objectFit:'cover',objectPosition:'center'},{position:'absolute',left:'0px',top:'0px',width:end.width,height:end.height,transform:end.transform,objectFit:'cover',objectPosition:end.objectPosition}],{duration:200,easing:'cubic-bezier(.2,.8,.2,1)'});
  }
  const style=image?getComputedStyle(image):null;priorView.current={mode:state.mode,zoomed:inlineZoom,image,style:{width:style?.width??'',height:style?.height??'',transform:style?.transform??'none'}};
  return()=>animation?.cancel();
 },[state.mode,inlineZoom,reduced,surface]);
 const startZoom=()=>{if(inlineZoom){send({type:"gallery"});return;}send({type:"examine",zoom:2});const frame=surface.current;if(active&&frame){const g=examinationGeometry(active.width,active.height,frame.clientWidth,frame.clientHeight,2);send({type:"pan",x:g.limitX?-.3*(g.width/2-frame.clientWidth)/g.limitX:0,y:0});}};
 const choose=(i:number)=>{if(finale&&i!==Math.max(1,media.length)){pendingFinaleSelection.current=i;send({type:"gallery"});return;}if(inlineZoom)send({type:"gallery"});select(i);};
 const from=media.findIndex(m=>m.id===state.transition?.fromId),zoomOut=Boolean(state.transition&&from>=1&&index>=1);
 return <article id={id} ref={root} className={styles.mobile} data-artwork-experience data-testid="artwork-experience" data-artwork-layout="mobile" data-mobile-mode={state.mode} data-inline-zoom={inlineZoom} data-mobile-transition={state.transition?"running":"idle"} data-active-media={state.selectedMediaId??""} data-rail-tone={gallery||state.mode==="information"?"image":"paper"} onKeyDown={onKeyDown}>
  <div className={styles.gallery} aria-hidden={!gallery&&state.mode!=="information"||undefined}>
   <div inert={state.mode==="information"||undefined} ref={surface} data-artwork-focus-pending={Boolean(index===0&&state.mode==="gallery"&&!inlineZoom&&content.heroFocus)||undefined} className={styles.media} data-artwork-entry-media data-testid="artwork-frame" tabIndex={inlineZoom?0:undefined} role={inlineZoom?"group":undefined} data-mobile-mode-heading={inlineZoom||undefined} aria-label={inlineZoom?m["gallery.panHelp"]:undefined} onKeyDown={inlineZoom?zoom.onKeyDown:undefined} style={{touchAction:systemZoom?"auto":"pinch-zoom","--zoom-width":zoom.geometry.width+"px","--zoom-height":zoom.geometry.height+"px","--zoom-x":state.pan.x*zoom.geometry.limitX+"px","--zoom-y":state.pan.y*zoom.geometry.limitY+"px"} as CSSProperties} {...(inlineZoom?zoom.pointer:pointer)} aria-describedby={hint}>
    {media.length?media.map((item,i)=><ArtworkMediaTransition key={item.id} active={i===index} zoomOut={zoomOut}><div className={styles.image} data-finale-photo={item.id} data-active={i===index} aria-hidden={i!==index||undefined} inert={i!==index||undefined} onLoadCapture={()=>setLoaded(prior=>new Set([...prior,item.id]))} onErrorCapture={()=>{setLoaded(prior=>{const next=new Set(prior);next.delete(item.id);return next;});if(inlineZoom&&i===index)send({type:"gallery"});}}><div className={i===0?styles.introDrift:styles.mediaContent} data-artwork-intro-drift={i===0||undefined}><ArtworkImage sizes={detailImageSizes(item.width/item.height)} forceReference={inlineZoom&&i===index} slot="examination" media={item} title={content.artwork.title} eager={i===0||i===index}/></div></div></ArtworkMediaTransition>):<ArtworkImage title={content.artwork.title}/>}
   </div>
   {(gallery||state.mode==="information")&&<ArtworkMobileInformationPanel content={content} state={state} InformationView={InformationView} supplementalContent={supplementalContent} send={send} reduced={reduced} registerInformationDismiss={registerInformationDismiss}/>}
   <div inert={state.mode==="information"||undefined} aria-hidden={state.mode==="information"||undefined} data-mobile-image-controls className={styles.examineActions}>
    <button data-artwork-entry-controls data-mobile-trigger="examine" className={styles.action} disabled={!ready} aria-pressed={inlineZoom} aria-label={m[inlineZoom?"gallery.zoomOut":"gallery.zoomIn"]} onClick={event=>{event.currentTarget.focus({preventScroll:true});startZoom();}}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="9" r="5.5"/><path d="m13 13 6 6M6 9h6"/>{!inlineZoom&&<path d="M9 6v6"/>}</svg></button>
   </div>
   <div className={styles.timelineOwner} inert={state.mode==="information"||undefined} aria-hidden={state.mode==="information"||undefined}><ProgressView finale count={Math.max(1,media.length)+1} active={state.mode==="finale"?Math.max(1,media.length):Math.max(0,index)} onSelect={choose} className={styles.timeline}/></div>
  </div>
  <ArtworkFinaleReadingLayer content={content} active={state.mode==="finale"}/>
  {finale&&<ArtworkFinaleScene owner={root} content={content} anchor={finale.anchor} open={state.mode==="finale"} mobile onExited={()=>{setFinale(null);if(pendingFinaleSelection.current!==null){select(pendingFinaleSelection.current);pendingFinaleSelection.current=null;}}}/>}
  <span className={styles.srOnly} role="status">{state.mode==="finale"?"Conclusion":""}</span>
  <span id={hint} className={styles.srOnly}>{m[inlineZoom?"gallery.panHelp":"gallery.mobileGestureHelp"]}</span>
 </article>;
}
