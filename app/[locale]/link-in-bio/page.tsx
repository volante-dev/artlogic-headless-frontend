import {linkInBioPublished} from '@/lib/link-in-bio/capabilities';
import {Suspense} from 'react';
import {headers} from 'next/headers';
import {notFound} from 'next/navigation';
import {loadConfig} from '@/lib/config/env';
import {loadSiteContent} from '@/lib/i18n/load-site-content';
import {loadPublicPresentation} from '@/lib/presentation/load-public';
import {PublicPage} from '@/lib/presentation/load-page';
import {loadLinkInBioCapabilities,loadPublicLinkInBio} from '@/lib/link-in-bio/load-public';
import {LinkInBioError} from '@/lib/link-in-bio/contracts';
import {LinkInBioRoute} from '@/components/link-in-bio/LinkInBioRoute';
import {pageAlternates} from '@/lib/seo/metadata';
async function feed(locale:string,cursor?:string){
 if(loadConfig().LINK_IN_BIO_ENABLED!=='true')notFound();const capabilities=await loadLinkInBioCapabilities();
 if(!linkInBioPublished(true,capabilities,locale))notFound();
 try{return (await loadPublicLinkInBio(locale,cursor)).feed;}catch(error){if(error instanceof LinkInBioError&&error.status===404)notFound();throw error;}
}
export async function generateMetadata(){
 const [context,site]=await Promise.all([headers(),loadSiteContent()]);
 if(context.get('x-site-page-key')==='galerist'){const page=await loadPublicPresentation();return {title:(page.pageIdentity?.name??site.siteName)+' | '+site.siteName,description:page.metaDescription??site.description,alternates:{canonical:page.pageIdentity?.canonicalPath,languages:page.pageIdentity?.alternatePaths}};}
 const content=await feed(site.locale);return {title:content.title+' | '+site.siteName,description:content.description||site.description,alternates:pageAlternates('/link-in-bio',site.locale,site.policy,site.siteOrigin)};
}
async function Content({searchParams}:{searchParams:Promise<{cursor?:string|string[]}>}){
 if((await headers()).get('x-site-page-key')==='galerist')return <PublicPage/>;
 const [site,query]=await Promise.all([loadSiteContent(),searchParams]);if(Array.isArray(query.cursor)||query.cursor!==undefined&&(!query.cursor||query.cursor.length>4096))throw new LinkInBioError(400,'invalid_cursor');
 return <LinkInBioRoute feed={await feed(site.locale,query.cursor)} cursor={query.cursor}/>;
}
export default function Page(props:{searchParams:Promise<{cursor?:string|string[]}>}){return <Suspense fallback={null}><Content {...props}/></Suspense>;}
