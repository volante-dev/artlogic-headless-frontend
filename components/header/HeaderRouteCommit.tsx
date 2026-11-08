'use client';
import {useLayoutEffect,useRef} from 'react';
import {usePathname,useSearchParams} from 'next/navigation';
import {navigationHrefKey,type HeaderRouteSnapshot} from '../../lib/header/navigation-state';
import {useHeaderNavigation} from './HeaderNavigationProvider';
export function HeaderRouteCommit({snapshot}:{snapshot:HeaderRouteSnapshot}){
 const navigation=useHeaderNavigation(),marker=useRef<HTMLSpanElement>(null),pathname=usePathname(),query=useSearchParams(),commit=navigation?.commit;
 useLayoutEffect(()=>{
  // Manual locale replacement intentionally keeps the original server page mounted.
  if(snapshot.hrefKey!==navigationHrefKey(pathname+(query.size?'?'+query.toString():''),location.href,snapshot.site.policy))return;
  let frame=0,cancelled=false;const deadline=performance.now()+10000;
  function publish(){
   if(cancelled||performance.now()>deadline)return;
   let node:HTMLElement|null=marker.current?.parentElement??null;
   while(node){if(node.hidden||node.style.display==='none'){frame=requestAnimationFrame(publish);return;}node=node.parentElement;}
   // Streaming may hydrate the marker before Next has committed the public address.
   if(snapshot.hrefKey!==navigationHrefKey(location.href,location.href,snapshot.site.policy)){frame=requestAnimationFrame(publish);return;}
   commit?.(snapshot);
  }
  publish();return()=>{cancelled=true;cancelAnimationFrame(frame);};
 },[snapshot,pathname,query,commit]);
 return <span hidden data-header-href={snapshot.hrefKey} data-header-route={snapshot.requestId} ref={marker}/>;
}
