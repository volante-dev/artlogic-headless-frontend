"use client";
import {useEffect,useRef} from "react";
import type {components} from "../../lib/api/generated";
import {FormBlock} from "./FormBlock";
import {RichText} from "./RichText";
import {MediaBlock} from "./MediaBlock";
import {TextMediaBlock} from "./TextMediaBlock";
import {ImageGroupBlock} from "./ImageGroupBlock";
import {CarouselBlock} from "./CarouselBlock";
import styles from "./EditorialBlocks.module.css";
export type EditorialBlocksProps={blocks:components["schemas"]["EditorialPublicBlock"][];registry?:typeof import("../../lib/editorial/immersive/registry").editorialBlockRegistry};
/** Authorized DTOs only. No datasource, storage key or client-side permission lookup. */
export function ClassicEditorialBlock({block}:{block:components["schemas"]["EditorialPublicBlock"]}){return block.type==="form"||block.type==="formImage"?<FormBlock block={block}/>:block.type==="text"?<section className={styles.textBlock}><RichText document={block.text}/></section>:block.type==="media"?<section className={styles.mediaBlock}><MediaBlock media={block.media}/></section>:block.type==="textMedia"?<TextMediaBlock block={block}/>:block.type==="imageGroup"?<ImageGroupBlock block={block}/>:<CarouselBlock block={block}/>;}
export function EditorialBlocks({blocks,registry}:EditorialBlocksProps){const host=useRef<HTMLDivElement>(null);useEffect(()=>{const element=host.current,header=element?.closest('[data-editorial-layout]')?.querySelector('header');if(!element)return;const measure=()=>element.style.setProperty('--editorial-classic-media-height',Math.max(0,(window.innerHeight-(header?.getBoundingClientRect().height??0))*.8)+'px');const observer=new ResizeObserver(measure);if(header)observer.observe(header);window.addEventListener('resize',measure);measure();return()=>{observer.disconnect();window.removeEventListener('resize',measure);};},[]);return <div ref={host} className={styles.blocks}>{blocks.filter(block=>block.type!=="media"||block.media.source!==null||block.media.subtext!==null).map(block=>{const View=registry?.[block.type].ClassicView??ClassicEditorialBlock;return <View key={block.id} block={block}/>;})}</div>;}
