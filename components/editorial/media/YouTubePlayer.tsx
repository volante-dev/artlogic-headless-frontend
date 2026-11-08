"use client";
import {useCallback,useEffect,useState} from "react";
import {useEditorialPlayback,type PlayerFactory} from "./useEditorialPlayback";
import {PlayerChrome} from "./PlayerChrome";
import {playerDeadline} from "./provider-deadline";
import styles from "./Player.module.css";
import {useEditorialExecution,inertEditorialPlayer} from "../../../lib/editorial/execution";
interface YouTubePort{playVideo():void;pauseVideo():void;mute():void;unMute():void;getPlayerState():number;destroy():void}
interface YouTubeApi{Player:new(frame:HTMLIFrameElement,options:{host:string;playerVars:Record<string,string|number>;events:{onReady():void;onStateChange(event:{data:number}):void;onError():void}})=>YouTubePort}
declare global{interface Window{YT?:YouTubeApi;onYouTubeIframeAPIReady?:()=>void}}
let api:Promise<YouTubeApi>|null=null;
function youtubeApi(){
 if(window.YT?.Player)return Promise.resolve(window.YT);if(api)return api;
 api=new Promise<YouTubeApi>((resolve,reject)=>{
  const script=document.createElement("script"),previous=window.onYouTubeIframeAPIReady;
  const cleanup=()=>{clearTimeout(timer);if(window.onYouTubeIframeAPIReady===ready)window.onYouTubeIframeAPIReady=previous;};
  const ready=()=>{cleanup();try{previous?.();}finally{if(window.YT?.Player)resolve(window.YT);else reject(new Error("youtube_api_unavailable"));}};
  const fail=()=>{cleanup();script.remove();reject(new Error("youtube_api_unavailable"));};
  const timer=setTimeout(fail,15000);window.onYouTubeIframeAPIReady=ready;
  script.src="https://www.youtube.com/iframe_api";script.async=true;script.referrerPolicy="strict-origin";script.onerror=fail;document.head.appendChild(script);
 }).catch(error=>{api=null;throw error;});return api;
}
export function YouTubePlayer({videoId,label,autoplay=false,active=true,showSoundControl=true}:{videoId:string;label:string;autoplay?:boolean;active?:boolean;showSoundControl?:boolean}){
 const [narrow,setNarrow]=useState(false),mode=useEditorialExecution();
 const factory=useCallback<PlayerFactory>(async(host,signal,events)=>{
  if(mode==="inert")return inertEditorialPlayer();
  const box=host.querySelector<HTMLElement>("[data-player-frame]");if(!box||box.clientWidth<200||narrow||!/^[A-Za-z0-9_-]{11}$/.test(videoId))throw new Error("youtube_viewport_unavailable");
  const sdk=await playerDeadline(youtubeApi(),signal);if(signal.aborted)throw new Error("player_aborted");
  const origin=window.location.origin,frame=document.createElement("iframe"),url=new URL("https://www.youtube-nocookie.com/embed/"+videoId);
  const vars={enablejsapi:1,controls:0,autoplay:0,mute:1,playsinline:1,disablekb:1,origin,widget_referrer:origin};for(const [key,value]of Object.entries(vars))url.searchParams.set(key,String(value));
  frame.src=url.toString();frame.title=label;frame.referrerPolicy="strict-origin-when-cross-origin";frame.allow="autoplay; fullscreen";frame.allowFullscreen=true;box.appendChild(frame);
  let player:YouTubePort|undefined,closed=false,resolveReady:()=>void=()=>{},rejectReady:(error:Error)=>void=()=>{},resolvePlay:(()=>void)|undefined,rejectPlay:((error:Error)=>void)|undefined;
  const ready=new Promise<void>((resolve,reject)=>{resolveReady=resolve;rejectReady=reject;});
  const destroy=()=>{if(closed)return;closed=true;rejectPlay?.(new Error("player_closed"));try{player?.destroy();}finally{frame.remove();}};
  const abort=()=>{destroy();rejectReady(new Error("player_aborted"));};signal.addEventListener("abort",abort,{once:true});
  try{
   player=new sdk.Player(frame,{host:"https://www.youtube-nocookie.com",playerVars:vars,events:{onReady:resolveReady,onStateChange(event){if(closed||signal.aborted)return;if(event.data===1){resolvePlay?.();events.playing(true);}else if(event.data===0||event.data===2)events.playing(false);},onError(){if(closed)return;rejectPlay?.(new Error("youtube_video_unavailable"));rejectReady(new Error("youtube_video_unavailable"));events.failed();}}});
   await playerDeadline(ready,signal);signal.removeEventListener("abort",abort);
   return {async play(){if(closed||!player)throw new Error("player_closed");if(player.getPlayerState()===1)return;const started=new Promise<void>((resolve,reject)=>{resolvePlay=resolve;rejectPlay=reject;});player.playVideo();try{await playerDeadline(started,signal);}finally{resolvePlay=undefined;rejectPlay=undefined;}},async pause(){if(!closed)player?.pauseVideo();},async setMuted(value){if(closed||!player)throw new Error("player_closed");if(value)player.mute();else player.unMute();},...(document.fullscreenEnabled?{async fullscreen(){await host.requestFullscreen();}}:{}),async destroy(){destroy();}};
  }catch(error){signal.removeEventListener("abort",abort);destroy();throw error;}
 },[videoId,label,narrow,mode]);
 const {hostRef,...state}=useEditorialPlayback(factory,{active,autoplay});
 useEffect(()=>{const element=hostRef.current;if(!element)return;const observer=new ResizeObserver(entries=>setNarrow((entries[0]?.contentRect.width??0)<200));observer.observe(element);return()=>observer.disconnect();},[hostRef]);
 return <div data-editorial-player className={styles.player} ref={hostRef}><div className={styles.external} data-player-frame/><PlayerChrome state={state} showSoundControl={showSoundControl}/></div>;
}
