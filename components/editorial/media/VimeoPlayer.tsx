"use client";
import {useCallback} from "react";
import {useEditorialPlayback,type PlayerFactory} from "./useEditorialPlayback";
import {PlayerChrome} from "./PlayerChrome";
import {playerDeadline} from "./provider-deadline";
import styles from "./Player.module.css";
import {useEditorialExecution,inertEditorialPlayer} from "../../../lib/editorial/execution";
declare global{interface Window{VimeoSeoMetadataAppended?:boolean;VimeoCheckedUrlTimeParam?:boolean;VimeoDRMEmbedsUpdated?:boolean;VimeoPlayerResizeEmbeds_?:boolean}}
export function VimeoPlayer({videoId,privacyHash,label,autoplay=false,active=true,showSoundControl=true}:{videoId:string;privacyHash?:string|null;label:string;autoplay?:boolean;active?:boolean;showSoundControl?:boolean}){
 const mode=useEditorialExecution();
 const factory=useCallback<PlayerFactory>(async(host,signal,events)=>{
  if(mode==="inert")return inertEditorialPlayer();
  if(!/^[0-9]{1,20}$/.test(videoId)||privacyHash&&privacyHash.length>128)throw new Error("invalid_vimeo_reference");
  // Pinned SDK2.30.4 embed.js otherwise sends window.location.href to appendVideoMetadata.
  // Our own layout and controls also replace its URL seeking/DRM/resize auto-initializers.
  window.VimeoSeoMetadataAppended=true;window.VimeoCheckedUrlTimeParam=true;window.VimeoDRMEmbedsUpdated=true;window.VimeoPlayerResizeEmbeds_=true;
  const {default:Player}=await import("@vimeo/player");if(signal.aborted)throw new Error("player_aborted");
  const frame=document.createElement("iframe"),url=new URL("https://player.vimeo.com/video/"+videoId);if(privacyHash)url.searchParams.set("h",privacyHash);
  for(const [key,value]of Object.entries({controls:"0",autoplay:"0",muted:"1",playsinline:"1",dnt:"1",transparent:"0"}))url.searchParams.set(key,value);
  frame.src=url.toString();frame.title=label;frame.referrerPolicy="strict-origin-when-cross-origin";frame.allow="autoplay; fullscreen";frame.allowFullscreen=true;
  const box=host.querySelector("[data-player-frame]");if(!box)throw new Error("vimeo_frame_missing");box.appendChild(frame);
  const player=new Player(frame);let closed=false;
  const playing=()=>{if(!closed&&!signal.aborted)events.playing(true);},paused=()=>{if(!closed&&!signal.aborted)events.playing(false);},failed=()=>{if(!closed&&!signal.aborted)events.failed();};
  player.on("play",playing);player.on("pause",paused);player.on("ended",paused);player.on("error",failed);
  const destroy=async()=>{if(closed)return;closed=true;player.off("play",playing);player.off("pause",paused);player.off("ended",paused);player.off("error",failed);const cleanup=player.destroy();frame.remove();try{await playerDeadline(cleanup,new AbortController().signal,1000);}catch{/* The removed frame cannot keep playing while SDK cleanup settles. */}};
  try{await playerDeadline(player.ready(),signal);await playerDeadline(player.getVideoId(),signal);
   return {async play(){await playerDeadline(player.play(),signal);},async pause(){if(!closed)await playerDeadline(player.pause(),signal);},async setMuted(value){const result=await playerDeadline(player.setMuted(value),signal);if(result!==value)throw new Error("vimeo_mute_unavailable");},...(document.fullscreenEnabled?{async fullscreen(){await host.requestFullscreen();}}:{}),destroy};
  }catch(error){await destroy();throw error;}
 },[videoId,privacyHash,label,mode]);
 const {hostRef,...state}=useEditorialPlayback(factory,{active,autoplay});return <div data-editorial-player className={styles.player} ref={hostRef}><div className={styles.external} data-player-frame/><PlayerChrome state={state} showSoundControl={showSoundControl}/></div>;
}
