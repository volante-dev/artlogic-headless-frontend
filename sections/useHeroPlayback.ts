"use client";
import {useCallback,useEffect,useRef,useState} from "react";

/** Native playback is the truth; user pause is independent of temporary suspension. */
export function useHeroPlayback(enabled:boolean,sourceKey=""){
  const video=useRef<HTMLVideoElement>(null),manuallyPaused=useRef(false),userStarted=useRef(false),intersecting=useRef(true),reduced=useRef(false),pendingPlay=useRef<Promise<void>|null>(null),renewed=useRef(false),failed=useRef(false);
  const [playing,setPlaying]=useState(false);
  const attempt=useCallback(async()=>{
    const element=video.current;if(!element||failed.current||pendingPlay.current||!element.paused)return;
    // Mount and IntersectionObserver may request the same pending playback.
    // A second request must never invalidate the first once buffering finishes.
    let pending:Promise<void>|undefined;
    try{pending=element.play();pendingPlay.current=pending;await pending;}
    catch{/* The native poster and explicit play affordance remain available. */}
    finally{if(pendingPlay.current===pending)pendingPlay.current=null;}
  },[]);
  useEffect(()=>{
    const element=video.current;if(!enabled||!element)return;
    renewed.current=false;failed.current=false;
    const preference=window.matchMedia("(prefers-reduced-motion: reduce)");reduced.current=preference.matches;
    const pause=()=>{pendingPlay.current=null;element.pause();};
    const reconcile=()=>{if(document.visibilityState!=="visible"||!intersecting.current||manuallyPaused.current||(reduced.current&&!userStarted.current))pause();else void attempt();};
    const change=()=>{reduced.current=preference.matches;if(reduced.current){userStarted.current=false;pause();}else reconcile();};
    const started=()=>setPlaying(true),stopped=()=>setPlaying(false);
    const unavailable=()=>{stopped();if(renewed.current){failed.current=true;pause();return;}renewed.current=true;pendingPlay.current=null;element.load();reconcile();};
    element.addEventListener("play",started);element.addEventListener("pause",stopped);element.addEventListener("error",unavailable);
    document.addEventListener("visibilitychange",reconcile);preference.addEventListener("change",change);
    const observer=new IntersectionObserver(entries=>{intersecting.current=entries[0]?.isIntersecting??false;reconcile();},{threshold:.05});observer.observe(element);
    reconcile();
    return()=>{pause();observer.disconnect();document.removeEventListener("visibilitychange",reconcile);preference.removeEventListener("change",change);element.removeEventListener("play",started);element.removeEventListener("pause",stopped);element.removeEventListener("error",unavailable);};
  },[enabled,sourceKey,attempt]);
  const toggle=useCallback(()=>{
    const element=video.current;if(!element)return;
    if(!element.paused){manuallyPaused.current=true;pendingPlay.current=null;element.pause();}
    else{manuallyPaused.current=false;userStarted.current=true;void attempt();}
  },[attempt]);
  return {video,playing,toggle};
}
