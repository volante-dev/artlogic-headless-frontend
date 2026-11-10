'use client';
import {useRef} from 'react';
import {gsap} from 'gsap';
import {useGSAP} from '@gsap/react';
import styles from './ArtworkTypeFilters.module.css';
gsap.registerPlugin(useGSAP);

/** A reserved slot keeps search geometry stable, including 9 → 10 and clearing. */
export function FilterCount({count}:{count:number}){
 const root=useRef<HTMLSpanElement>(null),previous=useRef(count);
 useGSAP(()=>{
  const host=root.current;if(!host)return;
  const before=previous.current;previous.current=count;
  const current=document.createElement('span');current.textContent=count?String(count):'';
  const outgoing=host.lastElementChild;
  // A rapid interaction cancels the old transition and retains only its latest digit.
  for(const child of Array.from(host.children)){gsap.killTweensOf(child);if(child!==outgoing)child.remove();}
  host.append(current);
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||before===count){outgoing?.remove();return;}
  if(outgoing)gsap.to(outgoing,{y:count>before?-12:12,opacity:0,duration:.22,ease:'power2.out',onComplete:()=>outgoing.remove()});
  if(count)gsap.fromTo(current,{y:count>before?12:-12,opacity:0},{y:0,opacity:1,duration:.42,ease:'power3.out'});
 },{scope:root,dependencies:[count]});
 return <span ref={root} className={styles.count} data-filter-count={count} aria-hidden="true"/>;
}
