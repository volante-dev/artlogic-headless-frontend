"use client";
import {useRef} from "react";
import {useTextMediaAppearance} from "./useTextMediaAppearance";
import type {components} from "../../lib/api/generated";
import {RichText} from "./RichText";
import {TextMediaGallery} from "./TextMediaGallery";
import styles from "./EditorialBlocks.module.css";
type Block=Extract<components["schemas"]["EditorialPublicBlock"],{type:"textMedia"}>;
export function TextMediaBlock({block,active=true,timeoutMs,preparing=false,preload=false,allowZoom=true,immersive=false}:{block:Block;active?:boolean;timeoutMs?:number;preparing?:boolean;preload?:boolean;allowZoom?:boolean;immersive?:boolean}){
 const host=useRef<HTMLElement>(null);useTextMediaAppearance(host,block.id,block.immersiveAnimation??"split-fade",!immersive);
 return <section ref={host} className={[styles.textMedia,!block.media.source&&!block.secondMedia?.source?styles.retired:"",block.layout==="successive"?styles.successive:styles.split,block.desktopMediaSide==="left"?styles.mediaLeft:"",block.mobileMediaOrder==="before"?styles.mobileMediaFirst:styles.mobileTextFirst].filter(Boolean).join(" ")}><div data-editorial-scroll-host data-editorial-motion-text className={styles.textPanel}><RichText document={block.text}/></div><div data-editorial-motion-media className={styles.mediaPanel}><TextMediaGallery preload={preload} immersive={immersive} allowZoom={allowZoom} block={block} active={active} timeoutMs={timeoutMs} preparing={preparing}/></div></section>;
}
