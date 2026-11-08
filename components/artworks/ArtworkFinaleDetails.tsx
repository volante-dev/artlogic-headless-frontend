"use client";
import {useLayoutEffect,useRef,type ReactNode,type RefObject} from "react";
import styles from "./ArtworkFinale.module.css";
function updateDescriptionOverflow(node:HTMLDivElement){
 node.dataset.scrollable=String(node.scrollHeight>node.clientHeight+1);
 node.dataset.moreAbove=String(node.dataset.scrollable==="true"&&node.scrollTop>1);
 node.dataset.moreBelow=String(node.scrollHeight>node.clientHeight+1&&node.scrollTop+node.clientHeight<node.scrollHeight-2);
 node.tabIndex=node.dataset.readingActive==="true"&&node.dataset.scrollable==="true"?0:-1;
 const area=node.parentElement;if(area){area.dataset.scrollable=node.dataset.scrollable;if(node.dataset.scrollable!=="true"){area.dataset.scrolling="false";area.dataset.touching="false";}}
 const thumb=area?.querySelector<HTMLElement>("[data-finale-scroll-thumb]");
 if(thumb&&node.clientHeight>0){
  const height=Math.min(node.clientHeight,Math.max(20,node.clientHeight*node.clientHeight/node.scrollHeight));
  const offset=node.scrollHeight>node.clientHeight?node.scrollTop/(node.scrollHeight-node.clientHeight)*(node.clientHeight-height):0;
  thumb.style.height=height+"px";thumb.style.transform=`translateY(${offset}px)`;
 }
}
export function ArtworkFinaleDetails({children,provenance,provenanceLabel,active,readingRef}:{children?:ReactNode;provenance?:ReactNode;provenanceLabel:string;active:boolean;readingRef?:RefObject<HTMLDivElement|null>}){
 const description=useRef<HTMLDivElement>(null),text=useRef<HTMLDivElement>(null),scrollTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useLayoutEffect(()=>{
  const node=description.current;if(!node)return;
  // Reading owns wheel gestures even at its boundaries; never hand inertia to slide navigation.
  const wheel=(event:WheelEvent)=>{if(active&&node.dataset.scrollable==="true"&&!event.ctrlKey)event.stopPropagation();};
  node.addEventListener("wheel",wheel,{passive:true});
  const update=()=>updateDescriptionOverflow(node),observer=new ResizeObserver(update);
  observer.observe(node);if(text.current)observer.observe(text.current);update();
  return ()=>{observer.disconnect();node.removeEventListener("wheel",wheel);if(scrollTimer.current)clearTimeout(scrollTimer.current);if(node.parentElement)node.parentElement.dataset.scrolling="false";};
 },[children,active]);
 return <div className={styles.details} data-finale-details inert={!active||undefined} aria-hidden={!active}>
   {children&&<div className={styles.descriptionArea} data-finale-description-area data-scrollable="false"><div className={styles.description} data-finale-description aria-label="Description" tabIndex={-1} data-reading-active={active} ref={node=>{description.current=node;if(readingRef)readingRef.current=node;}} onScroll={event=>{
    const node=event.currentTarget;updateDescriptionOverflow(node);if(node.dataset.scrollable!=="true")return;const area=node.parentElement;if(area)area.dataset.scrolling="true";
    if(scrollTimer.current)clearTimeout(scrollTimer.current);scrollTimer.current=setTimeout(()=>{if(area?.isConnected)area.dataset.scrolling="false";},900);
   }} onKeyDown={event=>{if(event.currentTarget.dataset.scrollable==="true"&&["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","PageUp","PageDown","Home","End"," "].includes(event.key))event.stopPropagation();}}
   onTouchStart={event=>{if(event.currentTarget.dataset.scrollable!=="true")return;event.stopPropagation();const area=event.currentTarget.parentElement;if(area)area.dataset.touching="true";}}
   onTouchEnd={event=>{if(event.currentTarget.dataset.scrollable!=="true")return;event.stopPropagation();const area=event.currentTarget.parentElement;if(area)area.dataset.touching="false";}}
   onTouchCancel={event=>{if(event.currentTarget.dataset.scrollable!=="true")return;event.stopPropagation();const area=event.currentTarget.parentElement;if(area)area.dataset.touching="false";}}><div ref={text} className={styles.prose}>{children}</div></div><div className={styles.scrollTrack} aria-hidden="true"><div className={styles.scrollThumb} data-finale-scroll-thumb/></div></div>}
   {provenance&&<div className={styles.provenance} data-finale-provenance><h2>{provenanceLabel}</h2>{provenance}</div>}
  </div>;
}
