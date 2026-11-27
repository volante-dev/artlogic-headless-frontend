import {artworkAddressJsonResponse} from '@/lib/artworks/addresses';
import {requestRoutingPolicy,withPublicLanguageRequest,isLanguagePolicyChanged} from '@/lib/i18n/request-language';
import {getPublicNavigation} from "@/lib/navigation/client";
import{kindForSection}from"@/lib/editorial/article-kind";
import {getEditorialAddress,getEditorialArticle,getEditorialPage,getEditorialFilters} from "@/lib/editorial/server";
import {parseEditorialQuery} from "@/lib/editorial/query";
import {loadConfig,canonicalJson} from "@/lib/config/env";
import {privateHeaders,PublicApiError} from "@/lib/api/client";
import {getSiteContent} from "@/lib/api/site-content";
import {getPublicPresentation} from "@/lib/presentation/client";
import {getGalleryExperience,resolveArtworkAddress} from "@/lib/artworks/server";
import {isContactArtworkId} from "@/lib/contact/artwork";
import {pageKeys,type PageKey} from "@/lib/presentation/types";
/** Public, uncached locale projection. No drafts, credentials or arbitrary URL relay. */
export async function GET(request:Request){return withPublicLanguageRequest(()=>languageGet(request));}
async function languageGet(request:Request){
 try{
  if(request.headers.has("x-artwork-address-contract")&&request.headers.get("x-artwork-address-contract")!=="1")throw new PublicApiError(400,"invalid_request");
  const addressOptIn=request.headers.get("x-artwork-address-contract")==="1";
  const query=new URL(request.url).searchParams,policy=(await requestRoutingPolicy()),locale=query.get("locale"),pageKey=query.get("pageKey") as PageKey,reference=query.get("artwork"),articleId=query.get("article"),expectedReleaseId=query.get("expectedReleaseId")??undefined;
  if([...query.keys()].some(k=>!["artworkLocale","expectedReleaseId","locale","pageKey","artwork","article","q","termIds","page","pageSize","catalogRevision"].includes(k))||["expectedReleaseId","locale","pageKey","artwork","article","q","page","pageSize","catalogRevision"].some(k=>query.getAll(k).length>1)||!locale||!policy.locales.some(l=>l.code===locale)||!pageKeys.includes(pageKey)||query.has("artwork")&&(!["artworkDetail","contact"].includes(pageKey)||!reference)||pageKey==="artworkDetail"&&!reference||pageKey==="contact"&&reference!==null&&!isContactArtworkId(reference))throw new PublicApiError(400,"invalid_request");
  if(pageKey==="galerist"&&(!expectedReleaseId||!/^[0-9a-f-]{36}$/i.test(expectedReleaseId)))throw new PublicApiError(400,"invalid_request");
  const editorial=loadConfig().EDITORIAL_ENABLED==="true"&&Boolean(kindForSection(pageKey)),listQuery=new URLSearchParams(query);for(const key of ["artworkLocale","expectedReleaseId","locale","pageKey","artwork","article"])listQuery.delete(key);if(articleId&&(!editorial||reference||listQuery.size)||!editorial&&listQuery.size)throw new PublicApiError(400,"invalid_request");
  let article=null,editorialPage=null,editorialFilters=null,editorialQuery=null;
  if(articleId){const address=await getEditorialAddress(articleId,locale),parts=address.canonicalPath.split("/");article=await getEditorialArticle(kindForSection(pageKey)!,decodeURIComponent(parts.at(-1)!),locale,addressOptIn);if("resolution" in article||article.id!==articleId||article.kind!==(kindForSection(pageKey)!))throw new PublicApiError(503,"invalid_response");}
  else if(editorial){let criteria;try{criteria=parseEditorialQuery(listQuery);}catch{throw new PublicApiError(400,"invalid_request");}[editorialPage,editorialFilters]=await Promise.all([getEditorialPage(kindForSection(pageKey)!,locale,criteria,addressOptIn),getEditorialFilters(kindForSection(pageKey)!,locale)]);editorialQuery={...criteria,catalogRevision:editorialPage.catalogRevision};}
  async function localizedPresentation(){
   try{return await getPublicPresentation(pageKey,locale!,expectedReleaseId,undefined,addressOptIn);}
   catch(error){if(isLanguagePolicyChanged(error))throw error;
    if(pageKey!=="galerist"||!(error instanceof PublicApiError)||error.status!==409)throw error;
    // A publication may occur while this mounted page is open. Resolve the current
    // release again, then bind the new language to it; never serve a historical one.
    const current=await getPublicPresentation("home",locale!,undefined,undefined,addressOptIn);
    return getPublicPresentation("galerist",locale!,current.releaseId,undefined,addressOptIn);
   }
  }
  const originLocale=query.get("artworkLocale");
  if(originLocale&&(!addressOptIn||!reference||!policy.locales.some(l=>l.code===originLocale)||query.getAll("artworkLocale").length!==1))throw new PublicApiError(400,"invalid_request");
  const resolvedReference=reference&&originLocale?(await resolveArtworkAddress(reference,originLocale,request.signal))?.address.artworkId??reference:reference;
  const [site,presentation,artwork]=await Promise.all([getSiteContent(locale),localizedPresentation(),resolvedReference?getGalleryExperience(resolvedReference,locale,request.signal,addressOptIn):null]);
  if(site.policy.defaultLocale!==policy.defaultLocale||canonicalJson(site.policy.locales)!==canonicalJson(policy.locales)||artwork&&artwork.presentationReleaseId!==presentation.releaseId)throw new PublicApiError(503,"invalid_response");
  const navigation=await getPublicNavigation(locale,presentation.releaseId);
  const legacyPresentation={...presentation};delete legacyPresentation.teamExtension;
  const negotiatedPresentation=request.headers.get("x-presentation-team")==="1"?presentation:legacyPresentation;
  return artworkAddressJsonResponse({navigation,locale,messages:site.messages,...(site.runtime?{runtime:site.runtime}:{}),...(site.languagePolicy?{languagePolicy:site.languagePolicy}:{}),presentation:negotiatedPresentation,artwork,article,editorialPage,editorialFilters,editorialQuery},privateHeaders,addressOptIn);
 }catch(error){if(isLanguagePolicyChanged(error))throw error;
  const status=error instanceof PublicApiError&&[400,404,429].includes(error.status)?error.status:503;
  return Response.json({error:{code:status===400?"invalid_request":status===404?"not_found":status===429?"rate_limited":"service_unavailable"}},{status,headers:privateHeaders});
 }
}
