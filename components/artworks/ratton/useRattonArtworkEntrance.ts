"use client";
import {useLayoutEffect,type RefObject} from "react";
import {useArtworkOpening} from "../ArtworkOpeningBoundary";
export function useRattonArtworkEntrance(root:RefObject<HTMLElement|null>){
 const opening=useArtworkOpening();
 useLayoutEffect(()=>{const node=root.current;if(!node||!opening)return;const unregister=opening.register("root",node);let animation:Animation|undefined;
  if(opening.phase!=="complete"&&!matchMedia("(prefers-reduced-motion:reduce)").matches)animation=node.animate([{opacity:.3},{opacity:1}],{duration:180,easing:"cubic-bezier(.16,1,.3,1)"});
  return ()=>{animation?.cancel();unregister();};
 },[root,opening]);
}
