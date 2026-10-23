"use client";
import {useState} from "react";
import Image from "next/image";
import type {Artwork} from "@/lib/api/artworks";
import styles from "./Artwork.module.css";
export function ArtworkImage({media,title,decorative=false,eager=false}:{media?:Artwork["media"][number];title:string|null;decorative?:boolean;eager?:boolean}){
  const [failed,setFailed]=useState(false);
  if(!media||failed)return <div className={styles.placeholder}><span>Image non disponible</span></div>;
  return <Image unoptimized data-testid="artwork-image" className={styles.image} src={"/media/"+media.id} width={media.width} height={media.height} alt={decorative?"":media.alt??title??"Vue de l’œuvre"} loading={eager?"eager":"lazy"} onError={()=>setFailed(true)}/>;
}
