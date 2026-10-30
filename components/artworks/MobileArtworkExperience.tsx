"use client";
import {useState,useId,type CSSProperties} from "react";
import {ArtworkImage} from "../ArtworkImage";
import {ArtworkIdentity} from "./ArtworkIdentity";
import {ArtworkMobileInformationPanel} from "./ArtworkMobileInformationPanel";
import {ArtworkMobileExamination} from "./ArtworkMobileExamination";
import {ArtworkMediaTransition} from "./ArtworkMediaTransition";
import {useArtworkMobilePan} from "./useArtworkMobilePan";
import {examinationGeometry} from "./artwork-mobile-examination";
import {useArtworkEntrance} from "./useArtworkEntrance";
import type {MobileArtworkViewProps} from "./ArtworkMobileController";
import {useSiteContent} from "../SiteContentProvider";
import styles from "./MobileArtworkExperience.module.css";
export function MobileArtworkExperience(props:MobileArtworkViewProps){
 const {id,content,state,root,surface,InformationView,ProgressView,supplementalContent,select,send,pointer,onKeyDown,reduced,systemZoom}=props;
 const {messages:m}=useSiteContent(),[loaded,setLoaded]=useState<Set<string>>(()=>new Set()),hint=useId();
 useArtworkEntrance(root);const media=content.artwork.media,index=media.findIndex(m=>m.id===state.selectedMediaId),inlineZoom=state.mode==="examine"&&state.zoom===2,gallery=state.mode==="gallery"||inlineZoom,active=media[index],ready=active&&loaded.has(active.id);
 const zoom=useArtworkMobilePan({frame:surface,media:active,state,send,systemZoom,enabled:inlineZoom});
 const startZoom=()=>{if(inlineZoom){send({type:"gallery"});return;}send({type:"examine",zoom:2});const frame=surface.current;if(active&&frame){const g=examinationGeometry(active.width,active.height,frame.clientWidth,frame.clientHeight,2);send({type:"pan",x:g.limitX?-.3*(g.width/2-frame.clientWidth)/g.limitX:0,y:0});}};
 const choose=(i:number)=>{if(inlineZoom)send({type:"gallery"});select(i);};
 const from=media.findIndex(m=>m.id===state.transition?.fromId),zoomOut=Boolean(state.transition&&from>=1&&index>=1);
 return <article id={id} ref={root} className={styles.mobile} data-artwork-experience data-testid="artwork-experience" data-artwork-layout="mobile" data-mobile-mode={state.mode} data-inline-zoom={inlineZoom} data-mobile-transition={state.transition?"running":"idle"} data-active-media={state.selectedMediaId??""} data-rail-tone={gallery?"image":"paper"} onKeyDown={onKeyDown}>
  <div className={styles.gallery} inert={!gallery||undefined} aria-hidden={!gallery||undefined}>
   <div ref={surface} className={styles.media} data-artwork-entry-media data-testid="artwork-frame" tabIndex={inlineZoom?0:undefined} role={inlineZoom?"group":undefined} data-mobile-mode-heading={inlineZoom||undefined} aria-label={inlineZoom?m["gallery.panHelp"]:undefined} onKeyDown={inlineZoom?zoom.onKeyDown:undefined} style={{touchAction:systemZoom?"auto":"pinch-zoom","--zoom-width":zoom.geometry.width+"px","--zoom-height":zoom.geometry.height+"px","--zoom-x":state.pan.x*zoom.geometry.limitX+"px","--zoom-y":state.pan.y*zoom.geometry.limitY+"px"} as CSSProperties} {...(inlineZoom?zoom.pointer:pointer)} aria-describedby={hint}>
    {media.length?media.map((item,i)=><ArtworkMediaTransition key={item.id} active={i===index} zoomOut={zoomOut}><div className={styles.image} data-active={i===index} aria-hidden={i!==index||undefined} inert={i!==index||undefined} onLoadCapture={()=>setLoaded(prior=>new Set([...prior,item.id]))} onErrorCapture={()=>{setLoaded(prior=>{const next=new Set(prior);next.delete(item.id);return next;});if(inlineZoom&&i===index)send({type:"gallery"});}}><ArtworkImage media={item} title={content.artwork.title} eager={i===0||i===index}/></div></ArtworkMediaTransition>):<ArtworkImage title={content.artwork.title}/>}
   </div>
   {gallery&&<div className={styles.caption} data-artwork-frost>
    <div className={styles.identityReading} data-artwork-reading><ArtworkIdentity content={content}/></div>
    <button data-mobile-trigger="information" className={styles.informationAction} onClick={()=>send({type:"information"})}>{m["gallery.openInformation"]}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 14 6-6 6 6"/></svg></button>
   </div>}
   <div data-artwork-entry-controls className={styles.examineActions}>
    <button data-mobile-trigger="examine" className={styles.action} disabled={!ready} aria-label={m["gallery.viewWholeImage"]} onClick={()=>send({type:"examine",zoom:1})}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4H4v5m11-5h5v5M4 15v5h5m6 0h5v-5"/></svg></button>
    <button className={styles.action} disabled={!ready} aria-pressed={inlineZoom} aria-label={m[inlineZoom?"gallery.zoomOut":"gallery.zoomIn"]} onClick={event=>{event.currentTarget.focus({preventScroll:true});startZoom();}}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="9" r="5.5"/><path d="m13 13 6 6M6 9h6"/>{!inlineZoom&&<path d="M9 6v6"/>}</svg><span>{inlineZoom?"×1":"×2"}</span></button>
   </div>
   <ProgressView count={media.length} active={Math.max(0,index)} onSelect={choose} className={styles.timeline}/>
  </div>
  {state.mode==="information"&&<ArtworkMobileInformationPanel content={content} state={state} InformationView={InformationView} supplementalContent={supplementalContent} send={send} reduced={reduced}/>}
  {state.mode==="examine"&&!inlineZoom&&<ArtworkMobileExamination content={content} state={state} send={send} systemZoom={systemZoom}/>}
  <span id={hint} className={styles.srOnly}>{m[inlineZoom?"gallery.panHelp":"gallery.mobileGestureHelp"]}</span>
 </article>;
}
