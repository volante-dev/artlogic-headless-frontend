"use client";
import {useSiteContent} from "./SiteContentProvider";
import {useState,useRef,useEffect} from "react";
import Image from "next/image";
import type {Artwork} from "@/lib/api/artworks";
import styles from "./Artwork.module.css";
export function ArtworkImage({media,title,decorative=false,eager=false}:{media?:Artwork["media"][number];title:string|null;decorative?:boolean;eager?:boolean}){
  const [failed,setFailed]=useState(false),{messages}=useSiteContent();
  const image=useRef<HTMLImageElement>(null),timeout=useRef<ReturnType<typeof setTimeout>|null>(null);
  useEffect(()=>{if(!eager||!media||failed)return;timeout.current=setTimeout(()=>{if(image.current&&(!image.current.complete||image.current.naturalWidth===0))setFailed(true);},10000);return ()=>{if(timeout.current)clearTimeout(timeout.current);};},[eager,media,failed]);
  if(!media||failed)return <div className={styles.placeholder}><span>{messages["artwork.imageUnavailable"]}</span></div>;
  return <Image ref={image} onLoad={()=>{if(timeout.current)clearTimeout(timeout.current);}} unoptimized data-testid="artwork-image" className={styles.image} src={"/media/"+media.id} width={media.width} height={media.height} alt={decorative?"":media.alt??title??messages["artwork.imageAlt"]} loading={eager?"eager":"lazy"} onError={()=>setFailed(true)}/>;
}
