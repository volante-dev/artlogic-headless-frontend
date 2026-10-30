"use client";
import {useRef} from "react";
import {ArtworkImage} from "../ArtworkImage";
import {ArtworkIdentity} from "./ArtworkIdentity";
import type {MobileArtworkViewProps} from "./ArtworkMobileController";
import {useArtworkMobilePan} from "./useArtworkMobilePan";
import {useSiteContent} from "../SiteContentProvider";
import styles from "./MobileArtworkExperience.module.css";
export function ArtworkMobileExamination({content,state,send,systemZoom}:{content:MobileArtworkViewProps["content"];state:MobileArtworkViewProps["state"];send:MobileArtworkViewProps["send"];systemZoom:boolean}){
 const {messages:m}=useSiteContent(),frame=useRef<HTMLDivElement>(null),media=content.artwork.media.find(m=>m.id===state.selectedMediaId);
 const {geometry,pointer,onKeyDown}=useArtworkMobilePan({frame,media,state,send,systemZoom});
 if(!media)return null;
 return <section className={styles.examination} aria-label={m[state.zoom===1?"gallery.viewWholeImage":"gallery.zoomIn"]}>
  <div ref={frame} className={styles.examineFrame} tabIndex={0} role="group" data-mobile-mode-heading aria-label={m["gallery.panHelp"]} style={{touchAction:systemZoom?"auto":"pinch-zoom"}} onKeyDown={onKeyDown} {...pointer}
   onErrorCapture={()=>send({type:"gallery"})}>
   <div className={styles.inspectedImage} style={{width:geometry.width,height:geometry.height,transform:`translate(calc(-50% + ${state.pan.x*geometry.limitX}px), calc(-50% + ${state.pan.y*geometry.limitY}px))`}}><ArtworkImage media={media} title={content.artwork.title} eager/></div>
  </div>
  <div className={styles.inspectionBar}>
   <ArtworkIdentity content={content} className={styles.inspectionIdentity}/>
   <div className={styles.inspectionActions}>
    <button className={styles.action} aria-label={m[state.zoom===1?"gallery.zoomIn":"gallery.viewWholeImage"]} onClick={()=>send({type:"examine",zoom:state.zoom===1?2:1})}>{state.zoom===1?"×2":"×1"}</button>
    <button className={styles.back} onClick={()=>send({type:"gallery"})}>{m["gallery.backToImages"]}</button>
   </div>
  </div>
 </section>;
}
