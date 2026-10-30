"use client";
import {useLayoutEffect,useRef,type ReactNode} from "react";
import Paper from "@mui/material/Paper";
import {useArtworkInteraction} from "./ArtworkInteractionBoundary";
import {ArtworkIdentity} from "./ArtworkIdentity";
import type {MobileArtworkViewProps} from "./ArtworkMobileController";
import {useSiteContent} from "../SiteContentProvider";
import styles from "./MobileArtworkExperience.module.css";
export function ArtworkMobileInformationPanel({content,InformationView,supplementalContent,send,reduced}:{content:MobileArtworkViewProps["content"];state:MobileArtworkViewProps["state"];InformationView:MobileArtworkViewProps["InformationView"];supplementalContent?:ReactNode;send:MobileArtworkViewProps["send"];reduced:boolean}){
 const store=useArtworkInteraction()!;const {messages}=useSiteContent(),reading=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{const node=reading.current;if(!node)return;
  node.scrollTop=Math.min(store.read().informationScrollTop,Math.max(0,node.scrollHeight-node.clientHeight));
  const save=()=>store.send({type:"reading",top:node.scrollTop},[]);
  // Save before FreshnessBoundary removes the reading subtree, even when a native scroll event is still queued.
  document.addEventListener("visibilitychange",save,true);window.addEventListener("artwork-revalidate",save,true);
  return ()=>{save();document.removeEventListener("visibilitychange",save,true);window.removeEventListener("artwork-revalidate",save,true);};
 },[store]);
 useLayoutEffect(()=>{const node=reading.current;if(node)store.send({type:"reading",top:node.scrollTop},[]);},[content.description,store]);
 useLayoutEffect(()=>{const node=reading.current;if(!node||reduced)return;const animation=node.animate([{opacity:0,transform:"translateY(16px)"},{opacity:1,transform:"none"}],{duration:240,easing:"cubic-bezier(.16,1,.3,1)"});return ()=>animation.cancel();},[reduced]);
 return <Paper component="section" elevation={0} className={styles.panel} aria-label={messages["gallery.openInformation"]}>
  <button className={styles.back} onClick={()=>send({type:"gallery"})}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 14 6-6 6 6"/></svg>{messages["gallery.backToImages"]}</button>
  <div ref={reading} className={styles.reading} data-artwork-reading data-mobile-information-scroll onScroll={event=>send({type:"reading",top:event.currentTarget.scrollTop})}>
   <ArtworkIdentity content={content} className={styles.readingIdentity}/>
   <div className={styles.information}><InformationView content={content} showIdentity={false}/></div>
   {supplementalContent}
  </div>
 </Paper>;
}
