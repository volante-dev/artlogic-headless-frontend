import {validGaleristSlug,isReservedGaleristSlug} from "./lib/presentation/galerist-slug.generated";
import{previewFramePolicy}from"./lib/presentation/preview-policy";
import {NextResponse,type NextRequest} from "next/server";
import {PublicApiError,privateHeaders} from "./lib/api/client";
import {loadConfig,configuredLocalePolicy,listValue} from "./lib/config/env";
import {classifyRoute,isTechnicalPath,localizedPath,preservedQuery} from "./lib/i18n/routes";

export async function proxy(request:NextRequest){
  const pathname=request.nextUrl.pathname,context=new Headers(request.headers);
  for(const key of ["x-site-page-status","x-site-page-key","x-site-page-release-id","x-site-page-canonical","x-site-locale","x-site-path","x-site-section","x-site-query","x-site-error","x-site-artwork-status","x-site-article-id","x-site-article-status"])context.delete(key);
  if(pathname==="/preview"||pathname.startsWith("/preview/")){
    const previewHeaders={...privateHeaders,"X-Robots-Tag":"noindex, nofollow, noarchive","Content-Security-Policy":previewFramePolicy()};
    if(!/^\/preview(?:\/(?:exchange|session|editorial\/[0-9a-f-]{36}|editorial-assets\/[0-9a-f-]{36}|assets\/[0-9a-f-]{36}|render\/[a-z]{2,3}(?:-[a-z0-9]{2,8})*(?:\/(?:galerist|news|exhibitions|publications|expertise|contact|artworks(?:\/[a-z0-9-]{1,113})?))?))?$/.test(pathname))return new NextResponse(null,{status:404,headers:previewHeaders});
    const parts=pathname.split("/");if(parts[2]==="render"){context.set("x-site-locale",parts[3]!);context.set("x-site-path","/"+parts.slice(4).join("/"));}
    return NextResponse.next({headers:previewHeaders,request:{headers:context}});
  }
  if(isTechnicalPath(pathname))return NextResponse.next({headers:privateHeaders,request:{headers:context}});
  const policy=configuredLocalePolicy(loadConfig()),route=classifyRoute(pathname,policy);
  const publicQuery=new URLSearchParams(request.nextUrl.searchParams);publicQuery.delete("_rsc");
  context.set("x-site-locale",route.locale);context.set("x-site-path",route.logicalPath);context.set("x-site-section",route.section??"");context.set("x-site-query",preservedQuery(route,publicQuery));
  if(route.explicitDefault&&route.kind!=="unknown"&&route.kind!=="artwork"&&route.kind!=="article"){
    const canonical=new URL(localizedPath(route.logicalPath,route.locale,policy.defaultLocale),request.url);canonical.search=request.nextUrl.search;
    return NextResponse.redirect(canonical,{status:308,headers:privateHeaders});
  }
  if(route.kind==="unknown"){
    let slug="";try{slug=decodeURIComponent(route.logicalPath.slice(1));}catch{/* Invalid encoding remains a not-found candidate. */}
    if(validGaleristSlug(slug)&&!isReservedGaleristSlug(slug,policy.locales.map(l=>l.code))){
      try{
        const {getPresentationAddress}=await import("./lib/presentation/client");
        const result=await getPresentationAddress(slug,route.locale);
        if(result.kind==="redirect"||route.explicitDefault||pathname!==result.canonicalPath){const target=new URL(result.canonicalPath,request.url);target.search=request.nextUrl.search;return NextResponse.redirect(target,{status:308,headers:privateHeaders});}
        context.set("x-site-page-key","galerist");context.set("x-site-page-release-id",result.releaseId);context.set("x-site-page-canonical",result.canonicalPath);
        return NextResponse.rewrite(new URL("/"+route.locale+route.logicalPath+request.nextUrl.search,request.url),{headers:privateHeaders,request:{headers:context}});
      }catch(error){if(!(error instanceof PublicApiError)||error.status!==404){context.set("x-site-error","page");context.set("x-site-page-status","503");return NextResponse.rewrite(new URL("/"+route.locale+route.logicalPath,request.url),{status:request.headers.get("rsc")==="1"?200:503,headers:privateHeaders,request:{headers:context}});}}
    }
  }
  const errorKind=route.kind==="unknown"?"page":"";
  let artworkStatus:number|undefined;
  if(route.kind==="article")try{
    const {getEditorialArticle}=await import("./lib/editorial/server");
    const article=await getEditorialArticle(route.articleKind!,route.articleSlug!,route.locale),canonical=article.canonicalPath;
    if("resolution" in article||route.explicitDefault||pathname!==canonical){const target=new URL(canonical,request.url);if(request.nextUrl.searchParams.get("reader")==="native")target.searchParams.set("reader","native");return NextResponse.redirect(target,{status:308,headers:privateHeaders});}
    if(request.nextUrl.searchParams.get("reader")==="native"){const {renderNativeEditorialArticle}=await import("./lib/editorial/native-reader");const {nativeImageDescriptors}=await import("./lib/media/native-image-descriptors");return new NextResponse(renderNativeEditorialArticle(article,route.locale,await nativeImageDescriptors(article)),{headers:{...privateHeaders,"Content-Type":"text/html; charset=utf-8","Content-Security-Policy":"default-src 'none'; img-src 'self' "+listValue(loadConfig(),"PUBLIC_MEDIA_DELIVERY_ORIGINS_JSON").join(" ")+"; media-src 'self'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'"}});}
    context.set("x-site-article-id",article.id);
  }catch(error){
    const status=error instanceof PublicApiError&&error.status===404?404:503;context.set("x-site-article-status",String(status));
    if(status===404){context.set("x-site-error","article");if(request.headers.get("rsc")==="1")return NextResponse.json({error:{code:"not_found"}},{status:404,headers:privateHeaders});return NextResponse.rewrite(new URL("/_not-found",request.url),{status:404,headers:privateHeaders,request:{headers:context}});}
    return NextResponse.rewrite(new URL("/"+route.locale+route.logicalPath,request.url),{status:503,headers:privateHeaders,request:{headers:context}});
  }
  if(route.kind==="artwork")try{
    const {getGalleryExperience}=await import("./lib/artworks/server");
    const {artwork}=await getGalleryExperience(route.artworkId!,route.locale);
    if(route.artworkId!==artwork.slug||route.explicitDefault){
      const canonical=new URL(localizedPath("/artworks/"+artwork.slug,route.locale,policy.defaultLocale),request.url);
      return NextResponse.redirect(canonical,{status:308,headers:privateHeaders});
    }
  }catch(error){
    artworkStatus=error instanceof PublicApiError&&error.status===404?404:503;context.set("x-site-artwork-status",String(artworkStatus));
    if(artworkStatus===404){context.set("x-site-error","artwork");if(request.headers.get("rsc")!=="1")return NextResponse.rewrite(new URL("/_not-found",request.url),{status:404,headers:privateHeaders,request:{headers:context}});}
  }
  if(errorKind){
    context.set("x-site-error",errorKind);context.set("x-site-page-status","404");
    if(request.headers.get("rsc")==="1")return NextResponse.rewrite(new URL("/"+route.locale+route.logicalPath,request.url),{status:200,headers:privateHeaders,request:{headers:context}});
    return NextResponse.rewrite(new URL("/_not-found",request.url),{status:404,headers:privateHeaders,request:{headers:context}});
  }
  const contactHeaders=route.section==="contact"?{...privateHeaders,"Referrer-Policy":"strict-origin","Content-Security-Policy":"form-action 'self'"}:privateHeaders;
  const target=new URL("/"+route.locale+(route.logicalPath==="/"?"":route.logicalPath),request.url);target.search=request.nextUrl.search;
  return NextResponse.rewrite(target,{status:artworkStatus===404&&request.headers.get("rsc")==="1"?200:artworkStatus,headers:contactHeaders,request:{headers:context}});
}
export const config={matcher:"/((?!_next/static|_next/image|fonts/|favicon.ico).*)"};
