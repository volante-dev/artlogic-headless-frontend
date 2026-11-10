'use client';
import {useLayoutEffect,useRef,useState} from 'react';
import {useHeaderNavigation} from '../../header/HeaderNavigationProvider';

/** Acknowledge the exit before replacing the outgoing reading surface. */
export function useImmersiveExit(path:string,reduced:boolean){
 const navigation=useHeaderNavigation(),veil=useRef<HTMLSpanElement>(null),animation=useRef<Animation|null>(null),requested=useRef<number|null>(null),[closingGeneration,setClosingGeneration]=useState<number|null>(null);
 const closing=closingGeneration!==null&&navigation?.entry?.generation===closingGeneration&&navigation.status!=='ready'&&navigation.status!=='error';
 useLayoutEffect(()=>{
  if(navigation?.entry?.generation!==requested.current||navigation?.entry?.target===path||navigation?.status==='ready'||navigation?.status==='error'){
   animation.current?.cancel();animation.current=null;requested.current=null;
  }
 },[navigation?.entry,navigation?.status,path]);
 useLayoutEffect(()=>()=>{animation.current?.cancel();},[]);
 const close=(generation?:number)=>{
  if(requested.current!==null)return Promise.resolve(false);
  if(generation===undefined)return Promise.resolve(true);
  requested.current=generation;setClosingGeneration(generation);
  const node=veil.current;if(!node)return Promise.resolve(true);
  const motion=node.animate([{opacity:0},{opacity:1}],{duration:reduced?100:250,easing:'cubic-bezier(.23,1,.32,1)',fill:'forwards'});
  animation.current=motion;
  return motion.finished.then(()=>true,()=>false);
 };
 return{veil,closing,close,guard:(event:React.MouseEvent<HTMLAnchorElement>)=>{if(requested.current!==null)event.preventDefault();}};
}
