import {configuredLocalePolicy,loadConfig,canonicalJson} from "@/lib/config/env";
import {privateHeaders,PublicApiError} from "@/lib/api/client";
import {getSiteContent} from "@/lib/api/site-content";
import {getPublicPresentation} from "@/lib/presentation/client";
import {getGalleryExperience} from "@/lib/artworks/server";
import {pageKeys,type PageKey} from "@/lib/presentation/types";
/** Public, uncached locale projection. No drafts, credentials or arbitrary URL relay. */
export async function GET(request:Request){
 try{
  const query=new URL(request.url).searchParams,policy=configuredLocalePolicy(loadConfig()),locale=query.get("locale"),pageKey=query.get("pageKey") as PageKey,reference=query.get("artwork");
  if([...query.keys()].some(k=>!["locale","pageKey","artwork"].includes(k))||["locale","pageKey","artwork"].some(k=>query.getAll(k).length>1)||!locale||!policy.locales.some(l=>l.code===locale)||!pageKeys.includes(pageKey)||query.has("artwork")!==(pageKey==="artworkDetail")||pageKey==="artworkDetail"&&!reference)throw new PublicApiError(400,"invalid_request");
  const [site,presentation,artwork]=await Promise.all([getSiteContent(locale),getPublicPresentation(pageKey,locale),reference?getGalleryExperience(reference,locale,request.signal):null]);
  if(site.policy.defaultLocale!==policy.defaultLocale||canonicalJson(site.policy.locales)!==canonicalJson(policy.locales)||artwork&&artwork.presentationReleaseId!==presentation.releaseId)throw new PublicApiError(503,"invalid_response");
  return Response.json({locale,messages:site.messages,presentation,artwork},{headers:privateHeaders});
 }catch(error){
  const status=error instanceof PublicApiError&&[400,404,429].includes(error.status)?error.status:503;
  return Response.json({error:{code:status===400?"invalid_request":status===404?"not_found":status===429?"rate_limited":"service_unavailable"}},{status,headers:privateHeaders});
 }
}
