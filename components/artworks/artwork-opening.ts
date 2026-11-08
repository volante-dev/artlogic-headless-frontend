import {beginOpening,readyOpening,completeOpening,openingPhase,artworkOpeningTiming as timing,artworkOpeningDuration,type OpeningState} from "./artwork-opening-state";
import {ArtworkClosing} from './artwork-closing';
type Kind="root"|"paper"|"background"|"backdrop"|"media"|"controls"|"timeline"|"identity"|"identitySurface";
interface Layer {node:HTMLElement;kind:Kind;animation?:Animation;timer?:ReturnType<typeof setTimeout>;inert:boolean;opacity:string;willChange:string;filter:string;contentFilter:string}
/** One document-owned entrance, surviving pending/canonical and freshness subtree replacement. */
export class ArtworkOpening {
 readonly returning=new ArtworkClosing(()=>this.publish());
 private closingMotion:Promise<boolean>|null=null;
 private attachment=0;private sessionOpen=false;
 attach=()=>{const attachment=++this.attachment;return ()=>queueMicrotask(()=>{if(this.attachment===attachment)this.close();});};
 private state:OpeningState|null=null;private serial=0;private version=0;private listeners=new Set<()=>void>();private layers=new Map<HTMLElement,Layer>();private timers:ReturnType<typeof setTimeout>[]=[];
 subscribe=(notify:()=>void)=>{this.listeners.add(notify);return ()=>{this.listeners.delete(notify);};};
 snapshot=()=>this.version;
 get isOpen(){return this.sessionOpen;}
 get isClosing(){return this.returning.phase!=='idle'||this.state!==null&&!this.sessionOpen;}
 get hasPaper(){return [...this.layers.values()].some(layer=>layer.kind==="paper");}
 get phase(){return this.state?openingPhase(this.state,performance.now()):"complete";}
 ensure=()=>{if(!this.state||!this.sessionOpen)this.begin();};
 begin=()=>{this.returning.reset();this.closingMotion=null;this.release();this.sessionOpen=true;this.state=beginOpening(++this.serial,performance.now());this.publish();};
 close=()=>{this.returning.reset();this.closingMotion=null;this.finish();this.release();this.sessionOpen=false;this.publish();};
 startClosing=(retainSnapshot=false)=>{if(this.returning.phase!=='idle')return this.closingMotion??Promise.resolve(true);this.finish();this.closingMotion=this.returning.roll([...this.layers.values()].filter(l=>l.kind==='paper').map(l=>l.node),retainSnapshot);return this.closingMotion;};
 revealOrigin=async()=>{if(this.returning.phase==='rolling'&&this.closingMotion&&!await this.closingMotion)return false;const completed=await this.returning.reveal([...this.layers.values()].filter(l=>l.kind==='background').map(l=>l.node),[...this.layers.values()].filter(l=>l.kind==='backdrop').map(l=>l.node));if(completed)this.close();return completed;};
 finish=()=>{if(!this.state||this.state.completedAt!==null)return;this.state=completeOpening(this.state,performance.now());this.clearTimers();for(const layer of this.layers.values()){this.restore(layer);if(layer.kind==="background")layer.node.style.filter="blur(8px)";}this.publish();};
 private publish(){this.version++;for(const {node,kind}of this.layers.values())if(kind==="root"||kind==="paper"){
  node.dataset.artworkOpeningPhase=this.phase;node.dataset.artworkOpeningId=String(this.state?.id??0);node.dataset.entranceDuration=String(artworkOpeningDuration);node.dataset.artworkOpeningBackdropDuration=String(timing.backdrop);
  node.dataset.artworkClosePhase=this.returning.phase;
  if(this.state){node.dataset.artworkOpeningStart=String(this.state.openedAt);node.dataset.artworkOpeningReady=String(this.state.revealStartedAt??"");node.dataset.artworkOpeningEnd=String(this.state.completedAt??"");}
 }for(const notify of this.listeners)notify();}
 private clearTimers(){for(const timer of this.timers)clearTimeout(timer);this.timers=[];}
 private restore(layer:Layer){layer.animation?.cancel();layer.animation=undefined;if(layer.timer)clearTimeout(layer.timer);layer.node.style.opacity=layer.opacity;layer.node.style.willChange=layer.willChange;layer.node.style.backdropFilter=layer.filter;layer.node.style.filter=layer.contentFilter;if(!layer.inert)layer.node.inert=false;}
 private release(){this.clearTimers();for(const layer of this.layers.values())this.restore(layer);this.layers.clear();}
 register=(kind:Kind,node:HTMLElement,deferReady=false)=>{
  this.ensure();const previous=this.layers.get(node);if(previous)this.restore(previous);
  const layer:Layer={node,kind,inert:node.inert,opacity:node.style.opacity,willChange:node.style.willChange,filter:node.style.backdropFilter,contentFilter:node.style.filter};this.layers.set(node,layer);
  this.animate(layer);if(kind==="media"&&!deferReady)this.ready(node);
  this.publish();return ()=>{if(this.layers.get(node)===layer){this.restore(layer);this.layers.delete(node);queueMicrotask(()=>this.publish());}};
 };
 ready=(node:HTMLElement)=>{
  if(this.layers.get(node)?.kind!=="media"||!this.state||this.state.completedAt!==null||this.state.revealStartedAt!==null)return;
  this.state=readyOpening(this.state,performance.now());
  if(matchMedia("(prefers-reduced-motion:reduce)").matches){this.finish();return;}
  for(const layer of this.layers.values())this.animate(layer);this.schedule();this.publish();
 };
 private schedule(){
  this.clearTimers();const state=this.state;if(!state||state.completedAt!==null||state.revealStartedAt===null)return;
  for(const at of [state.revealStartedAt,state.revealStartedAt+timing.media,state.revealStartedAt+timing.media+timing.controls,state.revealStartedAt+artworkOpeningDuration-timing.backdrop])this.timers.push(setTimeout(()=>{
   if(this.state?.id!==state.id)return;if(at===state.revealStartedAt!+artworkOpeningDuration-timing.backdrop)this.finish();else this.publish();
  },Math.max(0,Math.ceil(at-performance.now()))));
 }
 private animate(layer:Layer){
  const state=this.state;if(!state||layer.kind==="root"||layer.kind==="paper")return;if(state.completedAt!==null){if(layer.kind==="background")layer.node.style.filter="blur(8px)";return;}
  layer.animation?.cancel();if(layer.timer)clearTimeout(layer.timer);
  const {node,kind}=layer,now=performance.now(),reveal=state.revealStartedAt;
  const atmosphere=kind==="backdrop"||kind==="background";
  if(!atmosphere){node.style.opacity="0";if(kind!=="media")node.inert=true;}
  if(!atmosphere&&reveal===null)return;
  const start=atmosphere?state.openedAt:reveal!+(kind==="media"?0:kind==="controls"?timing.media:timing.media+timing.controls);
  const duration=kind==="background"?timing.background:atmosphere?timing.backdrop:kind==="media"?timing.media:kind==="controls"?timing.controls:timing.identity;
  if(now>=start+duration){this.restore(layer);if(kind==="background")node.style.filter="blur(8px)";return;}
  if(matchMedia("(prefers-reduced-motion:reduce)").matches){this.restore(layer);if(kind==="background")node.style.filter="blur(8px)";return;}
  let frames:Keyframe[];
  if(kind==="background")frames=[{filter:"blur(0px)"},{filter:"blur(8px)"}];
  else if(kind==="backdrop")frames=[{opacity:0},{opacity:1}];
  else if(kind==="media")frames=[{opacity:1,clipPath:"inset(0 0 0 100%)",transform:"translateX(16px)"},{opacity:1,clipPath:"inset(0)",transform:"none"}];
  else if(kind==="identitySurface")frames=[{opacity:0,transform:"translateY(14px)"},{opacity:1,transform:"none"}];
  else frames=[{opacity:0,transform:kind==="controls"?"translateY(-12px)":kind==="timeline"?"translateX(6px)":"translateY(14px)",filter:kind==="timeline"?"blur(0px)":"blur(6px)"},{opacity:1,transform:"none",filter:"blur(0px)"}];
  node.style.willChange=kind==="background"?"filter":kind==="backdrop"?"opacity":kind==="identitySurface"?"opacity,transform":"opacity,transform,filter";
  try{const animation=node.animate(frames,{duration,delay:Math.max(0,start-now),fill:"both",easing:kind==="background"?"cubic-bezier(.77,0,.175,1)":kind==="media"?"cubic-bezier(.22,.61,.36,1)":"cubic-bezier(.16,1,.3,1)"});layer.animation=animation;if(now>start)animation.currentTime=now-start;
   layer.timer=setTimeout(()=>{if(this.state?.id===state.id&&this.layers.get(node)===layer){this.restore(layer);if(kind==="background")node.style.filter="blur(8px)";}},Math.max(0,Math.ceil(start+duration-now)));
  }catch{this.restore(layer);}
 }
}
