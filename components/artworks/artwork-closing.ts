export const artworkClosingTiming={roll:500,reveal:600,loader:240} as const;
export type ArtworkClosingPhase='idle'|'rolling'|'waiting'|'revealing';
/** Keeps the exit and return atmosphere alive independently of the routed dialog. */
export class ArtworkClosing{
 phase:ArtworkClosingPhase='idle';
 private animations:Animation[]=[];private restores:(()=>void)[]=[];private timer:ReturnType<typeof setTimeout>|undefined;
 private resolve:((completed:boolean)=>void)|undefined;private complete:(()=>void)|undefined;private loader:HTMLElement|null=null;
 constructor(private changed:()=>void){}
 private reduced(){return typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion:reduce)').matches;}
 private animate(node:HTMLElement,frames:Keyframe[],duration:number){try{this.animations.push(node.animate(frames,{duration,fill:'both',easing:'cubic-bezier(.22,.61,.36,1)'}));}catch{/* The lifecycle still completes without WAAPI. */}}
 setLoader=(node:HTMLElement|null)=>{this.loader=node;if(node&&this.phase!=='idle'){this.animate(node,[{opacity:0},{opacity:1}],160);}};
 roll(papers:HTMLElement[],retainSnapshot=false):Promise<boolean>{
  this.reset();this.phase='rolling';const reduced=this.reduced();
  for(const node of papers){const inert=node.inert;node.inert=true;this.restores.push(()=>{node.inert=inert;});
   let surface=node;
   // A browser Back has already changed the route. Its visual exit must survive React removing the dialog.
   if(retainSnapshot&&node.isConnected){
    const snapshot=node.cloneNode(true) as HTMLElement,computed=getComputedStyle(node);
    for(const property of computed)if(property.startsWith('--'))snapshot.style.setProperty(property,computed.getPropertyValue(property));
    snapshot.inert=true;snapshot.setAttribute('aria-hidden','true');snapshot.removeAttribute('role');snapshot.dataset.artworkExitSnapshot='';
    for(const element of [snapshot,...snapshot.querySelectorAll<HTMLElement>('[id]')])element.removeAttribute('id');
    Object.assign(snapshot.style,{position:'fixed',inset:'0',width:'100%',height:'100%',zIndex:'1301',pointerEvents:'none'});
    document.body.append(snapshot);snapshot.scrollTop=node.scrollTop;surface=snapshot;this.restores.push(()=>snapshot.remove());
   }
   this.animate(surface,reduced?[{opacity:1},{opacity:0}]:[{clipPath:'inset(0)',transform:'none'},{clipPath:'inset(0 0 0 100%)',transform:'translateX(16px)'}],reduced?120:artworkClosingTiming.roll);
  }
  this.changed();return new Promise(resolve=>{this.resolve=resolve;this.complete=()=>{this.phase='waiting';this.complete=undefined;this.resolve=undefined;this.changed();resolve(true);};this.timer=setTimeout(()=>this.complete?.(),reduced?120:artworkClosingTiming.roll);});
 }
 reveal(backgrounds:HTMLElement[],backdrops:HTMLElement[]):Promise<boolean>{
  if(this.phase==='idle')return Promise.resolve(true);
  this.phase='revealing';const reduced=this.reduced(),duration=reduced?120:artworkClosingTiming.reveal;
  for(const node of backgrounds)this.animate(node,[{filter:'blur(8px)'},{filter:'blur(0px)'}],duration);
  for(const node of backdrops)this.animate(node,[{opacity:1},{opacity:0}],duration);
  if(this.loader)this.animate(this.loader,[{opacity:1},{opacity:0}],reduced?120:artworkClosingTiming.loader);
  this.changed();return new Promise(resolve=>{this.resolve=resolve;this.complete=()=>{this.complete=undefined;this.resolve=undefined;resolve(true);};this.timer=setTimeout(()=>this.complete?.(),duration);});
 }
 /** Resize/visibility changes finish motion, but never pretend a pending route is ready. */
 skipMotion=()=>{if(this.timer)clearTimeout(this.timer);for(const animation of this.animations)try{animation.finish();}catch{/* Detached surface. */}this.complete?.();};
 reset=()=>{if(this.timer)clearTimeout(this.timer);this.timer=undefined;this.complete=undefined;this.resolve?.(false);this.resolve=undefined;for(const a of this.animations)a.cancel();this.animations=[];for(const restore of this.restores)restore();this.restores=[];this.loader=null;this.phase='idle';};
}
