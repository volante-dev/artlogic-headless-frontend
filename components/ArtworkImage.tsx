"use client";
import type {CSSProperties} from "react";
import {ResponsivePublicImage} from "./ResponsivePublicImage";
import {physicalImageDescriptor} from "@/lib/media/public-image-descriptor";
import {useMediaDisplayContext} from "@/lib/media/MediaDisplayProvider";
import {useSiteContent} from "./SiteContentProvider";
import {useMediaDisplay} from "@/lib/media/useMediaDisplay";
import Image from "next/image";
import {Button} from "./ui/Button";
import type {Artwork} from "@/lib/api/artworks";
import styles from "./Artwork.module.css";
function LegacyArtworkImage({media,title,decorative=false,eager=false}:{media?:Artwork["media"][number];title:string|null;decorative?:boolean;eager?:boolean}){
  const {messages}=useSiteContent(),{image:imageRef,src,failed,onLoad,restart}=useMediaDisplay(media?"/media/"+media.id:undefined,"artwork",media?.id);
  if(!media||failed)return <div className={styles.placeholder}><span>{messages["artwork.imageUnavailable"]}</span>{media&&failed&&!decorative&&<Button onClick={event=>{const heading=event.currentTarget.closest("[data-artwork-experience]")?.querySelector<HTMLElement>("[data-artwork-focus-heading]");restart();heading?.focus({preventScroll:true});}}>{messages["catalog.retry"]}</Button>}</div>;
  return <Image ref={imageRef} onLoad={onLoad} unoptimized data-testid="artwork-image" className={styles.image} src={src} width={media.width} height={media.height} alt={decorative?"":media.alt??title??messages["artwork.imageAlt"]} loading={eager?"eager":"lazy"}/>;
}

export function ArtworkImage({media,title,decorative=false,eager=false,sizes="100vw",forceReference=false,slot,style,onFailure}:{media?:Artwork["media"][number];title:string|null;decorative?:boolean;eager?:boolean;sizes?:string;forceReference?:boolean;slot?:string;style?:CSSProperties;onFailure?:()=>void}){
 const context=useMediaDisplayContext(),site=useSiteContent();
 if(!context?.responsive||site.scope!=="public"||!media)return <LegacyArtworkImage media={media} title={title} decorative={decorative} eager={eager}/>;
 const resource={resourceKind:"artwork" as const,resourceId:media.id},descriptor=physicalImageDescriptor(resource,{width:media.width,height:media.height,mimeType:"image/webp"},media.id+".ref");
 return <ResponsivePublicImage onTerminalFailure={onFailure} style={style} allowRetry={!decorative} resource={resource} descriptor={descriptor} sizes={sizes} forceReference={forceReference} slot={slot} data-testid="artwork-image" className={styles.image} width={media.width} height={media.height} alt={decorative?"":media.alt??title??site.messages["artwork.imageAlt"]} eager={eager}/>;
}
