"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import {EditorialPlayback,PlaybackArbiter,type EditorialPlayerPort,type PlaybackSnapshot} from "../../../lib/editorial/playback";
export interface BrowserPlayerPort extends EditorialPlayerPort{fullscreen?():Promise<void>}
export type PlayerFactory=(host:HTMLElement,signal:AbortSignal,events:{playing(value:boolean):void;failed():void})=>Promise<BrowserPlayerPort>;
const arbiter=new PlaybackArbiter();
type State={factory:PlayerFactory|null;attempt:number;snapshot:{status:PlaybackSnapshot["status"]|"loading";muted:boolean};fullscreen:boolean};
const loading={status:"loading" as const,muted:true};
export function useEditorialPlayback(factory:PlayerFactory,{active=true,autoplay=false}:{active?:boolean;autoplay?:boolean}){
 const host=useRef<HTMLDivElement>(null),controller=useRef<EditorialPlayback|null>(null),port=useRef<BrowserPlayerPort|null>(null),visible=useRef(0),options=useRef({active,autoplay});
 const [attempt,setAttempt]=useState(0),[state,setState]=useState<State>({factory:null,attempt:0,snapshot:loading,fullscreen:false});
 useEffect(()=>{
  options.current={active,autoplay};controller.current?.setActive(active);
  if(active&&autoplay&&visible.current>.5&&!document.hidden&&!matchMedia("(prefers-reduced-motion: reduce)").matches&&controller.current?.snapshot.status==="paused")void controller.current.play(true);
 },[active,autoplay]);
 useEffect(()=>{
  const element=host.current;if(!element)return;
  const abort=new AbortController();let current:EditorialPlayback|null=null,unsubscribe:(()=>void)|undefined,failed=false;
  const motion=matchMedia("(prefers-reduced-motion: reduce)");
  const refresh=()=>{if(abort.signal.aborted)return;current?.setActive(options.current.active);current?.setPageVisibility(!document.hidden);current?.setVisibility(visible.current>0,visible.current>.5);if(current&&options.current.active&&options.current.autoplay&&visible.current>.5&&!document.hidden&&!motion.matches&&current.snapshot.status==="paused")void current.play(true);};
  const observer=new IntersectionObserver(entries=>{if(abort.signal.aborted)return;visible.current=entries[0]?.intersectionRatio??0;refresh();},{threshold:[0,.5,.51,1]});observer.observe(element);
  document.addEventListener("visibilitychange",refresh);motion.addEventListener("change",refresh);
  void factory(element,abort.signal,{playing:value=>{if(!abort.signal.aborted)current?.confirmPlaying(value);},failed:()=>{failed=true;if(!abort.signal.aborted)current?.fail();}}).then(async player=>{
   if(abort.signal.aborted){await player.destroy();return;}
   port.current=player;current=new EditorialPlayback(player,arbiter);controller.current=current;
   unsubscribe=current.subscribe(()=>{if(!abort.signal.aborted)setState({factory,attempt,snapshot:current!.snapshot,fullscreen:Boolean(player.fullscreen)});});
   setState({factory,attempt,snapshot:current.snapshot,fullscreen:Boolean(player.fullscreen)});if(failed)current.fail();else refresh();
  }).catch(()=>{if(!abort.signal.aborted)setState({factory,attempt,snapshot:{status:"error",muted:true},fullscreen:false});});
  return()=>{abort.abort();observer.disconnect();document.removeEventListener("visibilitychange",refresh);motion.removeEventListener("change",refresh);unsubscribe?.();controller.current=null;port.current=null;visible.current=0;if(current)void current.dispose().catch(()=>undefined);};
 },[factory,attempt]);
 const fullscreen=useCallback(async()=>{try{await port.current?.fullscreen?.();}catch{setState(previous=>({...previous,fullscreen:false}));}},[]);
 return {hostRef:host,snapshot:state.factory===factory&&state.attempt===attempt?state.snapshot:loading,canFullscreen:state.factory===factory&&state.fullscreen,play:()=>void controller.current?.play(false),pause:()=>void controller.current?.pause(),toggleSound:()=>void controller.current?.toggleSound(),fullscreen,retry:()=>setAttempt(value=>value+1)};
}
