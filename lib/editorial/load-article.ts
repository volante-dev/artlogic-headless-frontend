import "server-only";
import {cache} from "react";
import {connection} from "next/server";
import {headers} from "next/headers";
import {notFound,redirect} from "next/navigation";
import {configuredLocalePolicy,loadConfig} from "../config/env";
import {classifyRoute} from "../i18n/routes";
import {PublicApiError} from "../api/client";
import {getEditorialArticle} from "./server";
/** Request-scoped sharing for metadata, navigation and body; never a permission cache. */
export const loadPublicArticle=cache(async()=>{
 await connection();const context=await headers(),policy=configuredLocalePolicy(loadConfig()),locale=context.get("x-site-locale")??policy.defaultLocale,path=context.get("x-site-path")??"/",route=classifyRoute((locale===policy.defaultLocale?"":"/"+locale)+path,policy);if(route.kind!=="article")notFound();
 let article;try{article=await getEditorialArticle(route.articleKind!,route.articleSlug!,locale);}catch(error){if(error instanceof PublicApiError&&error.status===404)notFound();throw error;}if("resolution" in article)redirect(article.canonicalPath);return article;
});
