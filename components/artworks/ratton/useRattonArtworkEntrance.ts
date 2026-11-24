"use client";
import {type RefObject} from "react";
import {gsap} from "gsap";
import {useGSAP} from "@gsap/react";
import {useArtworkOpening} from "../ArtworkOpeningBoundary";
gsap.registerPlugin(useGSAP);
export function useRattonArtworkEntrance(root:RefObject<HTMLElement|null>){
 const opening=useArtworkOpening();
 useGSAP(()=>{const node=root.current;if(!node||!opening)return;const unregister=opening.register("root",node);
  if(opening.claimContentReveal())gsap.fromTo(node,{autoAlpha:0},{autoAlpha:1,duration:matchMedia("(prefers-reduced-motion:reduce)").matches ? .08 : .24,ease:"power2.out",clearProps:"opacity,visibility"});
  return unregister;
 },{scope:root,dependencies:[opening],revertOnUpdate:true});
}
