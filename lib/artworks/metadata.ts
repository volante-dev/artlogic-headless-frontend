import "server-only";
import {cache} from "react";
import type {Metadata} from "next";
import {getGalleryExperience} from "./server";
import {getPublicPresentation} from "../presentation/client";
import {loadSiteContent} from "../i18n/load-site-content";
import {localizedPath} from "../i18n/routes";
/** Request-local memoization only; visibility is never cached between requests. */
export const resolveArtworkDocument=cache(async(reference:string,locale:string)=>{
  const [experience,presentation]=await Promise.all([getGalleryExperience(reference,locale),getPublicPresentation("artworkDetail",locale)]);
  if(experience.presentationReleaseId!==presentation.releaseId)throw new Error("artwork_release_changed");
  return {experience,presentation};
});
export async function artworkMetadata(reference:string,locale:string):Promise<Metadata>{
  const site=await loadSiteContent(),m=site.messages;
  try{
    const {experience:{artwork:art,description},presentation}=await resolveArtworkDocument(reference,locale);
    const path=localizedPath("/artworks/"+art.slug,locale,site.policy.defaultLocale),title=(art.title??m["artwork.untitled"])+" — "+site.siteName;
    return {title,description:presentation.metaDescription??description??art.artist??site.description,alternates:{canonical:new URL(path,site.siteOrigin).href,languages:Object.fromEntries(site.policy.locales.map(l=>[l.code,new URL(localizedPath("/artworks/"+art.slug,l.code,site.policy.defaultLocale),site.siteOrigin).href]))},openGraph:{title,url:new URL(path,site.siteOrigin).href,images:art.media[0]?[{url:"/media/"+art.media[0].id,width:art.media[0].width,height:art.media[0].height,alt:art.media[0].alt??art.title??m["artwork.imageAlt"]}]:[]}};
  }catch{return {title:m["catalog.unavailableTitle"]+" — "+site.siteName,robots:{index:false,follow:false},openGraph:{images:[]}};}
}
