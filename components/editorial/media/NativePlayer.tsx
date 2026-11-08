"use client";
import {useCallback,useRef} from "react";
import {useEditorialPlayback,type PlayerFactory} from "./useEditorialPlayback";
import {PlayerChrome} from "./PlayerChrome";
import styles from "./Player.module.css";
import {useEditorialExecution,inertEditorialPlayer} from "../../../lib/editorial/execution";
export function NativePlayer({src,poster,label,autoplay=false,active=true,showSoundControl=true}:{src:string;poster?:string|null;label:string;autoplay?:boolean;active?:boolean;showSoundControl?:boolean}){
 const mode=useEditorialExecution(),owner=useRef(0);
 const factory=useCallback<PlayerFactory>(async(host,_signal,events)=>{
  if(mode==="inert")return inertEditorialPlayer();
  const video=host.querySelector("video");if(!video)throw new Error("native_player_missing");
  const token=++owner.current,owns=()=>owner.current===token;
  video.muted=true;video.src=src;video.load();
  const playing=()=>events.playing(true),paused=()=>events.playing(false),failed=()=>events.failed();
  video.addEventListener("playing",playing);video.addEventListener("pause",paused);video.addEventListener("ended",paused);video.addEventListener("error",failed);
  const native=video as HTMLVideoElement&{webkitEnterFullscreen?:()=>void};
  return {play:()=>owns()?video.play():Promise.resolve(),async pause(){if(owns())video.pause();},async setMuted(value){if(owns())video.muted=value;},...(document.fullscreenEnabled||native.webkitEnterFullscreen?{async fullscreen(){if(!owns())return;if(document.fullscreenEnabled)await host.requestFullscreen();else native.webkitEnterFullscreen?.();}}:{}),async destroy(){video.removeEventListener("playing",playing);video.removeEventListener("pause",paused);video.removeEventListener("ended",paused);video.removeEventListener("error",failed);if(owns()){owner.current++;video.pause();video.removeAttribute("src");video.load();}}};
 },[src,mode]);
 const {hostRef,...state}=useEditorialPlayback(factory,{active,autoplay});
 return <div data-editorial-player className={styles.player} ref={hostRef}><video className={styles.native} aria-label={label} poster={poster??undefined} playsInline muted preload="metadata"/><PlayerChrome state={state} showSoundControl={showSoundControl}/></div>;
}
