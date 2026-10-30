"use client";
import {createContext,useContext,useState,useEffect,useLayoutEffect,useRef,useSyncExternalStore,type ReactNode} from "react";
import {ArtworkOpening} from "./artwork-opening";
import styles from "./ArtworkDialogShell.module.css";
const Context=createContext<ArtworkOpening|null>(null);
export const useArtworkOpening=()=>useContext(Context);
export function useArtworkOpeningPhase(){const opening=useArtworkOpening();useSyncExternalStore(opening?.subscribe??(()=>()=>{}),opening?.snapshot??(()=>0),()=>0);return opening?.phase??"complete";}
/** The document keeps the same blur surface while route and freshness shells change. */
function OpeningBackdrop({opening}:{opening:ArtworkOpening}){
 const node=useRef<HTMLDivElement>(null);
 useSyncExternalStore(opening.subscribe,opening.snapshot,()=>0);
 const visible=opening.isOpen;
 useLayoutEffect(()=>{if(visible&&node.current)return opening.register("backdrop",node.current);},[opening,visible]);
 return visible?<div ref={node} data-artwork-backdrop className={styles.backdrop} aria-hidden="true"/>:null;
}
export function ArtworkOpeningBoundary({children}:{children:ReactNode}){
 const [opening]=useState(()=>new ArtworkOpening());
 useEffect(()=>{const detach=opening.attach();const reduced=matchMedia("(prefers-reduced-motion:reduce)"),changed=()=>{if(document.hidden||reduced.matches&&opening.phase!=="backdrop"&&opening.phase!=="waiting")opening.finish();};const resize=()=>opening.finish();document.addEventListener("visibilitychange",changed);reduced.addEventListener("change",changed);window.addEventListener("resize",resize);return ()=>{document.removeEventListener("visibilitychange",changed);reduced.removeEventListener("change",changed);window.removeEventListener("resize",resize);detach();};},[opening]);
 return <Context value={opening}>{children}<OpeningBackdrop opening={opening}/></Context>;
}
