"use client";
import {useSyncExternalStore} from "react";
import {hasContactDraft} from "../lib/contact/client";
import {useSiteContent} from "./SiteContentProvider";
import Link from "next/link";
import {useScopedHref} from "./FreshLink";
import {useSiteLocale} from "./SiteLocaleBoundary";
import {localizedPath,type RoutingPolicy} from "@/lib/i18n/routes";
import styles from "./SiteHeader.module.css";
function subscribe(callback:()=>void){window.addEventListener("hashchange",callback);return ()=>window.removeEventListener("hashchange",callback);}
function fragment(){return window.location.hash;}
export function LanguageSelector({policy,locale,path,query,label}:{policy:RoutingPolicy;locale:string;path:string;query:string;label:string}){
  const {messages,locale:activeLocale}=useSiteContent(),dynamic=useSiteLocale(),scopedPath=useScopedHref(path);
  const hash=useSyncExternalStore(subscribe,fragment,()=>"");
  if(policy.locales.length===1)return null;
  const current=dynamic?activeLocale:locale;
  return <nav aria-label={dynamic?messages["header.languageLabel"]:label} aria-busy={dynamic?.pending||undefined} className={styles.languages}><ul>{policy.locales.map(language=><li key={language.code}><Link prefetch={false} scroll={false} href={(scopedPath.startsWith("/preview/render/")?"/preview/render/"+language.code+(path==="/"?"":path):localizedPath(path,language.code,policy.defaultLocale))+query+hash} onClick={event=>{
   if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
   if(language.code!==current&&hasContactDraft()&&!window.confirm(messages["contact.leaveConfirm"])){event.preventDefault();return;}
   if(dynamic){event.preventDefault();dynamic.changeLocale(language.code);}
  }} lang={language.code} hrefLang={language.code} aria-label={language.label} aria-current={language.code===current?"true":undefined}>{language.code.toUpperCase()}</Link></li>)}</ul>{dynamic?.error&&<span role="status">{messages["catalog.errorMessage"]}</span>}</nav>;
}
