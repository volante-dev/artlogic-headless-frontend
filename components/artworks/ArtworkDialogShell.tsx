"use client";
import {useId,useRef,useState,useSyncExternalStore,useCallback,useLayoutEffect,type ReactNode} from "react";
import Dialog from "@mui/material/Dialog";
import {LoadingIndicator} from '../SiteLoading';
import {useSiteContent} from "../SiteContentProvider";
import {localizedPath} from "../../lib/i18n/routes";
import {useArtworkNavigation} from "./ArtworkNavigationContext";
import {ArtworkLanguageSelector} from "./ArtworkLanguageSelector";
import {ArtworkHeadingContext} from "./ArtworkHeadingContext";
import {ArtworkDialogInteractionContext} from "./ArtworkDialogInteractionContext";
import {useArtworkOpening} from "./ArtworkOpeningBoundary";
import {ArtworkDialogControlsContext,useDialogControlsCoverage} from "./ArtworkDialogControlsContext";
import styles from "./ArtworkDialogShell.module.css";
export function ArtworkDialogShell({children,title,artworkRef,locale,publicAddress,suspended=false,transient=false}:{children:ReactNode;title?:string;artworkRef?:string;locale?:string;publicAddress?:import("../../lib/artworks/addresses").ArtworkAddress;suspended?:boolean;transient?:boolean}){
 const site=useSiteContent(),navigation=useArtworkNavigation(),opening=useArtworkOpening(),label=useId(),heading=useId(),activeLocale=locale??site.locale;
 useSyncExternalStore(opening?.subscribe??(()=>()=>{}),opening?.snapshot??(()=>0),()=>0);
 const [closeRequested,setCloseRequested]=useState(false),closing=(opening?opening.isClosing:closeRequested)||Boolean(navigation?.restoring);
 const handler=useRef<{run:()=>boolean}|null>(null),paperCleanup=useRef<(()=>void)|null>(null),controlsCleanup=useRef<(()=>void)|null>(null),surfaceCleanup=useRef<(()=>void)|null>(null);
 const controlsRef=useRef<HTMLDivElement>(null),coverage=useDialogControlsCoverage(controlsRef);
 const register=useCallback((run:()=>boolean)=>{const token={run};handler.current=token;return ()=>{if(handler.current===token)handler.current=null;};},[]);
 const paper=useCallback((node:HTMLDivElement|null)=>{paperCleanup.current?.();paperCleanup.current=node&&opening?opening.register("paper",node):null;},[opening]);
 const surface=useCallback((node:HTMLDivElement|null)=>{surfaceCleanup.current?.();surfaceCleanup.current=node&&opening?opening.register("surface",node):null;},[opening]);
 const controls=useCallback((node:HTMLDivElement|null)=>{controlsRef.current=node;controlsCleanup.current?.();controlsCleanup.current=node&&opening?opening.register("controls",node):null;},[opening]);
 useLayoutEffect(()=>{if(!suspended){opening?.ensure();}},[opening,suspended]);
 const frameReady=navigation?.frameReady;
 useLayoutEffect(()=>{if(!transient&&!suspended)frameReady?.();},[frameReady,transient,suspended]);
 const close=useCallback(()=>{setCloseRequested(true);if(navigation)navigation.close();else void (async()=>{await opening?.startClosing();window.location.replace(localizedPath("/artworks",activeLocale,site.defaultLocale));})();},[opening,navigation,activeLocale,site.defaultLocale]);
 useLayoutEffect(()=>{if(suspended)return;const escape=(event:KeyboardEvent)=>{if(event.key!=="Escape"||!opening||opening.phase==="complete")return;event.preventDefault();event.stopPropagation();if(!handler.current?.run())close();};document.addEventListener("keydown",escape,true);return ()=>document.removeEventListener("keydown",escape,true);},[opening,close,suspended]);
 // disablePortal preserves the routed DOM; the default body container owns the page scroll lock.
 return <Dialog data-artwork-dialog-shell hideBackdrop={Boolean(opening)} open={!suspended} keepMounted fullScreen disablePortal lang={activeLocale} transitionDuration={0}
  aria-labelledby={label+" "+heading} onClose={(_event,reason)=>{if(reason==="escapeKeyDown"&&!handler.current?.run())close();}}
  slotProps={{paper:{className:styles.paper,ref:paper,sx:{backgroundColor:"transparent"}},backdrop:{className:styles.backdrop}}}>
   {opening?.strategy==="simple"&&<div ref={surface} className={styles.surface} data-artwork-surface aria-hidden="true"/>}
   <div className={styles.loading} data-artwork-loading aria-hidden="true"><LoadingIndicator centered decorative/></div>
   <span id={label} className={styles.srOnly}>{title??site.messages["gallery.presentation"]}</span>
   <div ref={controls} className={styles.controls} data-artwork-dialog-controls>
    <div className={styles.deferredControls}>{(artworkRef??navigation?.activeReference)&&<ArtworkLanguageSelector publicAddress={publicAddress} artworkRef={(artworkRef??navigation?.activeReference)!} locale={activeLocale}/>}</div>
    <a role="button" href={localizedPath("/artworks",activeLocale,site.defaultLocale)} data-control-surface="light" className={styles.close} aria-disabled={closing||undefined} tabIndex={closing?-1:0} onClick={event=>{event.preventDefault();close();}} onKeyDown={event=>{if(event.key===" "){event.preventDefault();close();}}} autoFocus aria-label={site.messages["gallery.closeArtwork"]}>
     <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.25" fill="none" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19"/></svg>
    </a>
   </div>
   <ArtworkDialogControlsContext value={coverage}><ArtworkDialogInteractionContext value={register}><ArtworkHeadingContext value={heading}>{children}</ArtworkHeadingContext></ArtworkDialogInteractionContext></ArtworkDialogControlsContext>
  </Dialog>;
}
