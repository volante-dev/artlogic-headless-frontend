"use client";
import {useSyncExternalStore} from "react";
const query="(max-width:767px), (pointer:coarse) and (max-height:639px)";
const subscribe=(notify:()=>void)=>{const media=matchMedia(query);media.addEventListener("change",notify);return ()=>media.removeEventListener("change",notify);};
export function useArtworkViewport(){return useSyncExternalStore(subscribe,()=>matchMedia(query).matches?"mobile" as const:"desktop" as const,()=>"pending" as const);}
const motionSubscribe=(notify:()=>void)=>{const media=matchMedia("(prefers-reduced-motion:reduce)");media.addEventListener("change",notify);return ()=>media.removeEventListener("change",notify);};
export function useArtworkReducedMotion(){return useSyncExternalStore(motionSubscribe,()=>matchMedia("(prefers-reduced-motion:reduce)").matches,()=>true);}
