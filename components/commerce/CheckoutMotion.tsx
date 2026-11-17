'use client';
import {useRef,useState,type ReactNode} from 'react';
import gsap from 'gsap';
import {useGSAP} from '@gsap/react';
import styles from './Checkout.module.css';
gsap.registerPlugin(useGSAP);
const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export function CheckoutArrow(){return <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.25' aria-hidden='true'><path d='M3 12h18m-7-7 7 7-7 7'/></svg>;}
export function CheckoutProgress({active,locale,onChange,disabled=false,complete=false}:{active:number;locale:string;onChange?:(index:number)=>void;disabled?:boolean;complete?:boolean}){
 const root=useRef<HTMLElement>(null),fr=locale==='fr',labels=fr?['Coordonnées','Livraison','Paiement']:['Your details','Delivery','Payment'];
 useGSAP(()=>{gsap.to('[data-progress-ink]',{scaleX:complete?1:active/2,duration:reduced()?0:.75,ease:'power3.inOut',overwrite:true});},{scope:root,dependencies:[active,complete]});
 return <nav ref={root} className={styles.progress} aria-label={fr?'Étapes de votre commande':'Checkout progress'}><div className={styles.progressTrack} aria-hidden='true'><span data-progress-ink/></div><ol>{labels.map((label,i)=><li key={label} data-complete={complete||i<active||undefined}><button type='button' onClick={()=>onChange?.(i)} disabled={disabled||complete||!onChange||i>=active} aria-current={!complete&&active===i?'step':undefined}><span className={styles.marker}>{complete||i<active?<svg viewBox='0 0 24 24' aria-hidden='true'><path d='m5 12 4 4 10-10'/></svg>:i+1}</span><span>{label}</span></button></li>)}</ol></nav>;
}
export function useCheckoutMotion(phase:number,ready:boolean){
 const stage=useRef<HTMLDivElement>(null),transitioning=useRef(false),focusNext=useRef(false),previousHeight=useRef<number|null>(null),[moving,setMoving]=useState(false);
 const {contextSafe}=useGSAP(()=>{
  const node=stage.current;if(!node)return;node.inert=false;if(focusNext.current){node.querySelector<HTMLElement>('h2')?.focus({preventScroll:true});focusNext.current=false;node.scrollIntoView({block:'start',behavior:'instant'});}transitioning.current=false;
  gsap.killTweensOf(node);gsap.set(node,{clearProps:'transform,opacity,visibility'});if(previousHeight.current!==null){const height=node.firstElementChild?.getBoundingClientRect().height??node.scrollHeight;previousHeight.current=null;gsap.to(node,{height,duration:reduced()?0:.48,ease:'power3.inOut',onComplete:()=>gsap.set(node,{clearProps:'height,overflow'})});}
  const parts=node.querySelectorAll('[data-checkout-reveal]');gsap.killTweensOf(parts);
  if(!reduced())gsap.fromTo(parts,{autoAlpha:.35,y:14},{autoAlpha:1,y:0,duration:.6,stagger:.028,ease:'power3.out',clearProps:'transform,opacity,visibility'});
 },{scope:stage,dependencies:[phase,ready]});
 const navigate=(commit:()=>void,direction=1)=>contextSafe(()=>{
  if(transitioning.current)return;focusNext.current=true;const node=stage.current;if(!node||reduced()){commit();return;}
  transitioning.current=true;setMoving(true);node.inert=true;previousHeight.current=node.getBoundingClientRect().height;gsap.killTweensOf(node);gsap.killTweensOf(node.querySelectorAll('[data-checkout-reveal]'));gsap.set(node,{height:previousHeight.current,overflow:'hidden'});
  gsap.to(node,{x:-18*direction,autoAlpha:0,duration:.19,ease:'power2.in',onComplete:()=>{commit();setMoving(false);}});
 })();
 return {stage,moving,navigate};
}
export function CheckoutDisclosure({open,children,id}:{open:boolean;children:ReactNode;id?:string}){
 const root=useRef<HTMLDivElement>(null),[initialOpen]=useState(open);
 useGSAP(()=>{
  const node=root.current;if(!node)return;gsap.killTweensOf(node);node.inert=!open;
  if(open){node.hidden=false;gsap.to(node,{height:'auto',autoAlpha:1,duration:reduced()?0:.5,ease:'power3.inOut',onComplete:()=>gsap.set(node,{height:'auto'})});}
  else gsap.to(node,{height:0,autoAlpha:0,duration:reduced()?0:.32,ease:'power3.inOut',onComplete:()=>{node.hidden=true;}});
 },{scope:root,dependencies:[open]});
 return <div ref={root} id={id} className={styles.disclosure} inert={!open||undefined} aria-hidden={!open} style={initialOpen?undefined:{height:0,overflow:'hidden'}}>{children}</div>;
}
export function ConfirmationMark(){
 const root=useRef<SVGSVGElement>(null);
 useGSAP(()=>{root.current?.querySelectorAll('circle,path').forEach((node,i)=>{const shape=node as SVGGeometryElement,length=shape.getTotalLength();gsap.fromTo(shape,{strokeDasharray:length,strokeDashoffset:length},{strokeDashoffset:0,duration:reduced()?0:.8,delay:reduced()?0:i*.2,ease:'power3.out'});});},{scope:root});
 return <svg ref={root} className={styles.successMark} viewBox='0 0 72 72' fill='none' stroke='currentColor' strokeWidth='1.25' aria-hidden='true'><circle cx='36' cy='36' r='30'/><path d='m22 36 10 10 20-21'/></svg>;
}
