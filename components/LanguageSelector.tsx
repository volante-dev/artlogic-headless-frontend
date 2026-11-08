"use client";
import{isEditorialSection}from"../lib/editorial/article-kind";
import {useSyncExternalStore} from "react";
import {hasContactDraft} from "../lib/contact/client";
import {useSiteContent} from "./SiteContentProvider";
import Link from "next/link";
import {useScopedHref} from "./FreshLink";
import {useSiteLocale} from "./SiteLocaleBoundary";
import {classifyRoute,preservedQuery,localizedPath,type RoutingPolicy} from "@/lib/i18n/routes";
import {parseEditorialQuery,editorialQueryString} from "../lib/editorial/query";
import styles from "./SiteHeader.module.css";
function subscribe(callback:()=>void){for(const event of ["hashchange","popstate","editorial-query-change"])window.addEventListener(event,callback);return()=>{for(const event of ["hashchange","popstate","editorial-query-change"])window.removeEventListener(event,callback);};}
function currentLocation(){return window.location.pathname+window.location.search+window.location.hash;}
export function LanguageSelector({policy,locale,path,query,label,alternatePaths}:{policy:RoutingPolicy;locale:string;path:string;query:string;label:string;alternatePaths?:Record<string,string>}){
  const {messages,locale:activeLocale}=useSiteContent(),dynamic=useSiteLocale(),scopedPath=useScopedHref(path);
  const currentHref=useSyncExternalStore(subscribe,currentLocation,()=>""),url=currentHref?new URL(currentHref,"https://internal.invalid"):null,hash=url?.hash??"",route=url?classifyRoute(url.pathname,policy):null;
  if(policy.locales.length===1)return null;
  const current=dynamic?activeLocale:locale;
  function linkQuery(language:string){if(dynamic?.articlePaths)return "";if(url&&route?.kind==="section"&&isEditorialSection(route.section??"")){if(language!==current)try{const value=editorialQueryString({...parseEditorialQuery(url.searchParams),page:1,catalogRevision:undefined});return value?"?"+value:"";}catch{return "";}return preservedQuery(route,url.searchParams);}return query;}
  return <nav aria-label={dynamic?messages["header.languageLabel"]:label} aria-busy={dynamic?.pending||undefined} className={styles.languages}><ul>{policy.locales.map(language=><li key={language.code}><Link prefetch={false} scroll={false} href={(dynamic?.pagePaths?.[language.code]??alternatePaths?.[language.code]??dynamic?.articlePaths?.[language.code]??(scopedPath.startsWith("/preview/render/")?"/preview/render/"+language.code+(path==="/"?"":path):localizedPath(path,language.code,policy.defaultLocale)))+linkQuery(language.code)+hash} onClick={event=>{
   if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
   if(language.code!==current&&hasContactDraft()&&!window.confirm(messages["contact.leaveConfirm"])){event.preventDefault();return;}
   if(dynamic){event.preventDefault();dynamic.changeLocale(language.code);}
  }} lang={language.code} hrefLang={language.code} aria-label={language.label} aria-current={language.code===current?"true":undefined}>{language.code.toUpperCase()}</Link></li>)}</ul>{dynamic?.error&&<span role="status">{messages["catalog.errorMessage"]} <button type="button" onClick={()=>window.location.reload()}>{messages["catalog.retry"]}</button></span>}</nav>;
}
