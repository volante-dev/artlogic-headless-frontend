import {artworkAddressJsonResponse} from '@/lib/artworks/addresses';
import {requestRoutingPolicy,withPublicLanguageRequest,isLanguagePolicyChanged} from '@/lib/i18n/request-language';
import {PublicApiError,privateHeaders} from "@/lib/api/client";
import {getGalleryExperience} from "@/lib/artworks/server";
const messages:Record<string,string>={invalid_request:"Entrée invalide.",not_found:"Œuvre indisponible.",rate_limited:"Réessayez dans quelques instants.",service_unavailable:"Service temporairement indisponible."};
export async function GET(request:Request,{params}:{params:Promise<{artworkRef:string}>}){return withPublicLanguageRequest(()=>languageGet(request,{params}));}
async function languageGet(request:Request,{params}:{params:Promise<{artworkRef:string}>}){
 try{
  if(request.headers.has("x-artwork-address-contract")&&request.headers.get("x-artwork-address-contract")!=="1")throw new PublicApiError(400,"invalid_request");
  const url=new URL(request.url),policy=(await requestRoutingPolicy()),locale=url.searchParams.get("locale")??policy.defaultLocale;
  if([...url.searchParams.keys()].some(k=>k!=="locale")||url.searchParams.getAll("locale").length>1)throw new PublicApiError(400,"invalid_request");
  if(!policy.locales.some(l=>l.code===locale))throw new PublicApiError(404,"not_found");
  const {artworkRef}=await params,result=await getGalleryExperience(artworkRef,locale,request.signal,request.headers.get("x-artwork-address-contract")==="1");
  return artworkAddressJsonResponse(result,privateHeaders,request.headers.get("x-artwork-address-contract")==="1");
 }catch(error){if(isLanguagePolicyChanged(error))throw error;
  const status=error instanceof PublicApiError&&[400,404,429].includes(error.status)?error.status:503;
  const code=status===400?"invalid_request":status===404?"not_found":status===429?"rate_limited":"service_unavailable";
  return Response.json({error:{code,message:messages[code],requestId:crypto.randomUUID()}},{status,headers:{...privateHeaders,...(status===429?{"Retry-After":String(error instanceof PublicApiError&&error.retryAfterSeconds?error.retryAfterSeconds:60)}:{})}});
 }
}
