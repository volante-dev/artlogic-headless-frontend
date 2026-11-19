"use client";
import {useEffect,useRef,useState} from "react";
import type {Artwork} from "@/lib/api/artworks";
import {ArtworkImage} from "../ArtworkImage";
import styles from "./ArtworkCardMedia.module.css";

interface Props {media:Artwork["media"];title:string|null;sizes?:string;eager?:boolean;previewOnHover?:boolean}
export function ArtworkCardMedia(props:Props){
 return <MediaPreview key={props.media.slice(0,2).map(image=>image.id).join(":")} {...props}/>;
}
function MediaPreview({media,title,sizes,eager=false,previewOnHover=true}:Props){
 const root=useRef<HTMLDivElement>(null),secondary=media[1];
 const [requested,setRequested]=useState(false),[hovered,setHovered]=useState(false),[ready,setReady]=useState(false),[failed,setFailed]=useState(false),[previewSizes,setPreviewSizes]=useState(sizes);
 useEffect(()=>{
  const link=root.current?.closest("a");if(!previewOnHover||!link||!secondary)return;
  const enter=()=>{
   if(!matchMedia("(hover:hover) and (pointer:fine)").matches)return;
   const frame=root.current!,box=frame.getBoundingClientRect(),image=frame.querySelector("img");
   const widths=[box.width,box.height*secondary.width/secondary.height];
   setPreviewSizes(Math.ceil(getComputedStyle(image??frame).objectFit==="contain"?Math.min(...widths):Math.max(...widths))+"px");
   setRequested(true);setHovered(true);
  };
  const leave=()=>setHovered(false);
  link.addEventListener("pointerenter",enter);link.addEventListener("pointerleave",leave);
  return()=>{link.removeEventListener("pointerenter",enter);link.removeEventListener("pointerleave",leave);};
 },[secondary,previewOnHover]);
 return <div ref={root} className={styles.media} data-artwork-media data-preview-active={previewOnHover&&hovered&&ready&&!failed||undefined}>
  <div className={styles.primary} data-artwork-primary><ArtworkImage media={media[0]} title={title} sizes={sizes} decorative eager={eager}/></div>
  {previewOnHover&&requested&&secondary&&<div className={styles.secondary} data-artwork-preview aria-hidden="true" onLoadCapture={()=>setReady(true)} onErrorCapture={()=>setFailed(true)}>
   <ArtworkImage media={secondary} title={title} sizes={previewSizes} decorative eager/>
  </div>}
 </div>;
}
