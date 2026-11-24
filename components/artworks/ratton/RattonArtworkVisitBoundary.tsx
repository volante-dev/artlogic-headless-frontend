"use client";
import {createContext,useContext,useState,useSyncExternalStore,type ReactNode} from "react";
import {createRattonVisitStore} from "./ratton-artwork-state";
import {useArtworkNavigation} from "../ArtworkNavigationContext";
const Context=createContext<ReturnType<typeof createRattonVisitStore>|null>(null);
function Visit({artworkId,mediaIds,visitKey,children}:{artworkId:string;mediaIds:readonly string[];visitKey:string;children:ReactNode}){const [store]=useState(()=>createRattonVisitStore(artworkId,mediaIds,visitKey));return <Context value={store}>{children}</Context>;}
export function RattonArtworkVisitBoundary({artworkId,mediaIds,children}:{artworkId:string;mediaIds:readonly string[];children:ReactNode}){const navigation=useArtworkNavigation(),visitKey=artworkId+":"+(navigation?.visitToken?.()??"direct")+":"+(navigation?.activation??0);return <Visit key={visitKey} artworkId={artworkId} mediaIds={mediaIds} visitKey={visitKey}>{children}</Visit>;}
export function useRattonArtworkVisit(){const store=useContext(Context);if(!store)throw new Error("ratton_artwork_visit_required");const state=useSyncExternalStore(store.subscribe,store.read,store.read);return {store,state};}
