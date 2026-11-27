import {artworkHref} from "@/lib/artworks/artwork-href";
import {requestRoutingPolicy,withResolvedLanguageRequest} from '@/lib/i18n/request-language';
import {loadLinkInBioCapabilities} from '@/lib/link-in-bio/load-public';
import {linkInBioPublished} from '@/lib/link-in-bio/capabilities';
import {PublicApiError} from "@/lib/api/client";
import {getPublicPresentation} from "@/lib/presentation/client";
import type {MetadataRoute} from "next";
import {connection} from "next/server";
import {loadConfig,stringValue} from "@/lib/config/env";
import {sections,localizedPath} from "@/lib/i18n/routes";
import {getEditorialPage} from "@/lib/editorial/server";
import {getGalleryCatalog} from "@/lib/artworks/server";
import {pageAlternates} from "@/lib/seo/metadata";
import {loadStoreCapabilities,loadStoreCatalog} from '@/lib/commerce/catalog';
/** Fresh public projections only; private copies and preparatory languages never enter this file. */
export default async function sitemap():Promise<MetadataRoute.Sitemap>{await connection();return withResolvedLanguageRequest(buildSitemap);}
async function buildSitemap():Promise<MetadataRoute.Sitemap>{for(let attempt=0;attempt<2;attempt++)try{return await buildSitemapAttempt();}catch(error){if(attempt===0&&(error instanceof Error&&error.message==="artwork_address_context_changed"||error instanceof PublicApiError&&["catalog_changed","address_context_changed"].includes(error.code)))continue;throw error;}throw new Error("artwork_address_context_changed");}
async function buildSitemapAttempt():Promise<MetadataRoute.Sitemap>{
 await connection();const config=loadConfig(),policy=await requestRoutingPolicy(),origin=stringValue(config,"SITE_ORIGIN"),items:MetadataRoute.Sitemap=[];
 const linkInBio=config.LINK_IN_BIO_ENABLED==='true'?await loadLinkInBioCapabilities():null;
 const root=await getPublicPresentation("home",policy.defaultLocale);
 try{const galerist=await getPublicPresentation("galerist",policy.defaultLocale,root.releaseId);for(const path of Object.values(galerist.pageIdentity?.alternatePaths??{}))items.push({url:new URL(path,origin).toString()});}catch(error){if(!(error instanceof PublicApiError)||error.status!==404)throw error;}
 let addressContext:string|undefined,addressContextChanged=false;
 for(const locale of policy.locales){for(const path of ["/",...sections.map(section=>"/"+section),"/legal"]){const alternates=pageAlternates(path,locale.code,policy,origin);items.push({url:new URL(localizedPath(path,locale.code,policy.defaultLocale),origin).toString(),alternates:{languages:alternates.languages as Record<string,string>}});}
  if(linkInBioPublished(config.LINK_IN_BIO_ENABLED==='true',linkInBio,locale.code)){const availablePolicy={...policy,locales:policy.locales.filter(l=>linkInBio!.locales.includes(l.code))},alternates=pageAlternates('/link-in-bio',locale.code,availablePolicy,origin);items.push({url:new URL(localizedPath('/link-in-bio',locale.code,policy.defaultLocale),origin).href,alternates:{languages:alternates.languages as Record<string,string>}});}
  if(config.COMMERCE_ENABLED==='true'&&(await loadStoreCapabilities(locale.code)).enabled&&(await loadStoreCatalog(locale.code)).items.length){const alternates=pageAlternates('/store',locale.code,policy,origin);items.push({url:new URL(localizedPath('/store',locale.code,policy.defaultLocale),origin).href,alternates:{languages:alternates.languages as Record<string,string>}});}
  // The public projection excludes drafts and unpublished works. Pin pagination to
  // its revision rather than silently mixing two catalogues during a publication.
  let page=1,catalogRevision:number|undefined;
  for(;;){const result=await getGalleryCatalog({locale:locale.code,page,pageSize:100,catalogRevision});catalogRevision=result.catalogRevision;if(result.artworkAddresses){if(addressContext&&addressContext!==result.artworkAddresses.contextRevision)addressContextChanged=true;addressContext??=result.artworkAddresses.contextRevision;}
   for(const artwork of result.items){const path=artworkHref(artwork,locale.code,policy.defaultLocale),languages=Object.fromEntries([...policy.locales.map(l=>[l.code,new URL(artworkHref(artwork,l.code,policy.defaultLocale),origin).href]),["x-default",new URL(artworkHref(artwork,policy.defaultLocale,policy.defaultLocale),origin).href]]);items.push({url:new URL(path,origin).href,alternates:{languages}});}
   if(items.length>50000)throw new Error("sitemap_partition_required");
   if(page>=result.pageCount)break;page++;
  }
  if(config.EDITORIAL_ENABLED==="true")for(const kind of ["publication","news","exhibition"] as const){let page=1,catalogRevision:string|undefined;for(;;){const result=await getEditorialPage(kind,locale.code,{page,pageSize:48,catalogRevision});catalogRevision=result.catalogRevision;for(const article of result.items)items.push({url:new URL(article.canonicalPath,origin).toString()});if(items.length>50000)throw new Error("sitemap_partition_required");if(page*result.pageSize>=result.total)break;page++;}}
 }
 if(addressContextChanged)throw new Error("artwork_address_context_changed");return items;
}
