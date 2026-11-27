"use client";
import {useCallback,useEffect,useRef,useState,useMemo,useSyncExternalStore,type RefObject} from "react";
import {catalogQueryString} from "@/lib/artworks/catalog-query";
import {parseAddressedCatalog} from "@/lib/artworks/addresses";
import type {GalleryCatalog} from "@/lib/artworks/types";
const subscribe=()=>()=>{};

/** At most one page in flight; the observer anticipates the end without fetching the whole catalogue. */
export function useInfiniteArtworkCatalog(initial:GalleryCatalog|null,locale:string,enabled:boolean,sentinelRef:RefObject<HTMLDivElement|null>){
 const hydrated=useSyncExternalStore(subscribe,()=>true,()=>false);
 const [pages,setPages]=useState(()=>initial?[initial]:[]),[loading,setLoading]=useState(false),[error,setError]=useState<string|null>(null),[retryAt,setRetryAt]=useState(0);
 const automatic=useRef(true),completed=useRef(initial?.page??0),focusAfterLoad=useRef<{root:Element;start:number}|null>(null);
 const request=useRef<AbortController|null>(null),last=pages.at(-1),active=Boolean(enabled&&hydrated&&initial),hasMore=Boolean(last&&last.page<last.pageCount);
 const load=useCallback(async(manual=false)=>{
  if(!active||!last||!hasMore||last.page!==completed.current||!manual&&!automatic.current||request.current||Date.now()<retryAt||document.hidden||sentinelRef.current?.closest("[inert]"))return;
  const controller=new AbortController();request.current=controller;setLoading(true);setError(null);
  try{
   const query=catalogQueryString({q:initial?.query||undefined,types:initial?.typeFilters?.selectedIds,page:last.page+1,pageSize:last.pageSize,catalogRevision:last.catalogRevision});
   const response=await fetch("/api/artwork-catalog"+query+"&locale="+encodeURIComponent(locale),{signal:AbortSignal.any([controller.signal,AbortSignal.timeout(45000)]),headers:{Accept:"application/json","X-Artwork-Card-Focus":"1","X-Artwork-Address-Contract":"1"}});
   if(!response.ok){if(response.status===429){const delay=Number(response.headers.get("retry-after"));setRetryAt(Date.now()+(Number.isFinite(delay)&&delay>0?Math.min(delay,3600):60)*1000);}throw new Error(response.status===409?"catalog_changed":response.status===429?"rate_limited":"service_unavailable");}
   const contract=response.headers.get("x-artwork-address-contract");if(contract!=="1"&&contract!=="0")throw new Error("service_unavailable");const page=parseAddressedCatalog(await response.json(),true,contract==="1");
   const ids=new Set(pages.flatMap(page=>page.items.map(item=>item.id)));
   if(page.page!==last.page+1||page.pageSize!==last.pageSize||page.catalogRevision!==last.catalogRevision||page.query!==last.query||page.totalItems!==last.totalItems||new Set(page.items.map(item=>item.id)).size!==page.items.length||page.items.some(item=>ids.has(item.id))||JSON.stringify(page.typeFilters?.selectedIds??[])!==JSON.stringify(last.typeFilters?.selectedIds??[]))throw new Error("catalog_changed");
   if(!controller.signal.aborted){
    completed.current=page.page;automatic.current=true;
    const root=manual?sentinelRef.current?.closest("section"):null;if(root)focusAfterLoad.current={root,start:pages.reduce((count,p)=>count+p.items.length,0)};
    setPages(previous=>[...previous,page]);
   }
  }catch(cause){if(!controller.signal.aborted){automatic.current=false;setError(cause instanceof Error&&["catalog_changed","rate_limited"].includes(cause.message)?cause.message:"service_unavailable");}}
  finally{if(request.current===controller){request.current=null;setLoading(false);}}
 },[active,last,hasMore,initial,locale,pages,retryAt,sentinelRef]);
 useEffect(()=>{const target=focusAfterLoad.current;if(!target)return;const link=target.root.querySelectorAll<HTMLElement>("[data-artwork-card] a")[target.start];if(link){focusAfterLoad.current=null;link.focus();}},[pages]);
 useEffect(()=>()=>{request.current?.abort();},[active]);
 useEffect(()=>{if(!retryAt)return;const timer=setTimeout(()=>setRetryAt(0),Math.max(0,retryAt-Date.now()));return()=>clearTimeout(timer);},[retryAt]);
 useEffect(()=>{
  const node=sentinelRef.current;if(!active||!hasMore||error||!node||typeof IntersectionObserver==="undefined")return;
  const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting))void load();},{rootMargin:"1600px 0px"});observer.observe(node);
  const resume=()=>{observer.unobserve(node);observer.observe(node);};
  const background=node.closest("[data-artwork-background]"),mutation=new MutationObserver(resume);if(background)mutation.observe(background,{attributes:true,attributeFilter:["inert"]});
  document.addEventListener("visibilitychange",resume);
  return()=>{observer.disconnect();mutation.disconnect();document.removeEventListener("visibilitychange",resume);};
 },[active,hasMore,error,load,sentinelRef]);
 const items=useMemo(()=>pages.flatMap(page=>page.items),[pages]);
 return {active,items,eagerFrom:pages.length>1?pages.slice(0,-1).reduce((n,p)=>n+p.items.length,0):0,hasMore,loading,error,retryAt,load,nextPage:last?last.page+1:1};
}
