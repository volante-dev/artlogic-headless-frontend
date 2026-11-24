"use client";
import {useContext,useId,useLayoutEffect,useRef,type ReactNode} from "react";
import {ArtworkHeadingContext} from "../ArtworkHeadingContext";
import {ArtworkInquiryLink,type ArtworkContent} from "../ArtworkInformation";
import {ArtworkAvailability} from "../ArtworkAvailability";
import {useSiteContent} from "../../SiteContentProvider";
import {useRattonArtworkVisit} from "./RattonArtworkVisitBoundary";
import {RattonArtworkInformation} from "./RattonArtworkInformation";
import {RattonArtworkCarousel} from "./RattonArtworkCarousel";
import {useRattonArtworkEntrance} from "./useRattonArtworkEntrance";
import {useRattonMobileExpansion} from "./useRattonMobileExpansion";
import styles from "./RattonArtwork.module.css";
export function RattonArtworkExperience({id,content,supplementalContent}:{id:string;content:ArtworkContent;supplementalContent?:ReactNode}){
 const {messages:m}=useSiteContent(),generated=useId(),heading=useContext(ArtworkHeadingContext)??generated,{store,state}=useRattonArtworkVisit(),root=useRef<HTMLElement>(null),viewport=useRef<HTMLDivElement>(null),reading=useRef<HTMLDivElement>(null),scroll=useRef(store.read().informationScrollTop);
 const expansion=useRattonMobileExpansion(root,store,state),examining=expansion.mobile&&expansion.phase!=="collapsed";
 useRattonArtworkEntrance(root);
 useLayoutEffect(()=>{const element=viewport.current?.clientHeight?viewport.current:reading.current;if(element){element.scrollTop=store.read().informationScrollTop;scroll.current=element.scrollTop;}return ()=>{store.patch({informationScrollTop:scroll.current});};},[store]);
 return <article id={id} ref={root} className={styles.experience} data-testid="artwork-experience" data-artwork-experience data-artwork-view="lucas-ratton" data-enhanced="true" data-ratton-expansion={expansion.mobile?expansion.phase:undefined} aria-labelledby={heading}>
  <div ref={viewport} className={styles.viewport} data-ratton-viewport onScroll={event=>{scroll.current=event.currentTarget.scrollTop;}}>
   <header className={styles.identity} inert={examining||undefined}><h1 id={heading} tabIndex={-1} data-artwork-title data-artwork-focus-heading>{content.artwork.title??m["artwork.untitled"]}</h1>{content.artwork.artist&&<p data-artwork-artist>{content.artwork.artist}</p>}</header>
   <div className={styles.media} data-ratton-media><RattonArtworkCarousel content={content} expansion={expansion}/></div>
   <div ref={reading} className={styles.reading} data-ratton-reading inert={examining||undefined} tabIndex={0} role="region" aria-label={m["gallery.description"]} onScroll={event=>{scroll.current=event.currentTarget.scrollTop;}}><RattonArtworkInformation content={content} supplementalContent={supplementalContent}/></div>
  </div>
  <footer className={styles.actions} data-ratton-actions inert={examining||undefined}><ArtworkAvailability availableForSale={content.availableForSale} locale={content.locale}/><ArtworkInquiryLink id={content.artwork.id} locale={content.locale}/></footer>
 </article>;
}
