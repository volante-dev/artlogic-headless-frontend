"use client";
import {useState} from "react";
import type {PresentationAsset} from "../lib/presentation/types";
import {presentationAssetPath} from "../lib/presentation/types";
export function AnimatedAssetImage({asset,scope="public",className,paused=false,onError}:{asset:PresentationAsset;scope?:"public"|"preview";className?:string;paused?:boolean;onError?:()=>void}){
 const original=presentationAssetPath(asset.path,scope),still=asset.variants?.find(v=>v.variant==="w640");
 const staticPath=still?presentationAssetPath(still.path,scope):original;
 const [failed,setFailed]=useState<string|null>(null);
 if(failed==="unavailable")return null;
 const src=paused||failed===original?staticPath:original;
 return <picture className={className}><source media="(prefers-reduced-motion: reduce)" srcSet={staticPath}/>{/* Animated bytes must bypass image optimization. */}
  <img src={src} alt="" width={asset.width} height={asset.height} decoding="async" onError={event=>{if(src!==staticPath&&!event.currentTarget.currentSrc.endsWith(staticPath))setFailed(original);else{setFailed("unavailable");onError?.();}}}/>
 </picture>;
}
