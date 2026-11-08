"use client";
import Link from "next/link";
import {useSiteContent} from "./SiteContentProvider";
import {classifyRoute} from "../lib/i18n/routes";
export function useScopedHref(href:string){
  const {scope,defaultLocale,locales}=useSiteContent();
  if(scope!=="preview"||!href.startsWith("/")||href.startsWith("//")||href.startsWith("/preview/"))return href;
  const url=new URL(href,"https://internal.invalid"),route=classifyRoute(url.pathname,{defaultLocale,locales:locales.map(code=>({code,label:code}))});
  return route.kind==="unknown"||route.kind==="article"?href:"/preview/render/"+route.locale+(route.logicalPath==="/"?"":route.logicalPath)+url.search+url.hash;
}
/** Each document visit rechecks publication. Modifier-key navigation stays native. */
export function FreshLink({href,children,...attributes}:Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>,"href">&{href:string}){
  const target=useScopedHref(href);
  return <Link {...attributes} href={target} prefetch={false} onNavigate={event=>{event.preventDefault();window.location.assign(target);}}>{children}</Link>;
}
