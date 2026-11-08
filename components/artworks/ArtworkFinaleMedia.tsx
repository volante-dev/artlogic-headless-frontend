"use client";
import {detailImageSizes} from "@/lib/media/public-image-sizes";
import {ArtworkImage} from "../ArtworkImage";
import {useMediaDisplayContext} from "@/lib/media/MediaDisplayProvider";
import {useEffect,useRef} from "react";
import {useMediaDisplay} from "@/lib/media/useMediaDisplay";
import type {FinaleRect} from "../../lib/artworks/finale-geometry";
import styles from "./ArtworkFinale.module.css";
export interface FinalePhoto {id:string;src:string;width:number;height:number;alt:string}
function decodePhoto(image:HTMLImageElement,onReady?:()=>void,onFailure?:()=>void){void image.decode().then(()=>{if(image.isConnected&&image.dataset.finaleDecoded!=="true"){image.dataset.finaleDecoded="true";onReady?.();}},()=>onFailure?.());}
export function ArtworkFinaleMedia({photo,front=false,onReady,onFailure}:{photo:FinalePhoto;front?:boolean;onReady?:()=>void;onFailure?:()=>void}){
 const responsive=useMediaDisplayContext()?.responsive;
 const display=useMediaDisplay("/media/"+photo.id,"artwork",photo.id),image=useRef<HTMLImageElement>(null);
 useEffect(()=>{if(!responsive&&display.failed)onFailure?.();},[responsive,display.failed,onFailure]);
 useEffect(()=>{const node=image.current;if(node?.complete&&node.naturalWidth)decodePhoto(node,onReady,onFailure);},[photo.src,onReady,onFailure]);
 return <div onLoadCapture={event=>{if(responsive&&event.target instanceof HTMLImageElement)decodePhoto(event.target,onReady,onFailure);}} className={styles.card} data-finale-card data-front={front?"true":"false"} data-media-id={photo.id} aria-hidden={!front}>
  {/* Existing decoded proxies are supplied by the caller; no original-image lookup here. */}
  {/* eslint-disable-next-line @next/next/no-img-element */}
  {responsive?<ArtworkImage media={{id:photo.id,width:photo.width,height:photo.height,alt:front?photo.alt:"",path:"/v1/public/media/"+photo.id}} title={photo.alt} decorative eager sizes={detailImageSizes(photo.width/photo.height)} onFailure={onFailure} slot="finale"/>:<img ref={node=>{image.current=node;display.image(node);}} src={display.src} width={photo.width} height={photo.height} alt={front?photo.alt:""} draggable={false} onLoad={event=>{display.onLoad();decodePhoto(event.currentTarget,onReady,display.onError);}} onError={display.onError}/>}
 </div>;
}
export function setFinaleBitmap(element:HTMLElement,rect:FinaleRect){Object.assign(element.style,{left:rect.x+"px",top:rect.y+"px",width:rect.width+"px",height:rect.height+"px"});}
