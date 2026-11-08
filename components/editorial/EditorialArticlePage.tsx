import {loadHeaderRouteContext} from "../../lib/header/load-route-context";
import {HeaderRouteCommit} from "../../components/header/HeaderRouteCommit";
import {loadPublicArticle} from "../../lib/editorial/load-article";
import {loadSiteContent} from "../../lib/i18n/load-site-content";
import {PublicArticleDocument} from "./PublicArticleDocument";
import {OriginFreshnessBeacon} from "../artworks/OriginFreshnessBeacon";
import {randomUUID} from "node:crypto";
export async function editorialArticleMetadata(){const article=await loadPublicArticle(),site=await loadSiteContent();return {title:article.title+" — "+site.siteName,description:article.summary?.trim()||site.description,alternates:{canonical:article.canonicalPath,languages:article.alternatePaths},openGraph:{type:"article" as const,title:article.title,description:article.summary?.trim()||site.description,url:article.canonicalPath,images:article.cover?[{url:new URL(article.cover.srcPath,site.siteOrigin).toString(),alt:article.cover.alt}]:[]}};}
export async function EditorialArticlePage(){const article=await loadPublicArticle();return <><PublicArticleDocument article={article}/><OriginFreshnessBeacon nonce={randomUUID()}/><HeaderRouteCommit snapshot={await loadHeaderRouteContext()}/></>;}
