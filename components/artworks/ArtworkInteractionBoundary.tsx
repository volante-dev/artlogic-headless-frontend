"use client";
import {createContext,useContext,useState,useEffect,useSyncExternalStore,type ReactNode} from "react";
import {initialMobileState,reconcileMobile,mobileTransition,type MobileState,type MobileEvent,stableSnapshot} from "./artwork-mobile-state";
import {useArtworkNavigation} from "./ArtworkNavigationContext";
export function createArtworkInteractionStore(artworkId:string,ids:readonly string[],scope:MobileState["scope"],snapshot?:unknown){
 let state=snapshot?reconcileMobile(snapshot,artworkId,ids,scope):initialMobileState(artworkId,ids,scope);const listeners=new Set<()=>void>();
 const replace=(next:MobileState)=>{if(next===state)return;state=next;for(const notify of listeners)notify();};
 return {read:()=>state,subscribe:(notify:()=>void)=>{listeners.add(notify);return ()=>{listeners.delete(notify);};},send:(event:MobileEvent,media:readonly string[])=>replace(mobileTransition(state,event,media)),reconcile:(media:readonly string[])=>replace(reconcileMobile(state,artworkId,media,scope)),snapshot:()=>stableSnapshot(state)};
}
export type ArtworkInteractionStore=ReturnType<typeof createArtworkInteractionStore>;
const Context=createContext<ArtworkInteractionStore|null>(null);
export const useArtworkInteraction=()=>useContext(Context);
export function useArtworkVisual(store:ArtworkInteractionStore){return useSyncExternalStore(store.subscribe,store.read,store.read);}
export function ArtworkInteractionBoundary({artworkId,mediaIds,scope="public",children}:{artworkId:string;mediaIds:readonly string[];scope?:MobileState["scope"];children:ReactNode}){
 const navigation=useArtworkNavigation(),remember=navigation?.rememberMobileVisual;
 const [current]=useState(()=>createArtworkInteractionStore(artworkId,mediaIds,scope,scope==="public"?navigation?.readMobileVisual?.():undefined));
 useEffect(()=>{const persist=()=>{if(scope==="public")remember?.(current.snapshot());};persist();const unsubscribe=current.subscribe(persist);return ()=>{persist();unsubscribe();};},[current,remember,scope]);
 return <Context value={current}>{children}</Context>;
}
