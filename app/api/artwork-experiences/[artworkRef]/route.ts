import {configuredLocalePolicy,loadConfig} from "@/lib/config/env";
import {PublicApiError,privateHeaders} from "@/lib/api/client";
import {getGalleryExperience} from "@/lib/artworks/server";
const messages:Record<string,string>={invalid_request:"Entrée invalide.",not_found:"Œuvre indisponible.",rate_limited:"Réessayez dans quelques instants.",service_unavailable:"Service temporairement indisponible."};
export async function GET(request:Request,{params}:{params:Promise<{artworkRef:string}>}){
 try{
  const url=new URL(request.url),policy=configuredLocalePolicy(loadConfig()),locale=url.searchParams.get("locale")??policy.defaultLocale;
  if([...url.searchParams.keys()].some(k=>k!=="locale")||url.searchParams.getAll("locale").length>1)throw new PublicApiError(400,"invalid_request");
  if(!policy.locales.some(l=>l.code===locale))throw new PublicApiError(404,"not_found");
  const {artworkRef}=await params,result=await getGalleryExperience(artworkRef,locale,request.signal);
  return Response.json(result,{headers:privateHeaders});
 }catch(error){
  const status=error instanceof PublicApiError&&[400,404,429].includes(error.status)?error.status:503;
  const code=status===400?"invalid_request":status===404?"not_found":status===429?"rate_limited":"service_unavailable";
  return Response.json({error:{code,message:messages[code],requestId:crypto.randomUUID()}},{status,headers:{...privateHeaders,...(status===429?{"Retry-After":String(error instanceof PublicApiError&&error.retryAfterSeconds?error.retryAfterSeconds:60)}:{})}});
 }
}
