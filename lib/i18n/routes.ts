import {isBuiltinFontPath} from "../../branding/font-catalog";
import {preservedCatalogQuery} from "../artworks/catalog-query";
export const sections=["news","artworks","exhibitions","publications","expertise","contact"] as const;
export type Section=typeof sections[number];
export interface RoutingPolicy{defaultLocale:string;locales:readonly {code:string;label:string}[]}
export interface SiteRoute{locale:string;logicalPath:string;section:Section|null;kind:"home"|"section"|"artwork"|"unknown";artworkId?:string;explicitDefault:boolean}
export function localizedPath(path:string,locale:string,defaultLocale:string):string{return (locale===defaultLocale?"":"/"+locale)+(path==="/"?"":path)||"/";}
export function classifyRoute(pathname:string,policy:RoutingPolicy):SiteRoute{
  const parts=pathname.split("/").filter(Boolean),first=parts[0];
  const explicit=policy.locales.some(l=>l.code===first),locale=explicit?parts.shift()!:policy.defaultLocale;
  const path="/"+parts.join("/"),base={locale,logicalPath:path,explicitDefault:explicit&&locale===policy.defaultLocale};
  if(!parts.length)return {...base,kind:"home",section:null};
  if(parts.length===1&&sections.includes(parts[0] as Section))return {...base,kind:"section",section:parts[0] as Section};
  if(parts.length===2&&parts[0]==="artworks")return {...base,kind:"artwork",section:"artworks",artworkId:parts[1]};
  return {...base,kind:"unknown",section:null};
}
export function isTechnicalPath(path:string):boolean{return /^\/api\/artwork-experiences\/[a-z0-9-]{1,113}$/i.test(path)||["/api/site-locale","/api/contact/config","/api/contact/inquiries","/api/contact/receipt"].includes(path)||path.startsWith("/_next/")||["/favicon.ico","/robots.txt","/sitemap.xml"].includes(path)||isBuiltinFontPath(path)||/^\/(?:media|site-logos|presentation-assets)\/[0-9a-f-]{36}$/i.test(path);}
export function preservedQuery(route:SiteRoute,query:URLSearchParams):string{
  if(route.kind==="section"&&route.section==="artworks")return preservedCatalogQuery(query);
  const params=new URLSearchParams();
  if(route.kind==="home"||(route.kind==="section"&&route.section==="artworks")){const cursors=query.getAll("cursor");if(cursors.length===1&&cursors[0]!.length<=2048)params.set("cursor",cursors[0]!);}
  if(route.kind==="section"&&route.section==="contact"){const artworks=query.getAll("artwork");if(artworks.length===1&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(artworks[0]!))params.set("artwork",artworks[0]!);}
  return params.size?"?"+params.toString():"";
}
