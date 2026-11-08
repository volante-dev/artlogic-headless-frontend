"use client";
import {useLayoutEffect,useRef,type ReactNode} from "react";
import {useArtworkInteraction} from "./ArtworkInteractionBoundary";
import {ArtworkIdentity} from "./ArtworkIdentity";
import {ArtworkInquiryLink} from "./ArtworkInformation";
import {useArtworkMobileInformationMotion} from "./useArtworkMobileInformationMotion";
import type {MobileArtworkViewProps} from "./ArtworkMobileController";
import {useSiteContent} from "../SiteContentProvider";
import styles from "./MobileArtworkExperience.module.css";
export function ArtworkMobileInformationPanel({content,state,InformationView,supplementalContent,send,reduced,registerInformationDismiss}:{content:MobileArtworkViewProps["content"];state:MobileArtworkViewProps["state"];InformationView:MobileArtworkViewProps["InformationView"];supplementalContent?:ReactNode;send:MobileArtworkViewProps["send"];reduced:boolean;registerInformationDismiss?:MobileArtworkViewProps['registerInformationDismiss']}){
 const store=useArtworkInteraction()!,{messages}=useSiteContent(),panel=useRef<HTMLElement>(null),reading=useRef<HTMLDivElement>(null),body=useRef<HTMLDivElement>(null),owner=useRef<HTMLElement|null>(null),open=state.mode==='information';
 const save=()=>{if(open&&owner.current)store.send({type:'reading',top:owner.current.scrollTop},[]);};
 const restore=()=>{const p=panel.current,n=p?.dataset.informationCompact==='true'?reading.current:body.current;if(!n)return;owner.current=n;n.scrollTop=Math.min(store.read().informationScrollTop,Math.max(0,n.scrollHeight-n.clientHeight));};
 const motion=useArtworkMobileInformationMotion(panel,{open,reduced,revision:`${content.locale}:${content.description}:${content.artwork.title}:${open}`,onBeforeMeasure:save,onClosed:()=>{save();owner.current=null;send({type:'gallery'});},onReading:()=>{restore();if(!panel.current?.querySelector('[data-information-body]')?.contains(document.activeElement)&&!panel.current?.querySelector('[data-information-contact]')?.contains(document.activeElement))panel.current?.querySelector<HTMLElement>('[data-artwork-title]')?.focus({preventScroll:true});}});
 useLayoutEffect(()=>registerInformationDismiss?.(motion.dismiss),[registerInformationDismiss,motion.dismiss]);
 useLayoutEffect(()=>{if(!open)return;const saveNow=()=>{if(owner.current?.isConnected)store.send({type:'reading',top:owner.current.scrollTop},[]);};document.addEventListener('visibilitychange',saveNow,true);window.addEventListener('artwork-revalidate',saveNow,true);return()=>{saveNow();document.removeEventListener('visibilitychange',saveNow,true);window.removeEventListener('artwork-revalidate',saveNow,true);};},[open,store]);
 const onScroll=(node:HTMLElement)=>{if(open&&panel.current?.dataset.informationReady==='true'&&node===owner.current)store.send({type:'reading',top:node.scrollTop},[]);};
 return <section ref={panel} className={`${styles.caption} ${styles.informationPanel}`} data-artwork-frost data-mobile-information-panel data-information-phase="closed" aria-label={messages['gallery.openInformation']}>
  <div className={styles.captionSurface} data-artwork-frost-surface aria-hidden="true"/>
  <div className={styles.informationEdges} data-artwork-frost-frame aria-hidden="true">{['top','bottom','left','right'].map(edge=><span key={edge} className={styles.informationBorder} data-information-border={edge}/>)}</div>
  <div ref={reading} className={styles.informationReader} data-mobile-information-scroll data-artwork-reading onScroll={e=>onScroll(e.currentTarget)}>
   <div className={styles.identityReading} data-information-identity><div data-artwork-frost-content><ArtworkIdentity content={content}/></div></div>
   <div ref={body} className={`${styles.informationBody} ${styles.information}`} data-information-body data-artwork-reading onScroll={e=>onScroll(e.currentTarget)}>
    {open&&<><InformationView content={content} showIdentity={false} showContact={false}/>{supplementalContent}</>}
   </div>
  </div>
  <div className={styles.informationContact} data-information-contact>{open&&<ArtworkInquiryLink id={content.artwork.id} locale={content.locale}/>}</div>
  <button data-artwork-frost-content data-mobile-trigger="information" className={styles.informationAction} aria-expanded={open} onClick={()=>{if(!open)send({type:'information'});else motion.toggle();}}>{messages[open?'gallery.backToImages':'gallery.openInformation']}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 14 6-6 6 6"/></svg></button>
 </section>;
}
