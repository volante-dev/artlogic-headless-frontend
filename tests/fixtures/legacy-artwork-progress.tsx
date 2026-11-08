// Frozen pre-extraction source, Git blob 424ef6f318d13d312f0b2df06bd7276c3801ee02. Only import paths relocated.
"use client";
import {useSiteContent} from "../../components/SiteContentProvider";
import styles from "../../components/artworks/ArtworkExperience.module.css";
export interface ArtworkProgressProps {count:number;active:number;onSelect:(index:number)=>void;className?:string}
export function ArtworkProgress({count,active,onSelect,className}:ArtworkProgressProps){
  const {messages:m}=useSiteContent(),total=Math.max(1,count),label=(index:number)=>`${m[index===0?"gallery.presentation":"gallery.view"]} ${index+1} ${m["gallery.of"]} ${total}`;
  if(count===0)return null;
  return <nav data-artwork-progress className={[styles.progress,className].filter(Boolean).join(" ")} aria-label={m["gallery.progressLabel"]}>
    {total===1?<span className={styles.single} aria-label={label(0)} aria-current="step"><span/></span>:Array.from({length:total},(_,index)=><button type="button" key={index} className={styles.step} aria-label={label(index)} aria-current={index===active?"step":undefined} onClick={()=>onSelect(index)}><span aria-hidden="true"/></button>)}
  </nav>;
}
