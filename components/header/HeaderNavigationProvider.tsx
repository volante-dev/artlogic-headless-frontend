'use client';
import {createContext,useContext,useMemo,useRef,useState,useCallback,useLayoutEffect,useEffect,type ReactNode,type RefObject} from 'react';
import {useRouter,usePathname,useSearchParams} from 'next/navigation';
import {classifyRoute} from '../../lib/i18n/routes';
import {HEADER_HISTORY_KEY,navigationHrefKey,readHistory,historyDecision,commitDecision,requestRefresh,type HeaderRouteSnapshot,type HeaderNavigationState} from '../../lib/header/navigation-state';
interface Navigation {entry:{target:string;source:'header'|'history';generation:number}|null;registerRecovery:(retry:()=>void)=>()=>void;mainRef:RefObject<HTMLElement|null>;snapshot:HeaderRouteSnapshot;status:HeaderNavigationState['status'];begin:(href:string)=>number;isCurrent:(generation:number)=>boolean;commit:(snapshot:HeaderRouteSnapshot)=>void;retry:()=>void;fail:()=>void}
const Context=createContext<Navigation|null>(null);
export function useHeaderNavigation(){return useContext(Context);}
function protect(main:HTMLElement|null){if(main){main.style.visibility='hidden';main.inert=true;main.setAttribute('aria-busy','true');}}
export function HeaderNavigationProvider({initial,children}:{initial:HeaderRouteSnapshot;children:ReactNode}){
 const mainRef=useRef<HTMLElement|null>(null),recovery=useRef<(()=>void)|null>(null),activeEntry=useRef<string|null>(null);
 const registerRecovery=useCallback((retry:()=>void)=>{recovery.current=retry;return()=>{if(recovery.current===retry)recovery.current=null;};},[]);
 const router=useRouter(),pathname=usePathname(),search=useSearchParams();
 const [entry,setEntry]=useState<Navigation['entry']>(null);
 const [state,setState]=useState<HeaderNavigationState>({snapshot:initial,status:'ready',generation:0,intent:null});
 const current=useRef(state),seen=useRef(new Set([initial.requestId])),lastByHref=useRef(new Map([[initial.hrefKey,initial.requestId]]));
 const currentKey=useCallback(()=>navigationHrefKey(location.href,location.href,current.current.snapshot.site.policy),[]);
 const update=useCallback((next:HeaderNavigationState)=>{current.current=next;setState(next);},[]);
 const start=useCallback((target:string,source:'header'|'history',entryId:string,baselineRequestId?:string)=>{
  protect(mainRef.current);const generation=current.current.generation+1;setEntry({target,source,generation});
  update({...current.current,generation,status:'navigating',intent:{generation,entryId,target,source,baselineRequestId,refreshRequested:false,deadline:Date.now()+10000}});
  return generation;
 },[update]);
 const begin=useCallback((href:string)=>{
  const old=readHistory(history.state),key=currentKey();
  // Artwork entries remain owned by the modal's traversal and availability checks.
  if(classifyRoute(location.pathname,current.current.snapshot.site.policy).kind!=='artwork'){
   const entryId=old?.hrefKey===key?old.entryId:crypto.randomUUID();
   history.replaceState({...history.state,[HEADER_HISTORY_KEY]:{version:1,entryId,hrefKey:key,lastRequestId:lastByHref.current.get(key)}},'',location.href);activeEntry.current=entryId;
  }
  const target=navigationHrefKey(href,location.href,current.current.snapshot.site.policy),repeated=current.current.intent?.target===target;
  return start(target,repeated?'history':'header',crypto.randomUUID(),repeated?undefined:lastByHref.current.get(target));
 },[start,currentKey]);
 const isCurrent=useCallback((generation:number)=>current.current.generation===generation&&current.current.intent!==null&&current.current.status!=='error',[]);
 const refresh=useCallback(()=>{
  const value=current.current,intent=value.intent;if(!intent||currentKey()!==intent.target||value.status==='error')return;
  const next=requestRefresh(intent);if(!next)return;
  update({...value,intent:next,status:'refreshing'});router.refresh();
 },[router,update,currentKey]);
 const commit=useCallback((snapshot:HeaderRouteSnapshot)=>{
  if(snapshot.scope!=='public'||snapshot.hrefKey!==currentKey())return;
  const value=current.current,intent=value.intent;
  if(intent){
   const decision=commitDecision(intent,snapshot,currentKey(),value.generation,seen.current);
   if(decision==='ignore'||value.status==='error')return;
   if(decision==='refresh'){seen.current.add(snapshot.requestId);refresh();return;}
  }else if(value.snapshot.requestId===snapshot.requestId)return;
  // Only a rendered page is evidence; a refreshed layout bootstrap is deliberately ignored.
  seen.current.add(snapshot.requestId);lastByHref.current.set(snapshot.hrefKey,snapshot.requestId);
  const old=readHistory(history.state);
  if(intent||old?.hrefKey===snapshot.hrefKey){const entryId=intent?.entryId??old!.entryId;history.replaceState({...history.state,[HEADER_HISTORY_KEY]:{version:1,entryId,hrefKey:snapshot.hrefKey,lastRequestId:snapshot.requestId}},'',location.href);activeEntry.current=entryId;}
  const confirmed=snapshot.status==='ready'?snapshot:{...value.snapshot,requestId:snapshot.requestId,hrefKey:snapshot.hrefKey,status:snapshot.status};
  update({...value,snapshot:confirmed,intent:null,status:'ready'});
  document.documentElement.lang=snapshot.locale;
  if(intent?.source==='header')requestAnimationFrame(()=>{if(current.current.generation===value.generation&&current.current.status==='ready')mainRef.current?.focus({preventScroll:true});});
 },[refresh,update,currentKey]);
 const fail=useCallback(()=>{if(current.current.intent){protect(mainRef.current);update({...current.current,status:'error'});}},[update]);
 const retry=useCallback(()=>{const target=current.current.intent?.target??currentKey();if(target!==currentKey()){start(target,'history',crypto.randomUUID());router.push(target);return;}start(target,'history',readHistory(history.state)?.entryId??crypto.randomUUID(),lastByHref.current.get(target));recovery.current?.();queueMicrotask(refresh);},[start,refresh,router,currentKey]);
 useLayoutEffect(()=>{
  const pop=()=>{
   if(classifyRoute(location.pathname,current.current.snapshot.site.policy).kind==='artwork')return;
   const target=currentKey(),decision=historyDecision(history.state,target,current.current.intent?null:activeEntry.current);if(decision.kind==='ignore')return;
   const entryId=decision.kind==='restore'?decision.entry.entryId:crypto.randomUUID();activeEntry.current=entryId;start(target,'history',entryId,decision.kind==='restore'?decision.entry.lastRequestId:undefined);
  };
  window.addEventListener('popstate',pop,true);
  // Activity tears effects down: work pending in a previous locale layout cannot resume as proof.
  const target=currentKey();if(current.current.intent||current.current.snapshot.hrefKey!==target){const entry=readHistory(history.state);start(target,'history',entry?.hrefKey===target?entry.entryId:crypto.randomUUID(),lastByHref.current.get(target));}
  return()=>window.removeEventListener('popstate',pop,true);
 },[start,currentKey]);
 useEffect(()=>{
  const intent=current.current.intent;if(!intent||currentKey()!==intent.target)return;
  // Missing commits (including retained Activity pages) get one conservative refresh.
  const timer=setTimeout(refresh,150);return()=>clearTimeout(timer);
 },[pathname,search,state.generation,refresh,currentKey]);
 useLayoutEffect(()=>{if(state.status!=='ready')return;const main=mainRef.current;if(main){main.style.visibility='';main.inert=Boolean(main.closest('[data-artwork-route]')?.querySelector('header[data-menu-state="open"],header[data-menu-state="closing"]'));main.removeAttribute('aria-busy');}},[state]);
 useEffect(()=>{const intent=state.intent;if(!intent)return;const timer=setTimeout(()=>{if(current.current.intent?.generation===intent.generation)fail();},Math.max(0,intent.deadline-Date.now()));return()=>clearTimeout(timer);},[state.intent,fail]);
 const value=useMemo(()=>({entry,registerRecovery,mainRef,snapshot:state.snapshot,status:state.status,begin,isCurrent,commit,retry,fail}),[entry,state.snapshot,state.status,begin,isCurrent,commit,retry,fail,registerRecovery]);
 return <Context value={value}>{children}</Context>;
}
