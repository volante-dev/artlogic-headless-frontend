"use client";
import {useState} from "react";
import {Typography} from "../components/ui/Typography";
import {Link} from "../components/ui/Link";
import {useSiteContent} from "../components/SiteContentProvider";
import {presentationHref} from "../lib/presentation/links";
import {presentationAssetPath,type PresentationAsset,type PresentationLink} from "../lib/presentation/types";
import styles from "./Sections.module.css";

export function SectionHeading({text,level="h2",id}:{text?:string;level?:"h1"|"h2";id?:string}){return text?<Typography variant={level} id={id}>{text}</Typography>:null;}
export function Paragraphs({text}:{text?:string}){return text?<div className={styles.prose}>{text.split(/\n\s*\n/).map((paragraph,index)=><Typography key={index} sx={{whiteSpace:"pre-line"}}>{paragraph}</Typography>)}</div>:null;}
export function SectionLink({link,label}:{link?:PresentationLink;label?:string}){const {locale,defaultLocale,messages}=useSiteContent();return link?<Link className={styles.link} href={presentationHref(link,locale,defaultLocale)}>{label||messages["presentation.readMore"]}</Link>:null;}
export function EmptySection(){const {messages}=useSiteContent();return <Typography color="text.secondary">{messages["presentation.empty"]}</Typography>;}
export interface SectionImageProps {image?:PresentationAsset|null;alt?:string;decorative?:boolean;caption?:string;focalPoint?:{x:number;y:number};sizes?:string}
export function SectionImage({image,alt,decorative=false,caption,focalPoint,sizes="(max-width: 767px) 100vw, 50vw"}:SectionImageProps){
  const [failed,setFailed]=useState(false),{messages,scope}=useSiteContent();
  if(!image||failed)return <div className={styles.imagePlaceholder}>{messages["artwork.imageUnavailable"]}</div>;
  const variants=image.variants?.filter(variant=>variant.width).sort((a,b)=>a.width!-b.width!)??[];
  return <figure className={styles.figure}>
    {/* Exact authorized variants; Next's image optimizer must not cache private media. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={presentationAssetPath(image.path,scope)} srcSet={variants.map(variant=>`${presentationAssetPath(variant.path,scope)} ${variant.width}w`).join(", ")||undefined} sizes={sizes} width={image.width??undefined} height={image.height??undefined} alt={decorative?"":alt||messages["artwork.imageAlt"]} loading="lazy" decoding="async" onError={()=>setFailed(true)} style={focalPoint?{objectPosition:`${focalPoint.x*100}% ${focalPoint.y*100}%`}:undefined}/>
    {caption&&<Typography variant="caption" component="figcaption">{caption}</Typography>}
  </figure>;
}
