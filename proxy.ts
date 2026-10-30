import {NextResponse,type NextRequest} from "next/server";
import {getGalleryExperience} from "./lib/artworks/server";
import {PublicApiError,privateHeaders} from "./lib/api/client";
import {loadConfig,configuredLocalePolicy} from "./lib/config/env";
import {classifyRoute,isTechnicalPath,localizedPath,preservedQuery} from "./lib/i18n/routes";

export async function proxy(request:NextRequest){
  const pathname=request.nextUrl.pathname,context=new Headers(request.headers);
  for(const key of ["x-site-locale","x-site-path","x-site-section","x-site-query","x-site-error","x-site-artwork-status"])context.delete(key);
  if(pathname==="/preview"||pathname.startsWith("/preview/")){
    const previewHeaders={...privateHeaders,"X-Robots-Tag":"noindex, nofollow, noarchive","Content-Security-Policy":"frame-ancestors 'self'"};
    if(!/^\/preview(?:\/(?:exchange|session|assets\/[0-9a-f-]{36}|render\/[a-z]{2,3}(?:-[a-z0-9]{2,8})*(?:\/(?:news|exhibitions|publications|expertise|contact|artworks(?:\/[a-z0-9-]{1,113})?))?))?$/.test(pathname))return new NextResponse(null,{status:404,headers:previewHeaders});
    const parts=pathname.split("/");if(parts[2]==="render"){context.set("x-site-locale",parts[3]!);context.set("x-site-path","/"+parts.slice(4).join("/"));}
    return NextResponse.next({headers:previewHeaders,request:{headers:context}});
  }
  if(isTechnicalPath(pathname))return NextResponse.next({headers:privateHeaders,request:{headers:context}});
  const policy=configuredLocalePolicy(loadConfig()),route=classifyRoute(pathname,policy);
  context.set("x-site-locale",route.locale);context.set("x-site-path",route.logicalPath);context.set("x-site-section",route.section??"");context.set("x-site-query",preservedQuery(route,request.nextUrl.searchParams));
  if(route.explicitDefault&&route.kind!=="unknown"&&route.kind!=="artwork"){
    const canonical=new URL(localizedPath(route.logicalPath,route.locale,policy.defaultLocale),request.url);canonical.search=request.nextUrl.search;
    return NextResponse.redirect(canonical,{status:308,headers:privateHeaders});
  }
  const errorKind=route.kind==="unknown"?"page":"";
  let artworkStatus:number|undefined;
  if(route.kind==="artwork")try{
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
    if(request.headers.get("rsc")==="1")return NextResponse.json({error:{code:"not_found"}},{status:404,headers:privateHeaders});
    context.set("x-site-error",errorKind);
    return NextResponse.rewrite(new URL("/_not-found",request.url),{status:404,headers:privateHeaders,request:{headers:context}});
  }
  const contactHeaders=route.section==="contact"?{...privateHeaders,"Referrer-Policy":"strict-origin","Content-Security-Policy":"form-action 'self'"}:privateHeaders;
  const target=new URL("/"+route.locale+(route.logicalPath==="/"?"":route.logicalPath),request.url);target.search=request.nextUrl.search;
  return NextResponse.rewrite(target,{status:artworkStatus===404&&request.headers.get("rsc")==="1"?200:artworkStatus,headers:contactHeaders,request:{headers:context}});
}
export const config={matcher:"/((?!_next/static|_next/image|favicon.ico).*)"};
