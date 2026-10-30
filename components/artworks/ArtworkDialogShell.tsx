"use client";
import {useId,useRef,useCallback,useLayoutEffect,type ReactNode} from "react";
import Dialog from "@mui/material/Dialog";
import CircularProgress from "@mui/material/CircularProgress";
import {useSiteContent} from "../SiteContentProvider";
import {localizedPath} from "../../lib/i18n/routes";
import {useArtworkNavigation} from "./ArtworkNavigationContext";
import {ArtworkLanguageSelector} from "./ArtworkLanguageSelector";
import {ArtworkHeadingContext} from "./ArtworkHeadingContext";
import {ArtworkDialogInteractionContext} from "./ArtworkDialogInteractionContext";
import {useArtworkOpening} from "./ArtworkOpeningBoundary";
import styles from "./ArtworkDialogShell.module.css";
export function ArtworkDialogShell({children,title,artworkRef,locale,suspended=false}:{children:ReactNode;title?:string;artworkRef?:string;locale?:string;suspended?:boolean}){
 const site=useSiteContent(),navigation=useArtworkNavigation(),opening=useArtworkOpening(),label=useId(),heading=useId(),activeLocale=locale??site.locale;
 const handler=useRef<{run:()=>boolean}|null>(null),paperCleanup=useRef<(()=>void)|null>(null),controlsCleanup=useRef<(()=>void)|null>(null);
 const register=useCallback((run:()=>boolean)=>{const token={run};handler.current=token;return ()=>{if(handler.current===token)handler.current=null;};},[]);
 const paper=useCallback((node:HTMLDivElement|null)=>{paperCleanup.current?.();paperCleanup.current=node&&opening?opening.register("paper",node):null;},[opening]);
 const controls=useCallback((node:HTMLDivElement|null)=>{controlsCleanup.current?.();controlsCleanup.current=node&&opening?opening.register("controls",node):null;},[opening]);
 useLayoutEffect(()=>{if(!suspended){opening?.ensure();}},[opening,suspended]);
 const close=()=>{opening?.close();if(navigation)navigation.close();else window.location.replace(localizedPath("/artworks",activeLocale,site.defaultLocale));};
 return <Dialog hideBackdrop={Boolean(opening)} open={!suspended} keepMounted fullScreen disablePortal lang={activeLocale} transitionDuration={0} container={()=>navigation?.container.current??document.body}
  aria-labelledby={label+" "+heading} onClose={(_event,reason)=>{if(reason==="escapeKeyDown"&&!handler.current?.run())close();}}
  slotProps={{paper:{className:styles.paper,ref:paper,sx:{backgroundColor:"transparent"}},backdrop:{className:styles.backdrop}}}>
   <div className={styles.loading} data-artwork-loading aria-hidden="true"><CircularProgress disableShrink size={28} thickness={2} color="inherit"/></div>
   <span id={label} className={styles.srOnly}>{title??site.messages["gallery.presentation"]}</span>
   <div className={styles.controls}>
    <div ref={controls} className={styles.deferredControls}>{artworkRef&&<ArtworkLanguageSelector artworkRef={artworkRef} locale={activeLocale}/>}</div>
    <a role="button" href={localizedPath("/artworks",activeLocale,site.defaultLocale)} className={styles.close} onClick={event=>{if(navigation){event.preventDefault();close();}}} onKeyDown={event=>{if(event.key===" "){event.preventDefault();close();}}} autoFocus aria-label={site.messages["gallery.closeArtwork"]}>
     <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.25" fill="none" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19"/></svg>
    </a>
   </div>
   <ArtworkDialogInteractionContext value={register}><ArtworkHeadingContext value={heading}>{children}</ArtworkHeadingContext></ArtworkDialogInteractionContext>
  </Dialog>;
}
