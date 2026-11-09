"use client";
import {useState,useSyncExternalStore} from 'react';
import type {components} from '../../lib/api/generated';
import {MediaBlock} from './MediaBlock';
import {CarouselBlock} from './CarouselBlock';
import styles from './TextMediaGallery.module.css';
type Block=Extract<components['schemas']['EditorialPublicBlock'],{type:'textMedia'}>;
const subscribe=(notify:()=>void)=>{const query=matchMedia('(max-width:899px)');query.addEventListener('change',notify);return()=>query.removeEventListener('change',notify);};
/** Shared media panel: stable occurrences, one mobile carousel, no second gesture engine. */
export function TextMediaGallery({block,active=true,preparing=false,preload=false,timeoutMs,allowZoom=true,immersive=false}:{block:Block;active?:boolean;preparing?:boolean;preload?:boolean;timeoutMs?:number;allowZoom?:boolean;immersive?:boolean}){
 const mobile=useSyncExternalStore(subscribe,()=>matchMedia('(max-width:899px)').matches,()=>false),[selected,setSelected]=useState<string|null>(null);
 const medias=[block.media,...(block.secondMedia?[block.secondMedia]:[])].filter(media=>media.source||media.subtext||media.artworkInfo.length);
 if(!medias.length)return null;
 return <div className={styles.gallery} data-text-media-gallery data-media-count={medias.length} data-media-layout={block.mediaLayout??'columns'} data-immersive={immersive||undefined} data-mobile={mobile||undefined}>
 {immersive&&mobile&&medias.length>1?<CarouselBlock preloadAdjacent preload={preload} block={{id:block.id,type:'carousel',variant:block.variant,automatic:false,intervalSeconds:5,slides:medias.map(media=>({id:media.id,media}))}} active={active} preparing={preparing} timeoutMs={timeoutMs} allowZoom={false} fullFrameMobile activeItemId={selected} onActiveItemChange={setSelected}/>:
 medias.map(media=><div className={styles.item} key={media.id} data-text-media-item><MediaBlock preload={preload} media={media} active={active} preparing={preparing} timeoutMs={timeoutMs} allowZoom={allowZoom&&!immersive} captionFocusable={immersive}/></div>)}
 </div>;
}
