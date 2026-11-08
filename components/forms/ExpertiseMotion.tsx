"use client";
import {createContext,useContext,useRef,type ReactNode,type RefObject} from "react";
import gsap from "gsap";
import {Flip} from "gsap/Flip";
import {useGSAP} from "@gsap/react";
import {useExpertise} from "./ExpertiseProvider";
gsap.registerPlugin(useGSAP,Flip);
interface Motion {navigate(action:()=>void,direction?:number):void;layout(action:()=>void,photosOnly?:boolean):void}
const Context=createContext<Motion|null>(null);
export const ExpertiseMotionProvider=({value,children}:{value:Motion;children:ReactNode})=><Context value={value}>{children}</Context>;
/** View-only choreography. Uploads, validation and persistence remain in their controllers. */
export function useExpertiseChoreography(root:RefObject<HTMLFormElement|null>,content:RefObject<HTMLDivElement|null>,open:boolean,key:string,layoutKey:string,reduced:boolean,close:()=>void){
 const transition=useRef<gsap.core.Timeline|null>(null),snapshot=useRef<ReturnType<typeof Flip.getState>|null>(null),direction=useRef(1),pending=useRef(false),lastKey=useRef(key),ghost=useRef<HTMLElement|null>(null),frame=useRef<number|undefined>(undefined),photosOnly=useRef(false);
 const {contextSafe}=useGSAP(()=>{if(!open||!root.current)return;const paper=root.current.closest<HTMLElement>(".MuiDialog-paper");if(!paper)return;
  const timeline=gsap.timeline({defaults:{ease:"power3.out"}});
  const backdrop=paper.closest(".MuiDialog-root")?.querySelector(".MuiBackdrop-root");
  if(backdrop&&!reduced)timeline.fromTo(backdrop,{backdropFilter:"blur(0px)",webkitBackdropFilter:"blur(0px)"},{backdropFilter:"blur(5px)",webkitBackdropFilter:"blur(5px)",duration:.9,ease:"power2.inOut",clearProps:"backdropFilter,webkitBackdropFilter"},0);
  timeline.fromTo(paper,{autoAlpha:reduced?1:0,y:reduced?0:24,scale:reduced?1:.99},{autoAlpha:1,y:0,scale:1,duration:reduced?.08:.48,clearProps:"transform,opacity,visibility"},0)
   .fromTo(root.current.querySelectorAll("[data-expertise-chrome]"),{autoAlpha:reduced?1:0,y:reduced?0:-8},{autoAlpha:1,y:0,duration:reduced?.08:.32,stagger:reduced?0:.04,clearProps:"transform,opacity,visibility"},reduced?0:.12);
  return ()=>{timeline.kill();if(frame.current!==undefined)cancelAnimationFrame(frame.current);transition.current?.kill();ghost.current?.remove();ghost.current=null;pending.current=false;};
 },{scope:root,dependencies:[open,reduced],revertOnUpdate:true});
 useGSAP(()=>{if(!open||!content.current)return;const changed=lastKey.current!==key;lastKey.current=key;if(!changed)return;
  content.current.scrollTo({top:0});const target=content.current.querySelector<HTMLElement>("[data-expertise-panel]");if(!target)return;
  transition.current?.kill();
  const old=ghost.current;const timeline=gsap.timeline({defaults:{ease:"power3.out"},onComplete:()=>{
   old?.remove();if(ghost.current===old)ghost.current=null;pending.current=false;
   const active=document.activeElement;
   if(!(active instanceof HTMLElement)||!target.contains(active))target.querySelector<HTMLElement>("[data-expertise-panel-title]")?.focus({preventScroll:true});
  }});
  // Both layers overlap: the outgoing view remains present as the new one arrives.
  if(old)timeline.to(old,{autoAlpha:0,x:reduced?0:-direction.current*20,duration:reduced?.12:.26},0);
  timeline.fromTo(target,{autoAlpha:reduced?.75:old?0:1,x:reduced||!old?0:direction.current*26},{autoAlpha:1,x:0,duration:reduced?.12:.4,clearProps:"transform,opacity,visibility"},0);
  transition.current=timeline;
 },{scope:root,dependencies:[key,open,reduced]});
 const playLayout=()=>{if(!open||!root.current||!snapshot.current)return;const previous=snapshot.current;snapshot.current=null;
  if(reduced)return;
  // Shared photo IDs preserve spatial continuity between the tray and each object.
  Flip.from(previous,{targets:[...root.current.querySelectorAll<HTMLElement>(photosOnly.current?'[data-flip-id^="photo-"]':"[data-flip-id]")].filter(node=>node.getClientRects().length>0),duration:.42,ease:"power3.inOut",scale:true,nested:true,prune:true,
   onEnter:elements=>gsap.fromTo(elements,{autoAlpha:0,y:12},{autoAlpha:1,y:0,duration:.28,stagger:{each:.025,amount:.12},clearProps:"opacity,visibility,transform"})});
 };
 useGSAP(playLayout,{scope:root,dependencies:[layoutKey,open,reduced]});
 const navigate=(action:()=>void,nextDirection=1)=>contextSafe(()=>{
  transition.current?.progress(1);transition.current?.kill();ghost.current?.remove();ghost.current=null;
  direction.current=nextDirection;pending.current=true;
  const target=content.current?.querySelector<HTMLElement>("[data-expertise-panel]"),host=content.current?.querySelector<HTMLElement>("[data-expertise-stage]");
  if(target&&host&&!reduced){const copy=target.cloneNode(true) as HTMLElement;
   copy.removeAttribute("data-expertise-panel");copy.setAttribute("aria-hidden","true");copy.setAttribute("inert","");
   copy.querySelectorAll("[id],[name],[data-flip-id]").forEach(node=>{node.removeAttribute("id");node.removeAttribute("name");node.removeAttribute("data-flip-id");});
   Object.assign(copy.style,{position:"absolute",top:-(content.current?.scrollTop??0)+"px",left:"0",width:"100%",pointerEvents:"none",zIndex:"1",minHeight:"0"});
   host.append(copy);ghost.current=copy;
  }
  action();
 })();
 const layout=(action:()=>void,onlyPhotos=false)=>contextSafe(()=>{photosOnly.current=onlyPhotos;
  const nodes=[...(root.current?.querySelectorAll<HTMLElement>(onlyPhotos?'[data-expertise-panel] [data-flip-id^="photo-"]':'[data-expertise-panel] [data-flip-id]')??[])].filter(node=>node.getClientRects().length>0);
  if(nodes.length)Flip.killFlipsOf(nodes,true);snapshot.current=nodes.length&&!reduced?Flip.getState(nodes):null;action();
  if(frame.current!==undefined)cancelAnimationFrame(frame.current);frame.current=requestAnimationFrame(contextSafe(playLayout));
 })();
 const dismiss=()=>contextSafe(()=>{transition.current?.kill();ghost.current?.remove();ghost.current=null;pending.current=false;const paper=root.current?.closest<HTMLElement>(".MuiDialog-paper");if(!paper||reduced){close();return;}
  transition.current=gsap.timeline({onComplete:close}).to(paper,{autoAlpha:0,y:14,scale:.995,duration:.2,ease:"power2.in"});
 })();
 return {navigate,layout,dismiss};
}
export function useExpertiseActions(){const value=useExpertise(),motion=useContext(Context);return {...value,
 changeLayout:(action:()=>void)=>motion?motion.layout(action,true):action(),
 panel:(panel:typeof value.draft.panel,id?:string|null)=>{const rank={organize:0,object:1,contact:2,summary:3};const current=rank[value.draft.panel],next=rank[panel],oldIndex=value.objects.findIndex(o=>o.id===value.draft.activeObjectId),nextIndex=value.objects.findIndex(o=>o.id===id);const direction=next===current?(nextIndex<oldIndex?-1:1):(next<current?-1:1);const action=()=>value.panel(panel,id);if(motion)motion.navigate(action,direction);else action();},
 create:()=>motion?motion.layout(value.create):value.create(),
 assign:(id:string|null,photos?:readonly string[])=>motion?motion.layout(()=>value.assign(id,photos)):value.assign(id,photos),
 reorder:(id:string,direction:-1|1)=>motion?motion.layout(()=>value.reorder(id,direction)):value.reorder(id,direction),
 removeObject:(id:string)=>motion?motion.layout(()=>value.removeObject(id)):value.removeObject(id),
 primary:(id:string,photoId:string)=>motion?motion.layout(()=>value.primary(id,photoId)):value.primary(id,photoId),
 removePhoto:(id:string)=>motion?motion.layout(()=>value.removePhoto(id)):value.removePhoto(id),
};}
