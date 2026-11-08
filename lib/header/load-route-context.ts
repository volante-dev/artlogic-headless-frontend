import 'server-only';
import {cache} from 'react';
import {randomUUID} from 'node:crypto';
import {headers} from 'next/headers';
import {loadSiteContent} from '../i18n/load-site-content';
import {loadPublicPresentation} from '../presentation/load-public';
import {loadPublicNavigation} from '../navigation/load-public';
import {loadPublicArticle} from '../editorial/load-article';
import {localizedPath,sections,type Section} from '../i18n/routes';
import type {HeaderRouteSnapshot} from './navigation-state';
export const loadHeaderRouteContext=cache(async():Promise<HeaderRouteSnapshot>=>{
 const context=await headers(),path=context.get('x-site-path')??'/',section=context.get('x-site-section');
 const [site,presentationRead]=await Promise.all([loadSiteContent(),context.get('x-site-error')==='page'?Promise.resolve(null):loadPublicPresentation().catch(()=>null)]);
 const result:HeaderRouteSnapshot={version:1,requestId:randomUUID(),scope:'public',site,locale:site.locale,hrefKey:localizedPath(path,site.locale,site.policy.defaultLocale)+(context.get('x-site-query')??''),pageKey:'unknown',section:sections.includes(section as Section)?section as Section:null,immersive:false,status:'ready'};
 if(context.get('x-site-error')==='page'){result.status=context.get('x-site-page-status')==='404'?'not-found':'unavailable';return result;}
 try{
  const presentation=presentationRead;if(!presentation)throw new Error('presentation_unavailable');result.presentation=presentation;result.pageKey=presentation.pageKey;result.pageIdentity=presentation.pageIdentity;
  const [navigation,article]=await Promise.all([loadPublicNavigation(site.locale,presentation.releaseId),context.get('x-site-article-id')&&!context.get('x-site-error')?loadPublicArticle():Promise.resolve(null)]);result.navigation=navigation;
  result.hrefKey=(presentation.pageIdentity?.canonicalPath??localizedPath(path,site.locale,site.policy.defaultLocale))+(context.get('x-site-query')??'');
  if(article){result.article={id:article.id,alternatePaths:article.alternatePaths};}
  result.immersive=presentation.pageKey==='home'&&(!presentation.sections.length||presentation.sections[0]?.type==='heroMedia'&&presentation.sections[0].variant==='immersive');
 }catch{result.status='unavailable';delete result.presentation;delete result.navigation;delete result.pageIdentity;delete result.article;}
 return result;
});
