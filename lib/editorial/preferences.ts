"use client";
import {useSyncExternalStore} from "react";
const query="(prefers-reduced-motion: reduce)";
function motionSubscribe(listener:()=>void){const media=matchMedia(query);media.addEventListener("change",listener);return()=>media.removeEventListener("change",listener);}
export function useEditorialReducedMotion(){return useSyncExternalStore(motionSubscribe,()=>matchMedia(query).matches,()=>true);}
function visibilitySubscribe(listener:()=>void){document.addEventListener("visibilitychange",listener);return()=>document.removeEventListener("visibilitychange",listener);}
export function useEditorialPageVisible(){return useSyncExternalStore(visibilitySubscribe,()=>!document.hidden,()=>false);}
