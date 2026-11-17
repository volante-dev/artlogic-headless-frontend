"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import type {PresentationAsset} from "../lib/presentation/types";
import {presentationAssetPath} from "../lib/presentation/types";
import {readHeroWebp,singlePassWebp} from "../lib/media/single-pass-webp";
import {AnimatedAssetImage} from "./AnimatedAssetImage";

export function HeroWebpOverlay(props:{asset:PresentationAsset;scope:"public"|"preview";className?:string}){
 // Existing static artwork remains permanent; only animated originals play once.
 return props.asset.path.endsWith("variant=original")?<SinglePassOverlay key={props.asset.path} {...props}/>:<AnimatedAssetImage {...props}/>;
}
function SinglePassOverlay({asset,scope,className}:{asset:PresentationAsset;scope:"public"|"preview";className?:string}){
 const original=presentationAssetPath(asset.path,scope),still=asset.variants?.find(v=>v.variant==="w640");
 const staticPath=still?presentationAssetPath(still.path,scope):undefined;
 const [media,setMedia]=useState<{url:string;durationMs:number|null}|null>(null),[finished,setFinished]=useState(false),[fallback,setFallback]=useState(false);
 const started=useRef(false),timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 useEffect(()=>{
  const abort=new AbortController();let objectUrl:string|undefined;
  void fetch(original,{signal:abort.signal,credentials:"same-origin"}).then(readHeroWebp).then(bytes=>{
   if(abort.signal.aborted)return;
   const animation=singlePassWebp(bytes);
   if(!animation){setMedia({url:original,durationMs:null});return;}
   objectUrl=URL.createObjectURL(new Blob([animation.bytes],{type:"image/webp"}));
   setMedia({url:objectUrl,durationMs:animation.durationMs});
  }).catch(()=>{if(!abort.signal.aborted)setFinished(true);});
  return()=>{abort.abort();if(objectUrl)URL.revokeObjectURL(objectUrl);};
 },[original]);
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 useEffect(()=>{if(finished&&media?.url.startsWith("blob:"))URL.revokeObjectURL(media.url);},[finished,media]);
 const loaded=useCallback(()=>{
  if(started.current||media?.durationMs==null)return;
  started.current=true;
  const deadline=performance.now()+media.durationMs;
  const complete=()=>{const remaining=deadline-performance.now();if(remaining<=0)setFinished(true);else timer.current=setTimeout(complete,Math.min(remaining,2147483647));};
  complete();
 },[media]);
 if(finished||!media)return null;
 return <picture className={className} data-hero-webp="single-pass">
  {staticPath&&<source media="(prefers-reduced-motion: reduce)" srcSet={staticPath}/>}
  <img src={fallback?staticPath:media.url} alt="" width={asset.width} height={asset.height} onLoad={loaded} onError={event=>{if(!staticPath||fallback||event.currentTarget.currentSrc.endsWith(staticPath))setFinished(true);else setFallback(true);}}/>
 </picture>;
}
