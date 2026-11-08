"use client";
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import type {components} from '../../lib/api/generated';
import {reconcileImageGroupItem} from '../../lib/editorial/image-group-state';
import {MediaBlock} from './MediaBlock';
import {CarouselBlock} from './CarouselBlock';
import {useImageGroupAppearance} from "./useImageGroupAppearance";
import styles from './ImageGroupBlock.module.css';
type Group=Extract<components['schemas']['EditorialPublicBlock'],{type:'imageGroup'}>;
const subscribeMobile=(notify:()=>void)=>{const query=matchMedia('(max-width:899px)');query.addEventListener('change',notify);return()=>query.removeEventListener('change',notify);};
/** A single carousel engine on mobile; authorized image DTOs only. */
export function ImageGroupBlock({block,active=true,preparing=false,allowZoom=true,immersive=false}:{block:Group;active?:boolean;preparing?:boolean;allowZoom?:boolean;immersive?:boolean}){
 const host=useRef<HTMLElement>(null),hasItems=block.items.length>0;
 const mobile=useSyncExternalStore(subscribeMobile,()=>matchMedia('(max-width:899px)').matches,()=>false);
 const [state,setState]=useState<{ids:string[];activeId:string|null}>(()=>({ids:block.items.map(item=>item.id),activeId:block.items[0]?.id??null}));
 const ids=block.items.map(item=>item.id),selection=reconcileImageGroupItem(state.ids,ids,state.activeId);
 if(ids.join(',')!==state.ids.join(','))setState({ids,activeId:selection});
 useEffect(()=>{const element=host.current,header=element?.closest('[data-editorial-layout]')?.querySelector('header');if(!element||!header)return;const measure=()=>element.style.setProperty('--image-group-mobile-height',Math.max(0,window.innerHeight-header.getBoundingClientRect().height)+'px');const observer=new ResizeObserver(measure);observer.observe(header);window.addEventListener('resize',measure);measure();return()=>{observer.disconnect();window.removeEventListener('resize',measure);};},[hasItems]);
 useImageGroupAppearance(host,block.id,block.immersiveAnimation??"group-fade",mobile,!immersive);
 if(!block.items.length)return null;
 return <section ref={host} className={styles.group} data-editorial-image-group={block.format} data-editorial-active-item={selection??undefined} data-layout={mobile?'mobile':'desktop'}>
 {mobile?<CarouselBlock block={{id:block.id,type:'carousel',variant:block.variant,automatic:false,intervalSeconds:5,slides:block.items}} active={active} preparing={preparing} timeoutMs={10000} allowZoom={allowZoom} activeItemId={selection} onActiveItemChange={activeId=>setState(current=>({...current,activeId}))} fullFrameMobile/>:
 <div className={styles.columns} style={{gridTemplateColumns:`repeat(${block.items.length},minmax(0,1fr))`}}>{block.items.map(item=><div className={styles.item} key={item.id} data-editorial-motion-media><div className={styles.canvas}><MediaBlock appearanceFrame captionFocusable={immersive} media={item.media} active={active} preparing={preparing} timeoutMs={10000} allowZoom={allowZoom}/></div></div>)}</div>}
 </section>;
}
