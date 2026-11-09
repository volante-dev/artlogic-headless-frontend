import gsap from 'gsap';
import {motionFamilies} from '../../../lib/editorial/immersive/motion-catalog';
export type GroupAppearance='group-fade'|'group-reveal'|'group-zoom-out';
export const imageGroupMotionProposals=motionFamilies.imageGroup.animations.map(animation=>({id:animation.id,label:animation.labelFr,durationMs:animation.durationMs}));
/** Validated image-group family. Caller owns the GSAP context and interruption lifecycle. */
export function createImageGroupAppearance(id:GroupAppearance,surface:HTMLElement,reduced=false){
 const frames=Array.from(surface.querySelectorAll<HTMLElement>('[data-group-motion-frame]')).filter(node=>!node.closest('[data-editorial-slide-phase=warming]'));
 const controls=Array.from(surface.querySelectorAll<HTMLElement>('[data-editorial-motion-controls]')).filter(node=>!node.closest('[data-editorial-slide-phase=warming]'));
 const tl=gsap.timeline({paused:true,defaults:{ease:'power2.out'}});
 if(reduced){tl.set([surface,...frames,...controls],{autoAlpha:1,xPercent:0,yPercent:0,y:0,scale:1,clipPath:"inset(0% 0% 0% 0%)"});return tl;}
 const duration=imageGroupMotionProposals.find(a=>a.id===id)!.durationMs/1000;
 tl.set(controls,{autoAlpha:0,y:6},0);
 if(id==='group-reveal'){
  const frameDuration=1.36;
  frames.forEach((frame,index)=>{
   // Reveal the actual visual viewport. A stationary image shares its mask:
   // no translating placeholder, compensating tween or independent image fade.
   const vertical=frames.length===3&&index===1;
   const clipPath=vertical?'inset(100% 0% 0% 0%)':index===0?'inset(0% 100% 0% 0%)':'inset(0% 0% 0% 100%)';
   tl.fromTo(frame,{clipPath},{clipPath:'inset(0% 0% 0% 0%)',duration:frameDuration},0);
  });
 }else if(id==='group-zoom-out')tl.fromTo(frames,{autoAlpha:0,scale:1.04,y:18},{autoAlpha:1,scale:1,y:0,duration:1.02,stagger:{amount:frames.length>1?.06:0}},0);
 else tl.fromTo(frames,{autoAlpha:0},{autoAlpha:1,duration:.62},0);
 tl.to(controls,{autoAlpha:1,y:0,duration:.34},duration-.34);
 return tl;
}
