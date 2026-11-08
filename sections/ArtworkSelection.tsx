"use client";
import {useEffect,useRef,useState} from "react";
import {squareImageSizes} from "../lib/media/public-image-sizes";
import type {SectionProps} from "./types";
import {useClientComponents} from "../clients/ClientComponentsProvider";
import {useSiteContent} from "../components/SiteContentProvider";
import {EmptySection,Paragraphs,SectionHeading} from "./shared";
import sectionStyles from "./Sections.module.css";
import styles from "./ArtworkSelection.module.css";
export function ArtworkSelection({section,headingLevel}:SectionProps<"artworkSelection">){
 const {ArtworkMasonryCard:ArtworkCard}=useClientComponents();
 const p=section.props,site=useSiteContent(),fr=site.locale.startsWith("fr"),count=p.artworks?.length??0,multiple=count>1,track=useRef<HTMLUListElement>(null),viewport=useRef<HTMLDivElement>(null),[active,setActive]=useState(0);
 useEffect(()=>{const element=viewport.current;if(!element||!multiple)return;const media=matchMedia("(max-width:767px)");let observer:IntersectionObserver|undefined;
  const observe=()=>{observer?.disconnect();if(!media.matches)return;let aligned=false;observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.intersectionRatio<.1)aligned=false;if(entry.intersectionRatio>=.6&&!aligned){aligned=true;const rect=element.getBoundingClientRect();if(Math.abs(rect.top)>2)window.scrollTo({top:window.scrollY+rect.top,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});}}},{threshold:[0,.1,.6]});observer.observe(element);};observe();media.addEventListener("change",observe);return()=>{observer?.disconnect();media.removeEventListener("change",observe);};
 },[multiple]);
 function syncActive(){const ul=track.current;if(!ul)return;const cards=[...ul.children] as HTMLElement[],left=ul.scrollLeft,index=cards.reduce((best,card,i)=>Math.abs(card.offsetLeft-cards[0]!.offsetLeft-left)<Math.abs(cards[best]!.offsetLeft-cards[0]!.offsetLeft-left)?i:best,0);setActive(old=>old===index?old:index);}
 function move(index:number){const ul=track.current,first=ul?.children[0] as HTMLElement|undefined,card=ul?.children[index] as HTMLElement|undefined;if(!ul||!card||!first)return;ul.scrollTo({left:card.offsetLeft-first.offsetLeft,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});}
 return <section id={section.id} className={`${sectionStyles.section} ${styles.selection} ${multiple?styles.multiple:""}`} data-artwork-selection>
 <div className={styles.introduction}><SectionHeading text={p.heading} level={headingLevel}/><Paragraphs text={p.introduction}/></div>
 {count?<div ref={viewport} className={styles.viewport} data-selection-viewport><ul ref={track} onScroll={syncActive} className={`${styles.track} ${section.variant==="strip"?styles.strip:""}`} aria-label={p.heading??(fr?"Œuvres sélectionnées":"Selected artworks")} onKeyDown={event=>{if(!multiple||!matchMedia("(max-width:767px)").matches||!["ArrowLeft","ArrowRight"].includes(event.key))return;event.preventDefault();move(Math.max(0,Math.min(count-1,active+(event.key==="ArrowRight"?1:-1))));}}>{p.artworks!.map(art=><ArtworkCard key={art.id} art={art} imageSizes={squareImageSizes((art.media[0]?.width??1)/(art.media[0]?.height??1),3,false,p.imageFit??"cover",true,multiple,section.variant==="strip")} imageFit={p.imageFit??"cover"} fillMobile={multiple}/>)}</ul>
 {multiple&&<div className={styles.controls} aria-label={fr?"Parcourir les œuvres":"Browse artworks"}><div className={styles.progress} aria-hidden="true">{p.artworks!.map((art,i)=><span key={art.id} data-active={active===i||undefined}/>)}</div><div className={styles.commandRow}><span className={styles.count} aria-live="polite" aria-atomic="true">{String(active+1).padStart(2,"0")} <span>/ {String(count).padStart(2,"0")}</span></span><div className={styles.arrows}>{([-1,1] as const).map(direction=><button key={direction} type="button" aria-label={direction<0?(fr?"Œuvre précédente":"Previous artwork"):(fr?"Œuvre suivante":"Next artwork")} disabled={direction<0?active===0:active===count-1} onClick={()=>move(active+direction)}><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true"><path d={direction<0?"M19 12H5m6-6-6 6 6 6":"M5 12h14m-6-6 6 6-6 6"}/></svg></button>)}</div></div></div>}
 </div>:<EmptySection/>}</section>;
}
