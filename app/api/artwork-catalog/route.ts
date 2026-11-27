import {artworkAddressJsonResponse} from '@/lib/artworks/addresses';
import {requestRoutingPolicy,withPublicLanguageRequest,isLanguagePolicyChanged} from '@/lib/i18n/request-language';
import {privateHeaders,PublicApiError} from "@/lib/api/client";
import {parseCatalogQuery,type CatalogParams} from "@/lib/artworks/catalog-query";
import {getGalleryCatalog} from "@/lib/artworks/server";

/** Public JSON only, using the same validation and fixed origin as the SSR catalogue. */
export async function GET(request:Request){return withPublicLanguageRequest(()=>languageGet(request));}
async function languageGet(request:Request){
 try{
  if(request.headers.has("x-artwork-address-contract")&&request.headers.get("x-artwork-address-contract")!=="1")throw new PublicApiError(400,"invalid_request");
  const params=new URL(request.url).searchParams,policy=(await requestRoutingPolicy());
  if(params.getAll("locale").length!==1)throw new PublicApiError(400,"invalid_request");
  const locale=params.get("locale")!;params.delete("locale");
  if(!policy.locales.some(item=>item.code===locale))throw new PublicApiError(400,"invalid_request");
  const input:CatalogParams={};for(const key of params.keys())input[key]=params.getAll(key).length===1?params.get(key)!:params.getAll(key);
  let query;try{query=parseCatalogQuery(input);}catch{throw new PublicApiError(400,"invalid_request");}
  if(query.kind!=="numbered")throw new PublicApiError(400,"invalid_request");
  return artworkAddressJsonResponse(await getGalleryCatalog({...query.query,locale},true,request.signal,request.headers.get("x-artwork-card-focus")==="1",request.headers.get("x-artwork-address-contract")==="1"),privateHeaders,request.headers.get("x-artwork-address-contract")==="1");
 }catch(error){if(isLanguagePolicyChanged(error))throw error;
  const status=error instanceof PublicApiError&&[400,409,429].includes(error.status)?error.status:503;
  const code=status===400?"invalid_request":status===409?"catalog_changed":status===429?"rate_limited":"service_unavailable";
  return Response.json({error:{code,requestId:crypto.randomUUID()}},{status,headers:{...privateHeaders,...(status===429?{"Retry-After":String(error instanceof PublicApiError?error.retryAfterSeconds??60:60)}:{})}});
 }
}
