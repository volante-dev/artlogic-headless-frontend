import {publicFormOperation} from "../forms/operations";
import{isEditorialSection,sectionArticleKinds,type EditorialSection}from"../editorial/article-kind";
import {isBuiltinFontPath} from "../../branding/font-catalog";
import {preservedCatalogQuery} from "../artworks/catalog-query";
import {preservedEditorialQuery} from "../editorial/query";
export const sections=["news","artworks","exhibitions","publications","expertise","contact"] as const;
export type Section=typeof sections[number];
export interface RoutingPolicy{defaultLocale:string;locales:readonly {code:string;label:string}[]}
export interface SiteRoute{locale:string;logicalPath:string;section:Section|null;kind:"home"|"section"|"artwork"|"article"|"unknown";artworkId?:string;articleKind?:"publication"|"news"|"exhibition";articleSlug?:string;explicitDefault:boolean}
export function localizedPath(path:string,locale:string,defaultLocale:string):string{return (locale===defaultLocale?"":"/"+locale)+(path==="/"?"":path)||"/";}
export function classifyRoute(pathname:string,policy:RoutingPolicy):SiteRoute{
  const parts=pathname.split("/").filter(Boolean),first=parts[0];
  const explicit=policy.locales.some(l=>l.code===first),locale=explicit?parts.shift()!:policy.defaultLocale;
  const path="/"+parts.join("/"),base={locale,logicalPath:path,explicitDefault:explicit&&locale===policy.defaultLocale};
  if(!parts.length)return {...base,kind:"home",section:null};
  if(parts.length===1&&sections.includes(parts[0] as Section))return {...base,kind:"section",section:parts[0] as Section};
  if(parts.length===2&&parts[0]==="artworks")return {...base,kind:"artwork",section:"artworks",artworkId:parts[1]};
  if(parts.length===2&&isEditorialSection(parts[0]??"")){
    let slug:string;try{slug=decodeURIComponent(parts[1]!);}catch{return {...base,kind:"unknown",section:null};}
    if(!slug||Array.from(slug).length>160||[".",".."].includes(slug)||/[/?#\\\u0000-\u001f\u007f]/u.test(slug))return {...base,kind:"unknown",section:null};
    return {...base,kind:"article",section:parts[0]as EditorialSection,articleKind:sectionArticleKinds[parts[0]as EditorialSection],articleSlug:slug};
  }
  return {...base,kind:"unknown",section:null};
}
export function isTechnicalPath(path:string):boolean{return path.startsWith("/api/forms/")&&Boolean(publicFormOperation("GET",path.slice(11).split("/"))??publicFormOperation("POST",path.slice(11).split("/"))??publicFormOperation("DELETE",path.slice(11).split("/")))||/^\/api\/artwork-experiences\/[a-z0-9-]{1,113}$/i.test(path)||["/api/image-observations","/api/image-descriptors/query","/api/media-observations","/api/site-locale","/api/editorial/articles","/api/editorial/filters","/api/contact/config","/api/contact/inquiries","/api/contact/receipt"].includes(path)||path.startsWith("/_next/")||["/favicon.ico","/robots.txt","/sitemap.xml"].includes(path)||isBuiltinFontPath(path)||/^\/(?:media|site-logos|presentation-assets|editorial-assets)\/[0-9a-f-]{36}$/i.test(path);}
export function preservedQuery(route:SiteRoute,query:URLSearchParams):string{
  if(route.kind==="section"&&route.section==="artworks")return preservedCatalogQuery(query);
  if(route.kind==="section"&&isEditorialSection(route.section??""))return preservedEditorialQuery(query);
  const params=new URLSearchParams();
  if(route.kind==="home"||(route.kind==="section"&&route.section==="artworks")){const cursors=query.getAll("cursor");if(cursors.length===1&&cursors[0]!.length<=2048)params.set("cursor",cursors[0]!);}
  if(route.kind==="section"&&route.section==="contact"){const artworks=query.getAll("artwork");if(artworks.length===1&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(artworks[0]!))params.set("artwork",artworks[0]!);}
  return params.size?"?"+params.toString():"";
}
