import {loadHeaderRouteContext} from "../../lib/header/load-route-context";
import {HeaderRouteCommit} from "../../components/header/HeaderRouteCommit";
import{articleKindDescriptors}from"../../lib/editorial/article-kind";
import {headers} from "next/headers";
import {loadConfig} from "../../lib/config/env";
import {loadSiteContent} from "../../lib/i18n/load-site-content";
import {loadPublicPresentation} from "../../lib/presentation/load-public";
import {getEditorialPage,getEditorialFilters} from "../../lib/editorial/server";
import {editorialSearchParams,parseEditorialQuery} from "../../lib/editorial/query";
import type {ArticleKind,ArticlePage,ArticleFilters} from "../../lib/editorial/types";
import {PublicApiError} from "../../lib/api/client";
import {ArticleList} from "./ArticleList";
import {PageShell} from "../PageShell";
import {PageRenderer} from "../../page-composer/PageRenderer";
import {OriginFreshnessBeacon} from "../artworks/OriginFreshnessBeacon";
import {randomUUID} from "node:crypto";
export async function EditorialListPage({kind,searchParams}:{kind:ArticleKind;searchParams:Promise<Record<string,string|string[]|undefined>>}){
 if(loadConfig().EDITORIAL_ENABLED!=="true")return <PageShell section={articleKindDescriptors[kind].section}/>;
 const site=await loadSiteContent(),presentation=await loadPublicPresentation();let query;try{query=parseEditorialQuery(editorialSearchParams(await searchParams));}catch{return <><ArticleList kind={kind} initialPage={null} initialFilters={null} initialQuery={{page:1,pageSize:24}} initialError="invalid_request"/><HeaderRouteCommit snapshot={await loadHeaderRouteContext()}/></>;}
 let page:ArticlePage|null=null,filters:ArticleFilters|null=null,error:string|undefined;
 const locale=(await headers()).get("x-site-locale")??site.locale,results=await Promise.allSettled([getEditorialPage(kind,locale,query),getEditorialFilters(kind,locale)]);
 if(results[0].status==="fulfilled")page=results[0].value;else error=results[0].reason instanceof PublicApiError?results[0].reason.code:"service_unavailable";
 if(results[1].status==="fulfilled")filters=results[1].value;else error??="service_unavailable";
 return <><ArticleList kind={kind} initialPage={page} initialFilters={filters} initialQuery={query} initialError={error}/>{presentation.sections.length>0&&<PageRenderer presentation={presentation} siteName={site.siteName} includePageTitle={false}/>}<OriginFreshnessBeacon nonce={randomUUID()}/><HeaderRouteCommit snapshot={await loadHeaderRouteContext()}/></>;
}
