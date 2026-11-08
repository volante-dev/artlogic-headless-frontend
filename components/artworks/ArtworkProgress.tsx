"use client";
import {useSiteContent} from "../SiteContentProvider";
import {ViewProgress}from'../navigation/ViewProgress';
import styles from "./ArtworkExperience.module.css";
export interface ArtworkProgressProps {count:number;active:number;onSelect:(index:number)=>void;className?:string;finale?:boolean}
export function ArtworkProgress({count,active,onSelect,className,finale=false}:ArtworkProgressProps){const{messages:m}=useSiteContent();return <ViewProgress count={count} active={active} onSelect={onSelect} className={[styles.progress,className].filter(Boolean).join(' ')} stepClassName={styles.step} singleClassName={styles.single} dataAttributes={{'data-artwork-progress':true}} navigationLabel={m['gallery.progressLabel']} stepLabel={(index,total)=>finale&&index===total-1?"Conclusion":`${m[index===0?'gallery.presentation':'gallery.view']} ${index+1} ${m['gallery.of']} ${total}`}/>;}
