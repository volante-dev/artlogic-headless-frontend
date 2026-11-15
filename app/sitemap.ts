import {PublicApiError} from "@/lib/api/client";
import {getPublicPresentation} from "@/lib/presentation/client";
import type {MetadataRoute} from "next";
import {connection} from "next/server";
import {loadConfig,stringValue,configuredLocalePolicy} from "@/lib/config/env";
import {sections,localizedPath} from "@/lib/i18n/routes";
import {getEditorialPage} from "@/lib/editorial/server";
import {getGalleryCatalog} from "@/lib/artworks/server";
import {pageAlternates} from "@/lib/seo/metadata";
/** Fresh public projections only; private copies and preparatory languages never enter this file. */
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 await connection();const config=loadConfig(),policy=configuredLocalePolicy(config),origin=stringValue(config,"SITE_ORIGIN"),items:MetadataRoute.Sitemap=[];
 const root=await getPublicPresentation("home",policy.defaultLocale);
 try{const galerist=await getPublicPresentation("galerist",policy.defaultLocale,root.releaseId);for(const path of Object.values(galerist.pageIdentity?.alternatePaths??{}))items.push({url:new URL(path,origin).toString()});}catch(error){if(!(error instanceof PublicApiError)||error.status!==404)throw error;}
 for(const locale of policy.locales){for(const path of ["/",...sections.map(section=>"/"+section),"/legal"]){const alternates=pageAlternates(path,locale.code,policy,origin);items.push({url:new URL(localizedPath(path,locale.code,policy.defaultLocale),origin).toString(),alternates:{languages:alternates.languages as Record<string,string>}});}
  // The public projection excludes drafts and unpublished works. Pin pagination to
  // its revision rather than silently mixing two catalogues during a publication.
  let page=1,catalogRevision:number|undefined;
  for(;;){const result=await getGalleryCatalog({locale:locale.code,page,pageSize:100,catalogRevision});catalogRevision=result.catalogRevision;
   for(const artwork of result.items){const path="/artworks/"+artwork.slug,alternates=pageAlternates(path,locale.code,policy,origin);items.push({url:new URL(localizedPath(path,locale.code,policy.defaultLocale),origin).href,alternates:{languages:alternates.languages as Record<string,string>}});}
   if(items.length>50000)throw new Error("sitemap_partition_required");
   if(page>=result.pageCount)break;page++;
  }
  if(config.EDITORIAL_ENABLED==="true")for(const kind of ["publication","news","exhibition"] as const){let page=1,catalogRevision:string|undefined;for(;;){const result=await getEditorialPage(kind,locale.code,{page,pageSize:48,catalogRevision});catalogRevision=result.catalogRevision;for(const article of result.items)items.push({url:new URL(article.canonicalPath,origin).toString()});if(items.length>50000)throw new Error("sitemap_partition_required");if(page*result.pageSize>=result.total)break;page++;}}
 }
 return items;
}
