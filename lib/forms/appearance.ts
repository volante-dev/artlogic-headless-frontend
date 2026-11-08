import {gsap} from "gsap";
export type FormAnimation="form-fade"|"form-rise"|"form-reveal";
/** One implementation shared by the comparator, classic fields and immersive reader. */
export function createFormAppearance(panel:HTMLElement,animation:FormAnimation,reducedMotion=false){
 const timeline=gsap.timeline({paused:true,defaults:{ease:"power2.out"}});
 if(reducedMotion)return timeline.set(panel,{opacity:1,x:0,y:0,clearProps:"opacity,transform"});
 if(animation==="form-fade")timeline.fromTo(panel,{opacity:.25},{opacity:1,duration:.45,clearProps:"opacity"},0);
 else if(animation==="form-rise")timeline.fromTo(panel,{opacity:.25,y:18},{opacity:1,y:0,duration:.65,clearProps:"opacity,transform"},0);
 else{const groups=Array.from(panel.querySelectorAll<HTMLElement>("[data-form-entrance-group]")),targets=groups.length?groups:[panel];timeline.fromTo(targets,{opacity:.25,x:16},{opacity:1,x:0,duration:targets.length>1?.6:.8,stagger:targets.length>1?.2/(targets.length-1):0,clearProps:"opacity,transform"},0);}
 return timeline;
}
