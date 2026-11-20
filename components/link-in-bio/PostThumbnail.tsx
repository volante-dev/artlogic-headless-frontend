'use client';
/* Native srcset selects our existing 160/320/640 files; Next Image would add another transform. */
/* eslint-disable @next/next/no-img-element */
import {useEffect,useRef,useState} from 'react';
import {linkInBioMessages} from '@/lib/link-in-bio/messages';
import type {Schemas} from '@/lib/link-in-bio/contracts';
import styles from './LinkInBio.module.css';
export function PostThumbnail({item,priority,locale,recover}:{item:Schemas['LibPublicItem'];priority:boolean;locale:string;recover:(id:string)=>Promise<Schemas['LibImage']|null>}){
 const [image,setImage]=useState(item.image),[phase,setPhase]=useState(0),mounted=useRef(true);
 useEffect(()=>{mounted.current=true;return ()=>{mounted.current=false;};},[]);
 async function failed(){if(phase!==0){setPhase(2);return;}setPhase(1);try{const next=await recover(item.id);if(mounted.current){setImage(next);setPhase(next?3:2);}}catch{if(mounted.current)setPhase(2);}}
 const variants=image?.variants??[],largest=variants.at(-1),available=largest&&phase!==1&&phase!==2;
 return <span className={styles.thumbnail} data-link-bio-thumbnail>
  {available?<img key={phase} src={largest.url} srcSet={variants.map(variant=>variant.url+' '+variant.width+'w').join(', ')} sizes="(max-width: 720px) 33vw, (max-width: 1160px) 30vw, 352px" width={image!.width} height={image!.height} alt={image!.alt} loading={priority?'eager':'lazy'} fetchPriority={priority?'high':'auto'} decoding="async" onError={()=>void failed()}/>:<span className={styles.unavailable} role="img" aria-label={image?.alt||item.captionExcerpt||linkInBioMessages(locale).unavailable}><svg viewBox="0 0 32 32" width="24" height="24" aria-hidden="true"><path d="M5 5h22v22H5zM5 23l7-8 5 5 4-4 6 7M22 10h.01" fill="none" stroke="currentColor" strokeWidth="1"/></svg></span>}
  {item.kind!=='image'&&<span className={styles.kind} aria-hidden="true">{item.kind==='video'?<svg viewBox="0 0 20 20"><path d="m6 3 11 7-11 7z" fill="currentColor"/></svg>:<svg viewBox="0 0 20 20"><path d="M7 3h10v10H7zM3 7v10h10" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>}</span>}
 </span>;
}
