import {createImageGroupAppearance,type GroupAppearance} from './image-group-motion';
import {createFormAppearance,type FormAnimation} from '../../../lib/forms/appearance';
import gsap from 'gsap';
import type{AnimationId}from'../../../lib/editorial/immersive/motion-catalog';
import{motionFamilies}from'../../../lib/editorial/immersive/motion-catalog';
export interface AppearanceTargets{surface:HTMLElement;text?:HTMLElement|null;media?:HTMLElement|null;controls?:HTMLElement[]}
/** Caller owns the GSAP context and epoch. Does not control scroll position. */
export function createEditorialAppearance(id:AnimationId,targets:AppearanceTargets,direction=1,reducedMotion=false){
 if(id.startsWith('form-'))return createFormAppearance(targets.surface,id as FormAnimation,reducedMotion);
 if(id.startsWith('group-'))return createImageGroupAppearance(id as GroupAppearance,targets.surface,reducedMotion);
 const animation=Object.values(motionFamilies).flatMap(f=>[...f.animations]).find(a=>a.id===id);
 if(!animation)throw Error('unsupported_editorial_animation');
 const tl=gsap.timeline({paused:true,defaults:{duration:animation.durationMs/1000,ease:animation.ease}});
 const {surface,text,media}=targets;
 const mediaItems=media?Array.from(media.querySelectorAll<HTMLElement>('[data-text-media-item]')):[];
 const controls=targets.controls??Array.from(surface.querySelectorAll<HTMLElement>('[data-editorial-motion-controls]'));
 if(reducedMotion){tl.set(surface,{autoAlpha:1,x:0,y:0,scale:1});if(controls.length)tl.set(controls,{autoAlpha:1,y:0});return tl;}
 if(id==='carousel-reveal'&&controls.length)tl.set(controls,{autoAlpha:0,y:8},0);
 if(id==='text-stagger'){
  const richText=text?.querySelector('[data-editorial-rich-text]')??text;const paragraphs=richText?.querySelectorAll(':scope > p,:scope > h2,:scope > h3,:scope > blockquote');const nodes=paragraphs?.length?Array.from(paragraphs):[text??surface];
  tl.fromTo(nodes,{autoAlpha:0,y:16*direction},{autoAlpha:1,y:0,duration:.48,stagger:{amount:.24}},0);
 }else if(id==='split-cross-reveal'){
  tl.fromTo(text??surface,{autoAlpha:0,x:-32*direction},{autoAlpha:1,x:0},0);if(mediaItems.length>1)mediaItems.forEach((item,index)=>tl.fromTo(item,{clipPath:index===0?'inset(0% 100% 0% 0%)':'inset(0% 0% 0% 100%)'},{clipPath:'inset(0% 0% 0% 0%)'},0));else if(media)tl.fromTo(media,{autoAlpha:0,x:32*direction},{autoAlpha:1,x:0},0);
 }else if(id==='split-stagger'){
  tl.fromTo(text??surface,{autoAlpha:0,y:20*direction},{autoAlpha:1,y:0,duration:.6},0);if(mediaItems.length>1)tl.fromTo(mediaItems,{autoAlpha:0,y:20*direction},{autoAlpha:1,y:0,duration:.5,stagger:.1},.2);else if(media)tl.fromTo(media,{autoAlpha:0,y:20*direction},{autoAlpha:1,y:0,duration:.6},.2);
 }else if(id.endsWith('reveal')){
  // Counter-translate the entire canvas, including its background and controls.
  const frame=media??surface,content=frame.querySelector<HTMLElement>(":scope > [data-editorial-motion-content]")??frame.querySelector("img");
  tl.set(frame,{overflow:"hidden"},0);
  tl.fromTo(frame,{xPercent:100*direction},{xPercent:0},0);
  if(content)tl.fromTo(content,{xPercent:-100*direction},{xPercent:0},0);
 }else if(id.endsWith('zoom-out'))tl.fromTo(media??surface,{autoAlpha:0,scale:id==='media-zoom-out'?1.06:1.04},{autoAlpha:1,scale:1},0);
 else if(id==='text-rise')tl.fromTo(text??surface,{autoAlpha:0,y:24*direction},{autoAlpha:1,y:0},0);
 else tl.fromTo(surface,{autoAlpha:0},{autoAlpha:1},0);
 if(id==='carousel-reveal'&&controls.length)tl.to(controls,{autoAlpha:1,y:0,duration:.24,ease:'power2.out'},'>');
 return tl;
}
