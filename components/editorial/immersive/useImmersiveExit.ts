'use client';
import {useLayoutEffect,useRef,useState} from 'react';
import {useHeaderNavigation} from '../../header/HeaderNavigationProvider';

/** Acknowledge the exit before replacing the outgoing reading surface. */
export function useImmersiveExit(path:string,reduced:boolean){
 const navigation=useHeaderNavigation(),requested=useRef<number|null>(null),[closingGeneration,setClosingGeneration]=useState<number|null>(null);
 const closing=closingGeneration!==null&&navigation?.entry?.generation===closingGeneration&&navigation.status!=='ready'&&navigation.status!=='error';
 useLayoutEffect(()=>{
  if(navigation?.entry?.generation!==requested.current||navigation?.entry?.target===path||navigation?.status==='ready'||navigation?.status==='error'){
   requested.current=null;
  }
 },[navigation?.entry,navigation?.status,path]);
 const close=(generation?:number)=>{
  if(requested.current!==null)return Promise.resolve(false);
  if(generation===undefined)return Promise.resolve(true);
  requested.current=generation;setClosingGeneration(generation);
  return navigation?.showExitFeedback(generation,reduced)??Promise.resolve(true);
 };
 return{closing,close,guard:(event:React.MouseEvent<HTMLAnchorElement>)=>{if(requested.current!==null)event.preventDefault();}};
}
